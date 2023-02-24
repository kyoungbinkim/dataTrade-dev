// SPDX-License-Identifier: LGPL-3.0+
pragma solidity ^0.8.2;

import "./Groth16AltBN128.sol";
import "./MiMC7.sol";

contract DataTradeContract {

    struct userInfo {
        uint256 addr;
        uint256 pk_enc;
        uint256 pk_own;
    }

    // h_ct list
    mapping(uint256 => bool) internal _hCT_list;

    //addr 
    mapping(uint256 => bool) internal _addr_list;

    // EOA -> user keys
    mapping(address => userInfo) _userInfoMap;

    // registData SNARK Proof input num
    uint256 private constant REGISTDATA_NUM_INPUTS = 5;

    // GenTrade SNARK Proof input num
    uint256 private constant ORDER_NUM_INPUTS = 17;

    // registDAta SNARK vk
    uint256[] private registData_vk;

    // GenTrade SNARK vk
    uint256[] private orderData_vk;

    event uintLog(string str,  uint256 num);

    constructor(
        uint256[] memory _registData_vk,
        uint256[] memory _orderData_vk
    ){
        registData_vk = _registData_vk;
        orderData_vk  = _orderData_vk;
    }

    function registUserByDelegator(
        uint256 pk_own, 
        uint256 pk_enc,
        address eoa
    ) 
        public
        payable
    {   
        bytes32 _addr = MiMC7._hash(bytes32(pk_own), bytes32(pk_enc));
        _registUser(uint256(_addr), pk_own, pk_enc, eoa);
    }

    function registUser(
        uint256 pk_own, 
        uint256 pk_enc
    )
        public
        payable
    {   
        bytes32 _addr = MiMC7._hash(bytes32(pk_own), bytes32(pk_enc));
        _registUser(uint256(_addr), pk_own, pk_enc, msg.sender);
    }

    function _registUser(
        uint256 addr,
        uint256 pk_own, 
        uint256 pk_enc,
        address eoa
    )
        public
        payable
    {   
        require(!_addr_list[_userInfoMap[eoa].addr], "msg.sender already exist");
        require(!_addr_list[addr], "User already exist");

        _addr_list[addr] = true;

        _userInfoMap[eoa].addr = addr;
        _userInfoMap[eoa].pk_enc = pk_enc;
        _userInfoMap[eoa].pk_own = pk_own;
    }

    function isRegisteredUser(
        uint256 addr
    ) 
        public 
        view 
        returns (bool) 
    {
        return _addr_list[addr];
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


    /**
        1, 
        c0, c1  : 
        cm_own 
        cm_del 
        ENA_r, ENA_c 
        ENA'_r, ENA'_c 
        fee_del, fee_own 
        CT : (size : 6)
     */
    function orderData(
        uint256[] memory proof,
        uint256[ORDER_NUM_INPUTS] memory inputs
    )
        public
        payable
        returns(bool)
    {

        require( inputs.length == ORDER_NUM_INPUTS, "invalid Input length");

        uint256[] memory input_values = new uint256[](ORDER_NUM_INPUTS);
        for (uint256 i = 0 ; i < ORDER_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        require( Groth16AltBN128._verify(orderData_vk, proof, input_values), "invalid proof");
        
        return true;
    }
}