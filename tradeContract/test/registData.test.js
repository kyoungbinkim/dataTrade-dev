let fs = require('fs');
let process = require('process');

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

const RegistDataContract = artifacts.require('RegistDataContract');

contract('RegistDataContract ', () => {

    const testDirPath = process.cwd();

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

        const RegistDataContractIns = await RegistDataContract.deployed();
        const ret = await RegistDataContractIns.registData.call(
            proofFlat(proofJson),
            contractInput
        );
        console.log(ret);
    }).timeout(1000);

    it('register check', async () => {
        const inputJson = JSON.parse(fs.readFileSync(process.cwd() +'/RegistData_sampleInput.json'));
        const RegistDataContractIns = await RegistDataContract.deployed();

        const isRegisted = await RegistDataContractIns.isRegistered.call(
            hexToDex(inputJson['RegistData'][0]['h_ct'])
        );
        console.log("if sucsess True : ", isRegisted);
    })
})