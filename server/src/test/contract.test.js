import Web3 from "web3";
import ABI from "../../../tradeContract/build/contracts/ZklayBase.json";

// const testCase = [
//     { brown:10, yellow:2, expected_value:[4, 3] },
//     { brown:8, yellow:1, expected_value:[3, 2] },
//     { brown:24, yellow:24, expected_value:[8, 6] }
// ];

describe("test.js 알고리즘 실행 결과", () => {
    
    it("test_case ", async (done) => {
        
        let web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));
        let contract = new web3.eth.Contract(ABI.abi, '0x9Ac4b810F079ACB7C025d61FCEFeDB223e1917bF');// contract address
        await contract.methods.enroll(2).send({from :'0xEf25BBbe92d0056824E24529A514c8853E3786D2'});//account address
        const num1 = await contract.methods.getnumber().call();
    })
    
});




