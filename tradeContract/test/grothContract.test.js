let fs = require('fs');
let process = require('process');

const Groth16AltBN128Test = artifacts.require('Groth16AltBN128Test');

contract('Groth16AltBN128Test ', () => {

    const testDirPath = process.cwd();

    function hexToDex(hexStr){
        if(hexStr.slice(0,2) !== '0x'){
            return BigInt('0x' + hexStr).toString();
        }
        return BigInt(hexStr).toString();
    }

    function proofFlat(proofJson) {
        let tmp = []
        for(let i=0 ;i<2; i++){
            tmp.push(hexToDex(proofJson['a'][i]));
        }
        for(let i=0 ;i<4; i++){
            tmp.push(hexToDex(proofJson['b'][Number.parseInt(i/2)][(i+1) % 2]));
        }
        for(let i=0 ;i<2; i++){
            tmp.push(hexToDex(proofJson['c'][i]));
        }
        return tmp;
    }

    it('RegistData Verify Test', async () => { 
        
        const proofJson = JSON.parse(fs.readFileSync(testDirPath+'/RegistData_proof.json'));
        const inputJson = JSON.parse(fs.readFileSync(testDirPath+'/RegistData_sampleInput.json'));
        console.log('proof JSON : ', proofFlat(proofJson));
        console.log('input JSON : ', inputJson);

        let tmp = ['1']
        tmp.push(hexToDex(inputJson['RegistData'][0]['pk_own']));
        tmp.push(hexToDex(inputJson['RegistData'][0]['h_k']));
        tmp.push(hexToDex(inputJson['RegistData'][0]['h_ct']));
        tmp.push(hexToDex(inputJson['RegistData'][0]['id_data']));
        const contractInput = tmp;
        console.log('Input : ', contractInput);

        const Groth16AltBN128TestIns = await Groth16AltBN128Test.deployed();
        const verifyResult = await Groth16AltBN128TestIns._verifyZKProof.call(
            proofFlat(proofJson),
            contractInput
        );
        console.log("\nverify result : ", verifyResult);

    })

})