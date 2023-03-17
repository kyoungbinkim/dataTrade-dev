import fs from 'fs';
import LibSnark from "../core/libsnark/libsnark.js";
import SnarkInput from "../core/libsnark/struct/snarkInput.js";
import FileSystem from '../core/utils/file.js'
import { snarkPath } from '../core/utils/config.js';

describe("libsnark ", () => {
    let libsnark = new LibSnark("AcceptTrade");
    let libsnarkVerifier = new LibSnark("AcceptTrade", true);

    it('regist Data Test', async (done) => {
        
        const snarkInput = new SnarkInput.AcceptTrade(
            '12345',
            'ab123',
            'fff12',
            '123faf',
            '998afd',
            '123000',
            '123000'
        );
        
        console.log(
            snarkInput.toSnarkInputFormat()
        )
        
        libsnark.uploadInputAndRunProof(
            snarkInput.toSnarkInputFormat(),
            '_test'
        )
        
        const proofJson = fs.readFileSync(snarkPath + 'AcceptTrade_test_proof.json', 'utf-8');
        console.log("proofJson",proofJson)
        libsnarkVerifier.verifyProof(
            snarkInput.toSnarkVerifyFormat(),
            '_test'
        )

        done();
    }).timeout(200000);

    // it("1" ,(done) => {

    //     let libsnark = new LibSnark("RegistData");
    //     console.log(libsnark.CircuitType);

    //     const snarkInput = new SnarkInput.RegistData();
    //     let testData = fs.readFileSync("../../package.json", 'utf-8');
    //     snarkInput.uploadDataFromStr(testData);
    //     snarkInput.uploadPkOwn('123456789')
    //     snarkInput.encryptData();
    //     snarkInput.makeSnarkInput();

    //     const snarkInputJsonStr = snarkInput.toSnarkInputFormat();
    //     console.log(snarkInputJsonStr);

    //     libsnark.uploadInputAndRunProof(snarkInputJsonStr, "_" + snarkInput.gethCt());
    //     libsnark.getLastFunctionMsg();

    //     libsnark.verifyProof()

    //     done();
    // }).timeout(100000);
});