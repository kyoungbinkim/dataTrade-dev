// Copyright (c) 2015-2020 Clearmatics Technologies Ltd
// Copyright (c) 2021-2021 Zkrypto Inc.
// SPDX-License-Identifier: LGPL-3.0+

pragma solidity ^0.8.2;
pragma experimental ABIEncoderV2;

import "./BLS12_381MixerBase.sol";
import "./Groth16BLS12_381.sol";

/// Instance of BLS12_381MixerBase implementing the Groth16 verifier for the
/// bls12-381 pairing.
contract Groth16BLS12_381Mixer is BLS12_381MixerBase
{
    constructor(
        uint256 mk_depth,
        address token,
        uint256[] memory vk,
        uint256 hash_type
    )
        public
        BLS12_381MixerBase(mk_depth, token, vk, hash_type)
    {
    }

    function _verifyZKProof(
        uint256[] memory proof,
        uint256[_NUM_INPUTS] memory inputs
    )
        internal
        override
        returns (bool)
    {
        // Convert the statically sized primaryInputs to a dynamic array
        // expected by the verifier.

        // TODO: mechanism to pass static-sized input arrays to generic
        // verifier functions to avoid this copy.

        uint256[] memory input_values = new uint256[](_NUM_INPUTS);
        for (uint256 i = 0 ; i < _NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        return Groth16BLS12_381._verify(_vk, proof, input_values);
    }
}
