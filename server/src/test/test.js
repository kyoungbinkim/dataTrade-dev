import Config from "../core/utils/config.js";
import JoinHelper from "../core/wallet/join.js"
// import PasswordHelper from "../core/wallet/password.js"
import FileSystem from "../core/utils/file.js";
import Encryption from "../core/crypto/encryption.js";
import types from '../core/utils/types.js';
import fs from 'fs';

/**
 * 
 *  kim     : 115731rhd!
 *  lee     : 1234
 *  park    : 0000
 *  ice     : iceiceice
 *  kim2    : 1234
 */

describe("string to byte test", ()=> {
    it("string to byte", (done) => {
        const testStr = "받침 asd김भाषाอาหรับ";
        console.log(testStr.length,"len : ", FileSystem.getByteLengthOfUtf8String(testStr));
        
        const buf = Buffer.from(testStr, 'utf-8');
        console.log(buf);

        // FileSystem.strToByteArr(testStr);

        // const testHexStr = FileSystem.utf8StringToHexSting(testStr);
        // console.log(testHexStr.length/2);
        // const testHexIntArr = FileSystem.hexStringToBigIntArr(testHexStr);
        // console.log(testHexIntArr, testHexIntArr.length);

        // console.log(FileSystem.BigIntArrToTextString(testHexIntArr));

        // const symEnc = new Encryption.symmetricKeyEncryption("111234");
        // const sCtData = symEnc.EncData(testHexIntArr);
        // const decData = symEnc.DecData(sCtData);
        // console.log(sCtData.toJson());
        // console.log(decData.length, FileSystem.BigIntArrToTextString(decData));

        done();
    }).timeout(1000);

    // it("peerEncData", (done) => {
    //     const testStr = "jewlkrjlqkwjrfklwqrjqw kldjflkqwjer    ewqrwqㅁㅇㄴ러ㅣㅏㄴㅇㅁ러ㅏㅣㄴㅁ어라ㅣㄴㅁ김갸ㅕㅁ언ㅁ리ㅏㄴㅁ";
    //     const utf8buf = Buffer.from(testStr, 'utf-8');
    //     const testEncData = new FileSystem.peerEncData("12312312312");
    //     const utf8bufHexStr = FileSystem.rawFileToBigIntString(utf8buf);
    //     console.log(utf8bufHexStr, utf8bufHexStr.length, utf8buf.length);

    //     // testEncData.uploadDataFromHexDataString(utf8bufHexStr);
    //     console.log(FileSystem.hexStringToBigIntArr(utf8bufHexStr)[529]);
    //     done();
    // }).timeout(1000);
});


// describe("file read test", () => {
//     it("read file", (done) => {
//         try{
//             const proof = fs.readFileSync("/Users/kim/dataTrade-dev/server/src/core/libsnark/js-libsnark-opt/libsnark/RegistData_2ed711603f4ffb6c3e0657949483700fba7153ed2706fdefeb1954518b1175db_proof.json");
//             console.log(proof.toString());
//         }
//         catch(e){
//             console.log("hi", e);
//         }
//         done();
//     }).timeout(1000);
// })