import path from 'path';
import SnarkInput from '../libsnark/struct/snarkInput.js';
import SnarkLib, {SnarkLibUtils} from '../js-libsnark-opt/src/libsnark.interface.js';

describe('test', ()=> {
    let snarkInput;
    it("make SnarkInput", (dond) => {
        const dataRagistSnarkInput = new SnarkInput.RegistData();
        dataRagistSnarkInput.uploadData(["0","123","55","55","55"]);
        dataRagistSnarkInput.uploadPrivKey("123");
        dataRagistSnarkInput.encryptData();
        dataRagistSnarkInput.makeSnarkInput();
        console.log(JSON.parse(dataRagistSnarkInput.toSnarkInputFormat()));
        snarkInput = dataRagistSnarkInput.toSnarkInputFormat();
        done();
    }).timeout(10000);
})