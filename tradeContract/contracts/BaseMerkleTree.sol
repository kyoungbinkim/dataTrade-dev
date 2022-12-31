// Copyright (c) 2015-2020 Clearmatics Technologies Ltd
// Copyright (c) 2021-2021 Zkrypto Inc.
// SPDX-License-Identifier: LGPL-3.0+

pragma solidity ^0.8.2;

/// Abstract Merkle tree implementation. Child classes should implement the
/// hash function.
///
/// The Merkle tree implementation must trade-off complexity, storage,
/// initialization cost, and update & root computation cost.
///
/// This implementation stores all leaves and nodes, skipping those that have
/// not been populated yet. The final entry in each layer stores that layer's
/// default value.
abstract contract BaseMerkleTree
{
    // Depth of the merkle tree
    uint256 internal _DEPTH;

    // hash types are defined as below
    // 1: MiMC7, 2: SHA256, 3: Poseidon
    uint256 internal _HASH_TYPE; 

    // Number of leaves
    uint256 internal _MAX_NUM_LEAVES;

    // Number of nodes
    uint256 internal _MAX_NUM_NODES;

    uint256 internal constant _MASK_LS_BIT = ~uint256(1);

    bytes32 internal constant _DEFAULT_NODE_VALUE = 0x0;

    mapping(uint256 => bytes32) public _nodes;

    bytes32[] internal _default_values; 

    // Number of leaves populated in `nodes`.
    uint256 internal _num_leaves;

    // Debug only
    event LogDebug(bytes32 message);

    /// Constructor
    constructor(uint256 tree_depth, uint256 hash_type) {
        _HASH_TYPE = hash_type;
        _DEPTH = tree_depth;
        _MAX_NUM_LEAVES = 2**_DEPTH;
        _MAX_NUM_NODES = (_MAX_NUM_LEAVES * 2) - 1;
        _default_values = new bytes32[](_DEPTH);
        _initDefaultValues();
    }

    function _initDefaultValues() private {
        _default_values[0] = _DEFAULT_NODE_VALUE;
        for(uint i =1;i<_DEPTH;i++){
            // Store default values for each layer
            _default_values[i] = _hash(_default_values[i-1],_default_values[i-1]);
        }
        // Initialize default root
        _nodes[0] = _hash(_default_values[_DEPTH - 1], _default_values[_DEPTH - 1]);
    }

    /// Appends a commitment to the tree, and returns its address
    function _insert(bytes32 commitment) internal {
        // If this require fails => the merkle tree is full, we can't append
        // leaves anymore.
        require(
            _num_leaves < _MAX_NUM_LEAVES,
            "BaseMerkleTree: Cannot append anymore"
        );

        // Address of the next leaf is the current number of leaves (before
        // insertion).  Compute the next index in the full set of nodes, and
        // write.
        uint256 next_address = _num_leaves;
        ++_num_leaves;
        uint256 next_entry_idx = (_MAX_NUM_LEAVES - 1) + next_address;

        _nodes[next_entry_idx] = commitment;
    }

    /// Abstract hash function to be supplied by a concrete implementation of
    /// this class.
    function _hash(bytes32 left, bytes32 right) internal virtual returns (bytes32);

    function _recomputeRoot(uint num_new_leaves) internal returns (bytes32) {
        // Assume `num_new_leaves` have been written into the leaf slots.
        // Update any affected nodes in the tree, up to the root, using the
        // default values for any missing nodes.

        uint256 end_idx = _num_leaves;
        uint256 start_idx = _num_leaves - num_new_leaves;

        for (uint256 i = 0; i < _DEPTH; i++) {
            (start_idx, end_idx) =
                _recomputeParentLayer(i, start_idx, end_idx);
        }

        return _nodes[0];
    }

    /// Recompute nodes in the parent layer that are affected by entries
    /// [child_start_idx, child_end_idx] in the child layer.  If
    /// `child_end_idx` is required in the calculation, the final entry of
    /// the child layer is used (since this contains the default entry for
    /// the layer if the tree is not full).
    ///
    ///            /     \         /     \         /     \
    /// Parent:   ?       ?       F       G       H       0
    ///          / \     / \     / \     / \     / \     / \
    /// Child:  ?   ?   ?   ?   A   B   C   D   E   ?   ?   0
    ///                         ^                   ^
    ///                child_start_idx         child_end_idx
    ///
    /// Returns the start and end indices (within the parent layer) of touched
    /// parent nodes.
    function _recomputeParentLayer(
        uint256 child_layer,
        uint256 child_start_idx,
        uint256 child_end_idx
    )
        private
        returns (uint256, uint256)
    {
        uint256 child_layer_start = 2**(_DEPTH - child_layer) - 1;

        // Start at the right and iterate left, so we only execute the
        // default_value logic once.  child_left_idx_rend (reverse-end) is the
        // smallest value of child_left_idx at which we should recompute the
        // parent node hash.

        uint256 child_left_idx_rend =
            child_layer_start + (child_start_idx & _MASK_LS_BIT);

        // If child_end_idx is odd, it is the RIGHT of a computation we need
        // to make. Do the computation using the default value, and move to
        // the next pair (on the left).
        // Otherwise, we have a fully populated pair.

        uint256 child_left_idx;
        if ((child_end_idx & 1) != 0) { // odd
            child_left_idx = child_layer_start + child_end_idx - 1;
            _nodes[(child_left_idx - 1) / 2] =
                _hash(_nodes[child_left_idx], _default_values[child_layer]);
        } else { //  even
            child_left_idx = child_layer_start + child_end_idx;
        }

        // At this stage, pairs are all populated. Compute until we reach
        // child_left_idx_rend.

        while (child_left_idx > child_left_idx_rend) {
            child_left_idx = child_left_idx - 2;
            _nodes[(child_left_idx - 1) / 2] =
                _hash(_nodes[child_left_idx], _nodes[child_left_idx + 1]);
        }

        return (child_start_idx / 2, (child_end_idx + 1) / 2);
    }

    function _computeMerklePath(uint256 index) public view returns (bytes32[] memory) {
        // Given an index into leaves of a Merkle tree, compute the path to the root.
        bytes32[] memory merkle_path = new bytes32[](_DEPTH);

        for (uint256 i = 0; i < _DEPTH; i++) {
            if (index & 0x01 != 0) {
                merkle_path[i] = _getNode(index - 1, i);
            }
            else {
                merkle_path[i] = _getNode(index + 1, i);
            }
            index >>= 1;
        }

        return merkle_path;
    }

    function _getNode(uint256 index, uint256 layer) private view returns (bytes32) {
        if (_nodes[2**(_DEPTH - layer) - 1 + index] == _DEFAULT_NODE_VALUE) {
            return _default_values[layer];
        }
        return _nodes[2**(_DEPTH - layer) - 1 + index];
    }
   
}
