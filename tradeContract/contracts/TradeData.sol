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
    mapping(uint256 => bool) private _roots;
    
    // The Most recent root of the Merkle tree
    uint256 private _root_top;

    //  SNARK Proof input num
    uint256 private constant REGISTDATA_NUM_INPUTS = 5;
    uint256 private constant ORDER_NUM_INPUTS = 8;
    uint256 private constant DEC_KEY_NUM_INPUTS = 3;
    uint256 private constant CT_ORDER_NUM_INPUTS = 6;

    //  SNARK vk
    uint256[] private registData_vk;
    uint256[] private orderVk;
    uint256[] private decKeyVk;


    // constructor
    constructor(
        uint256[] memory _registData_vk,
        uint256[] memory _orderVk,
        uint256[] memory _decKeyVk,
        uint256 merkleDepth,
        uint256 merkleHash_type
        )
        BaseMerkleTree(merkleDepth, merkleHash_type)
    {
        uint256 initial_root = uint256(_nodes[0]);
        _roots[initial_root] = true;
        _root_top = initial_root;

        // register verify key
        registData_vk = _registData_vk;
        orderVk = _orderVk;
        decKeyVk = _decKeyVk;
    }

    // event log
    event LogOrder(
        uint256 ctOrder0,
        uint256 ctOrder1,
        uint256 ctOrder2,
        uint256 ctOrder3,
        uint256 ctOrder4,
        uint256 ctOrder5
    );

    function  _hash(
        bytes32 left,
        bytes32 right)
    internal
    override
    virtual
    returns (bytes32){
        return MiMC7._hash(bytes32(left), bytes32(right));
    }

    // register pk and user
    function registerUser(
        uint256 pkOwn,
        uint256 pkEnc
    )
    public
    returns (bool) {
        // compute user addr and Pk hash
        bytes32 _addr = MiMC7._hash(bytes32(pkOwn), bytes32(pkEnc));
        uint256 addr = uint256(_addr);
        require(!_addrList[addr], "User already exist");

        // register user info
        _addrList[addr] = true;
        userPkList[addr].PkOwn = pkOwn;
        userPkList[addr].PkEnc = pkEnc;

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
        require(inputs.length == REGISTDATA_NUM_INPUTS, "invalid Input length");
        
        // check hct
        require(!_hCT_list[inputs[3]], "already registered h_ct");

        uint256[] memory input_values = new uint256[](REGISTDATA_NUM_INPUTS);
        for (uint256 i = 0 ; i < REGISTDATA_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        //require(Groth16AltBN128._verify(registData_vk, proof, input_values), "invalid proof");

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

    //order data
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
        require(inputs.length == ORDER_NUM_INPUTS, "invalid Input length");
        
        uint256[] memory input_values = new uint256[](ORDER_NUM_INPUTS);
        for (uint256 i = 0 ; i < ORDER_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        // require(Groth16AltBN128._verify(orderVk, proof, input_values), "invalid proof");

        //stack cm to wait trade list
        require(waitTradeList[input_values[0]] == false, "cm0 already exist");
        require(waitTradeList[input_values[1]] == false, "cm1 already exist");
        waitTradeList[input_values[0]] = true;
        waitTradeList[input_values[1]] = true;

        // emit(CT_order)
        uint256[6] memory ctOder;
        for (uint256 i = 0 ; i < CT_ORDER_NUM_INPUTS; i++) {
            ctOder[i] = input_values[i+2];
        }

        emit LogOrder(
            ctOder[0],ctOder[1],ctOder[2],ctOder[3],ctOder[4],ctOder[5]
        );

        return true;
    }
    
    // register dec key
    function registerDecKey(
        uint256[] memory proof,
        uint256[DEC_KEY_NUM_INPUTS] memory inputs
    )
        public
        payable
        returns(bool)
    {
        // verify
        require(inputs.length == DEC_KEY_NUM_INPUTS, "invalid Input length");
        
        uint256[] memory input_values = new uint256[](DEC_KEY_NUM_INPUTS);
        for (uint256 i = 0 ; i < DEC_KEY_NUM_INPUTS; i++) {
            input_values[i] = inputs[i];
        }
        // require(Groth16AltBN128._verify(decKeyVk, proof, input_values), "invalid proof");

        // pop cm from wait trade list
        require(waitTradeList[input_values[0]] == true, "cm0 no exist");
        require(waitTradeList[input_values[1]] == true, "cm1 no exist");
        waitTradeList[input_values[0]] = false;
        waitTradeList[input_values[1]] = false;
        
        // TradeACC += cm,cm
        _insert(bytes32(input_values[0]));
        _insert(bytes32(input_values[1]));
        
        uint256 new_merkle_root = uint256(_recomputeRoot(2));//parameter is count of inserted cm
        _addRoot(new_merkle_root);

        // store CT key
        dataDecKeyList[input_values[0]] = input_values[2];

        return true;
    }

    function getDecKey(
        uint256 cm
        )
        public
        view
        returns(uint256){

        //require(dataDecKeyList[cm] != 0, "dec key no exist");
        return dataDecKeyList[cm];
    }

    function _addRoot(uint256 rt) private {
        _roots[rt] = true;
        _root_top = rt;
    }
}