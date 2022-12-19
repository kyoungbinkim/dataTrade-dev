import LibSnark from "../core/libsnark/libsnark.js";
import SnarkInput from "../core/libsnark/struct/snarkInput.js";
import FileSystem from '../core/utils/file.js'

describe("libsnark ", () => {
    let libsnark;
    it("1" ,(done) => {

        libsnark = new LibSnark("RegistData");
        console.log(libsnark.CircuitType);

        let testData = FileSystem.readFileToBigIntString("../../package.json");
        console.log(testData);
        testData = FileSystem.hexStringToBigIntArr(testData);
        console.log(testData, testData.length);
        const snarkInput = new SnarkInput.RegistData();
        snarkInput.uploadPkOwnFromPrivKey("1234");
        snarkInput.uploadData(testData);
        snarkInput.encryptData();
        snarkInput.makeSnarkInput();

        const snarkInputJsonStr = snarkInput.toSnarkInputFormat();
        console.log(snarkInputJsonStr);

        libsnark.uploadInputJsonStr(snarkInputJsonStr);
        libsnark.getLastFunctionMsg();
        libsnark.runProof("_1");

        const snarkInput2 = new SnarkInput.RegistData();
        snarkInput2.uploadPkOwnFromPrivKey("123457");
        snarkInput2.uploadData(testData);
        snarkInput2.encryptData();
        snarkInput2.makeSnarkInput();
        libsnark.uploadInputJsonStr(snarkInput2.toSnarkInputFormat());
        libsnark.runProof("_2");

        done();
    }).timeout(100000);
});