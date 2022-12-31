// Copyright (c) 2015-2020 Clearmatics Technologies Ltd
// Copyright (c) 2021-2021 Zkrypto Inc.
// SPDX-License-Identifier: LGPL-3.0+

pragma solidity ^0.8.2;
pragma experimental ABIEncoderV2;

// import "./MixerBase.sol";
import "./zklayBase.sol";
import "./MiMC7.sol";
import "./sha.sol";
import "./Poseidon2.sol";

/// Partial implementation of abstract MixerBase which implements the
/// curve-specific methods to use the ALT-BN128 pairing.
abstract contract BLS12_381MixerBase is ZklayBase
{
    /// Constructor of the contract
    constructor(
        uint256 mk_depth,
        address token,
        uint256[] memory vk,
        uint256 hash_type
    )
        ZklayBase(mk_depth, token, vk, hash_type)
    {
    }

    /// The Merkle tree hash functions.
    function _hash(bytes32 left, bytes32 right) internal override returns (bytes32) {
        if (_HASH_TYPE == uint256(1)) {
            return MiMC7._hash(left, right);
        }
        else if(_HASH_TYPE ==uint256(2)){
            return SHA256._hash(left, right);
        }
        else if (_HASH_TYPE == uint256(3)) {
            return Poseidon2._hash(left, right);
        }
    }
}
