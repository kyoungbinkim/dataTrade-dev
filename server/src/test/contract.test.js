import Web3 from "web3";
import ABI from "../../../tradeContract/build/contracts/ZklayBase.json";

// const testCase = [
//     { brown:10, yellow:2, expected_value:[4, 3] },
//     { brown:8, yellow:1, expected_value:[3, 2] },
//     { brown:24, yellow:24, expected_value:[8, 6] }
// ];

const RPC = 'HTTP://127.0.0.1:7545';
const CA = '0x9Ac4b810F079ACB7C025d61FCEFeDB223e1917bF';// contract address
const AA = [//account address
    '0xEf25BBbe92d0056824E24529A514c8853E3786D2',
];

describe("contract.test.js 알고리즘 실행 결과", () => {
    
    it("test_case ", async (done) => {
        
        let web3 = new Web3(new Web3.providers.HttpProvider(RPC));
        let contract = new web3.eth.Contract(ABI.abi,CA );
        await contract.methods.enroll(2).send({from : AA[0]});
        const num1 = await contract.methods.getnumber().call();
    })
    
});




