// SPDX-License-Identifier: LGPL-3.0+
pragma solidity ^0.8.2;
// pragma experimental ABIEncoderV2;

import "./Groth16AltBN128.sol";

contract Groth16AltBN128Test{
    
    uint256 internal constant _NUM_INPUTS = 5;

    //ZKP verify key
    uint256[] internal _vk;

    constructor(uint256[] memory vk){
        _vk = vk;
    }

    function _verifyZKProof(
        uint256[] memory proof,
        uint256[_NUM_INPUTS] memory inputs
    )
        public
        returns(bool)
    {   
        uint256[] memory input_values = new uint256[](_NUM_INPUTS);
        for (uint256 i = 0 ; i < _NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        return Groth16AltBN128._verify(_vk, proof, input_values);
    }
}