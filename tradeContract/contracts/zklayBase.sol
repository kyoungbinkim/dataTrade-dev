// Copyright (c) 2015-2020 Clearmatics Technologies Ltd
// Copyright (c) 2021-2021 Zkrypto Inc.
// SPDX-License-Identifier: LGPL-3.0+

pragma solidity ^0.8.2;

import "./Tokens.sol";
import "./BaseMerkleTree.sol";

/// MixerBase implements the functions shared across all Mixers (regardless
/// which zkSNARK is used)
abstract contract ZklayBase is BaseMerkleTree, ERC223ReceivingContract
{
    struct ENA {
        uint256 r;
        uint256 ct;
    }

    // The roots of the different updated trees
    mapping(uint256 => bool) private _roots;

    // The public list of nullifiers (prevents double spend)
    mapping(uint256 => bool) private _nullifiers;
    
    // The auditor's public key
    uint256 private _APK;

    // The Most recent root of the Merkle tree
    uint256 private _root_top;

    // The public list of user address 
    mapping (bytes32 => bool) private _addr_list; 

    // The public list of users' encrypted accounts
    mapping (bytes32 => ENA) private _ENA;

    // Structure of the verification key and proofs is opaque, determined by
    // zk-snark verification library.
    uint256[] internal _vk;

    // Contract variable that indicates the address of the token contract
    // If token = address(0) then the mixer works with ether
    address private _token;

    // The number of inputs for a zk-SNARK proof
    uint256 internal constant _NUM_INPUTS = 20;

    // The unit used for public values (ether in and out), in Wei. 
    // Must match the python wrappers.
    uint64 private constant _PUBLIC_UNIT_VALUE_WEI = 1;

    // The unit used for public values (ether in and out), in Ether. 
    // Must match the python wrappers.
    uint64 private constant _PUBLIC_UNIT_VALUE_ETHER = _PUBLIC_UNIT_VALUE_WEI * (10**18);

    event LogTrans(
        uint256 root,
        uint256 nullifier,
        uint256 com,
        uint256 addr,
        uint256 c_0,
        uint256 c_1,
        uint256 c_2,
        uint256 c_3_0,
        uint256 c_3_1,
        uint256 c_3_2
    );

    event LogUserAddr(
        bytes32 pk
    );

    event LogDebugTree(
        uint256 root
    );

    /// Constructor
    constructor(uint256 depth, address token_address, uint256[] memory vk, uint256 hash_type)
        BaseMerkleTree(depth, hash_type)
    {
        uint256 initial_root = uint256(_nodes[0]);
        _roots[initial_root] = true;
        _root_top = initial_root;
        _vk = vk;
        _token = token_address;

        emit LogDebugTree(
            initial_root
        );
    }

    function getCiphertext(bytes32 addr) public view returns (uint256, uint256) {
        require(_addr_list[addr] == true, 
            "Invalid User: The user isn't in the user list. Thus, the user have to init"
        );
        
        return (_ENA[addr].ct, _ENA[addr].r);
    }

    function getAPK() public view returns (uint256) {
        require(
            _APK != 0,
            "APK does not exist"
        );
        
        return _APK;
    }

    function registerUser(bytes32 addr) public {
        _addr_list[addr] = true;

        emit LogUserAddr(
            addr
        );
    }

    function registerAuditor(uint256 apk) public {
        require(
            _APK == 0,
            "APK already exists"
        );
        _APK = apk;
    }

    function getRootTop() public view returns (uint256) {
        return _root_top;
    }

    function getMerklePath(uint256 index) public view returns (uint256[] memory) {
        bytes32[] memory merkle_path_bytes =  _computeMerklePath(index);
        uint256[] memory merkle_path = new uint256[](_DEPTH);

        for (uint256 i=0; i < merkle_path_bytes.length; i++) {
            merkle_path[i] = uint256(merkle_path_bytes[i]);
        }

        return merkle_path;
    }

    function zkTransfer(
        uint256[] memory proof,
        uint256 rt,
        uint256 nf,
        uint256[3] memory pk, // addr, k_b, k_u
        uint256 cm,
        uint256[2] memory ct, //  ct[0] -> r, ct[1] -> ct
        uint256[2] memory values, // pv , pv'
        uint256[6] memory CT, //  G^r, K_u, K_a, CT[3]
        address toEoA
    )
    public
    payable
    {
        // 1. Get the auditor key.
        require(
            _APK != 0,
            "Invalid process: APK does not exist in the auditor list"
        );

        // 2. Check the root and the nullifiers.
        require(
            _roots[rt],
            "Invalid root : This root is not valid root"
        );

        require(
            !_nullifiers[nf]
            , 
            "Invalid nullifier: This nullifier has already been used"
        );

        // 3. Check the user address is in the list.
        require(
            _addr_list[bytes32(pk[0])],
            "Invalid User: The user isn`t in the user list"
        );

        // 4. Verify a zk-SNARK proof. 
        uint256[_NUM_INPUTS] memory INPUT = [
            1,
            _APK,
            rt,
            nf,
            pk[0], pk[1], pk[2],
            cm,
            _ENA[bytes32(pk[0])].r, _ENA[bytes32(pk[0])].ct,
            ct[0], ct[1],
            values[0],
            values[1],
            CT[0], CT[1], CT[2], CT[3], CT[4], CT[5]
        ];

        require(
            _verifyZKProof(proof, INPUT),
            "Invalid proof: Unable to verify the proof correctly"
        );

        // 5. Compute a new merkle root, Update root_list.
        // rt' <- add_and_update(commit_list, c')
        // root_list.append(rt')
        _insert(bytes32(cm));
        uint256 new_merkle_root = uint256(_recomputeRoot(1));
        _addRoot(new_merkle_root);
        
        // 6. Update a nullifier list by appending a new nf.
        // nf_list.append(nf)
        _nullifiers[nf] = true;
        
        emit LogTrans(
            new_merkle_root,
            nf,
            cm,
            pk[0],
            CT[0], // c_0
            CT[1], // c_1
            CT[2], // c_2
            CT[3], // c_3_0
            CT[4], // c_3_1
            CT[5] //  c_3_2
        );

        _processPublicValues(values, toEoA);    

        // 10. Update a ciphertext of ENA as follows.
        // ENA[addr] <- ct'
        _ENA[bytes32(pk[0])] = ENA(ct[0], ct[1]);
    }

    // Implementations must implement the verification algorithm of the
    // selected SNARK.
    function _verifyZKProof(
        uint256[] memory proof,
        uint256[_NUM_INPUTS] memory inputs
    )
        internal
        virtual
        returns (bool);

    function _addRoot(uint256 rt) private {
        _roots[rt] = true;
        _root_top = rt;
    }

    function _processPublicValues(uint256[2] memory inputs, address EOA)
        private
    {

        uint256 vpub_in = inputs[0];
        uint256 vpub_out = inputs[1];

        // If the vpub_in is > 0, we need to make sure the right amount is paid
        if (vpub_in > 0) {
            if (_token != address(0)) {
                ERC20 erc20Token = ERC20(_token);
                erc20Token.transferFrom(msg.sender, address(this), vpub_in);
            } else { 
                vpub_in *= _PUBLIC_UNIT_VALUE_ETHER;
                require(
                    msg.value == vpub_in,
                    "Wrong msg.value: Value paid is not correct"
                );
            }
        } else {
            // If vpub_in = 0, return incoming Ether to the caller
            if (msg.value > 0) {
                // solhint-disable-next-line
                (bool success, ) = msg.sender.call{value : msg.value}(""); // transfer
                require(success, "vpub_in return transfer failed");
            }
        }

        // If value_pub_out > 0 then we do a withdraw.  We retrieve the
        // msg.sender and send him the appropriate value IF proof is valid
        if (vpub_out > 0) {
            if (_token != address(0)) {
                ERC20 erc20Token = ERC20(_token);
                erc20Token.transfer(EOA, vpub_out);
            } else {
                // solhint-disable-next-line
                vpub_out *= _PUBLIC_UNIT_VALUE_ETHER;
                payable(EOA).transfer(vpub_out);
            }
        }
    }
}
