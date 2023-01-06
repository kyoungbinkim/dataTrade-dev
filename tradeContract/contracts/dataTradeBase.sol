// SPDX-License-Identifier: LGPL-3.0+
pragma solidity ^0.8.2;

import "./Groth16AltBN128.sol";

contract dataTradeContract {

    // h_ct list
    mapping(uint256 => bool) internal _hCT_list;

    mapping(uint256 => bool) internal _addr_list;

    // registData SNARK Proof input num
    uint256 private constant REGISTDATA_NUM_INPUTS = 5;

    // registDAta SNARK vk
    uint256[] private registData_vk;

    constructor(uint256[] memory _registData_vk)
    {
        registData_vk = _registData_vk;
    }


    /*
        inputs : [ constant(1) , pk_own , h_k , h_ct , id_data ]
    */
    function registData(
        uint256[] memory proof,
        uint256[REGISTDATA_NUM_INPUTS] memory inputs
    ) 
        public 
        payable 
        returns(bool)
    {   
        // check input length
        require( inputs.length == REGISTDATA_NUM_INPUTS, "invalid Input length");
        
        // check hct
        require( !_hCT_list[inputs[3]], "already registered h_ct");

        uint256[] memory input_values = new uint256[](REGISTDATA_NUM_INPUTS);
        for (uint256 i = 0 ; i < REGISTDATA_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        require( Groth16AltBN128._verify(registData_vk, proof, input_values), "invalid proof");

        _hCT_list[input_values[3]] = true;
        return _hCT_list[input_values[3]];
    }

    function isRegistered(uint256 _hct) 
        public 
        view 
        returns(bool) 
    {
        return _hCT_list[_hct];
    }
}