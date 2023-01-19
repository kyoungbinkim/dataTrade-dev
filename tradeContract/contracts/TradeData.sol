// SPDX-License-Identifier: LGPL-3.0+
pragma solidity ^0.8.2;

import "./Groth16AltBN128.sol";
import "./BaseMerkleTree.sol";
import "./MiMC7.sol";

contract TradeDataContract is BaseMerkleTree{
    
    //  user pk
    struct AddressMap {
        //uint256 Addr;
        uint256 PkOwn;
        uint256 PkEnc;
    }

    //  mapping
    mapping(uint256 => bool) internal _hCT_list;
    mapping(uint256 => bool) private waitTradeList;
    mapping(uint256 => bool) private _addrList;
    mapping(uint256 => AddressMap) private userPkList;
    mapping(uint256 => uint256) private dataDecKeyList;
    
    //  SNARK Proof input num
    uint256 private constant REGISTDATA_NUM_INPUTS = 5;
    uint256 private constant ORDER_NUM_INPUTS = 8;
    uint256 private constant DEC_KEY_NUM_INPUTS = 3;

    //
    uint256 private constant CT_ORDER_NUM_INPUTS = 6;

    //  SNARK vk
    uint256[] private registData_vk;
    uint256[] private orderVk;
    uint256[] private decKeyVk;


    constructor(
        uint256[] memory _registData_vk,
        uint256[] memory _orderVk,
        uint256[] memory _decKeyVk
        )
    {
        registData_vk = _registData_vk;
        orderVk = _orderVk;
        decKeyVk = _decKeyVk;
    }

    event LogOrder(
        uint256[6] ctOrder
    );

    // user pk
    function registerUser(
        uint256 pkOwn,
        uint256 pkEnc
    )
    public
    returns (bool) {
        bytes32 memory _addr = MiMC7._hash(bytes32(pkOwn), bytes32(pkEnc));
        uint256 memory addr = uint256(_addr);
        require(!_addrList[addr], "User already exist");
        _addrList[addr] = true;
        _addressMap[addr].PkOwn = pkOwn;
        _addressMap[addr].PkEnc = pkEnc;

        return true;
    }

    function getUserPK(
        uint256 addr
    )
    public
    view
    returns(uint256, uint256){
        require(_addrList[addr], "User no exist");
        return (
            userPkList[addr].PkOwn,
            userPkList[addr].PkEnc);
    }

    // register data
    /*
        input [ constant(1) , pk_own , h_k , h_ct , id_data ]
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

    //trade data
    function orderData(
        uint256[] memory proof,
        uint256[ORDER_NUM_INPUTS] memory inputs
    )
        public
        payable
        returns(bool)
    {
        //verify proof
        // check input length
        require( inputs.length == ORDER_NUM_INPUTS, "invalid Input length");
        
        uint256[] memory input_values = new uint256[](ORDER_NUM_INPUTS);
        for (uint256 i = 0 ; i < ORDER_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        require( Groth16AltBN128._verify(orderVk, proof, input_values), "invalid proof");

        //stack cm to wait trade list
        waitTradeList[input_values[0]] = true;
        waitTradeList[input_values[1]] = true;

        // emit(CT)
        uint256[] memory ctOder = new uint256[](CT_ORDER_NUM_INPUTS);
        for (uint256 i = 0 ; i < CT_ORDER_NUM_INPUTS; i++) {
            ctOder[i] = input_values[i+2];
        }

        emit LogOrder(
            ctOder
        );

        return true;
    }
    
    function registerDecKey(
        uint256[] memory proof,
        uint256[DEC_KEY_NUM_INPUTS] memory inputs
    )
        public
        payable
        returns(bool)
    {
        // verify
        require( inputs.length == DEC_KEY_NUM_INPUTS, "invalid Input length");
        
        uint256[] memory input_values = new uint256[](DEC_KEY_NUM_INPUTS);
        for (uint256 i = 0 ; i < DEC_KEY_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        require( Groth16AltBN128._verify(decKeyVk, proof, input_values), "invalid proof");

        // pop cm from wait trade list
        waitTradeList[input_values[0]] = false;
        waitTradeList[input_values[1]] = false;
        
        // TradeACC += cm,cm


        // store CT key
        dataDecKeyList[input_values[0]] = input_values[3];

        return true;
    }

    function getDecKey(
        uint256 cm
        )
        public
        view
        returns(uint256){
        return dataDecKeyList[cm];
    }
}