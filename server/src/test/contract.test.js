import Web3 from "web3";
import fs from 'fs';
//import ABI from "../../../tradeContract/build/contracts/TradeDataContract.json";
import assert from "assert";
import mimc from '../core/crypto/mimc.js';
import types from '../core/utils/types.js';

//  user register param
const RPC = 'ws://127.0.0.1:7545';
const CA = '0xbB1eDc8D7502bBa5eAcfABECF204cF2C8877BBcC';// contract address
const AA = [//account address
    '0xe69E183FDdDc40549AeD9273BF735b285B9C65cc',
];
const inputPk  = [
    '0x123456789',
    '0x987654321'
];

// trade data param
const cm = [
    '0x123456789',
    '0x121212121'
];

const CT = [
    '0x1',
    '0x2',
    '0x3',
    '0x4',
    '0x5',
    '0x6'
];

const proof = [
    '0x1',
    '0x1',
    '0x1',
    '0x1',
    '0x1',
    '0x1',
    '0x1',
    '0x1'
];

const decKeyInput = [
    cm[0],
    cm[1],
    '0x15151515'
];

const resisterInput = [
    0x1,
    0x2,
    0x3,
    0x4,
    0x5
]

function wait(sec) {
    let start = Date.now(), now = start;
    while (now - start < sec * 1000) {
        now = Date.now();
    }
}

describe("contract.test.js 실행 결과", () => {
    
    const check = (result, expect)=>{
        assert.strictEqual(result, expect);
    }

    let web3 = new Web3(new Web3.providers.WebsocketProvider(RPC));
    const ABIJson = JSON.parse(fs.readFileSync('../../../tradeContract/build/contracts/TradeDataContract.json'));
    let contract = new web3.eth.Contract(ABIJson["abi"],CA );
    const A = web3.eth.accounts[0];

    console.log('setting contract');

    it("user rigister test", async () => {
       // this.timeout(5000);
        //setTimeout(done, 3000);
        await contract.methods.registerUser(inputPk[0],inputPk[1]).send({from : AA[0], gas: '1000000' });
        var BigIntInput = [,];
        BigIntInput[0] = types.hexToInt(inputPk[0]);
        BigIntInput[1] = types.hexToInt(inputPk[1]);
        const mimc7 = new mimc.MiMC7();
        const pkAddress = mimc7._hash(BigIntInput[0],BigIntInput[1]);//mimc7
        console.log(pkAddress);
        const pk = await contract.methods.getUserPK(pkAddress).call();
        console.log(pk[0]);
        console.log(BigIntInput[0].toString());

        var result = JSON.stringify(pk[0]);
        var expect = JSON.stringify(BigIntInput[0].toString());
        check(result,expect);
        result = JSON.stringify(pk[1]);
        expect = JSON.stringify(BigIntInput[1].toString());
        check(result,expect);
    });

    it("data rigister test", async () => {
        
        await contract.methods.registData(proof,resisterInput).send({from : AA[0]});
        assert.ok(await contract.methods.isRegistered(resisterInput[3]).call());
    });

    

    it("data trade order test", async () => {
        const inputData = [
            cm[0],cm[1],
            CT[0],CT[1],CT[2],CT[3],CT[4],CT[5]
        ]

        var result;
        //suvscribe setting
        var subscription = web3.eth.subscribe('logs', {
            address: CA,
            //topics: ['0x12345...']
        }, function(error, res){
            if (!error)
                console.log(res);
            else
                console.log(error);
        })
        .on("connected", function(subscriptionId){
            console.log(subscriptionId);
        })
        .on("data", function(log){
            console.log(log.data);
            result = JSON.stringify(log.data);
        })
        .on("changed", function(log){
        });

        await contract.methods.orderData(proof,inputData).send({from : AA[0]});

        wait(2);
        
        const expect = JSON.stringify(CT)
        check(result,expect);

        subscription.unsubscribe(function(error, success){
            if(success)
                console.log('Successfully unsubscribed!');
        });
    })

    it("data trade deckey send test", async () => {

        await contract.methods.registerDecKey(proof,decKeyInput).send({from : AA[0]});
        const ctDeckey = await contract.methods.getDecKey(cm[0]).call();

        console.log(parseInt(ctDeckey));
        console.log(parseInt(decKeyInput[2]));

        const result = JSON.stringify(parseInt(ctDeckey));
        const expect = JSON.stringify(parseInt(decKeyInput[2]));
        check(result,expect);
    })
});