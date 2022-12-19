import FileSystem from '../utils/file.js';
import UserKey from "../wallet/keyStruct.js";
import encryption from '../crypto/encryption.js';
import types from '../utils/types.js';
import SnarkInput from '../libsnark/struct/snarkInput.js';

const filePath = '../sampleFile/data.txt'
const filePath2 = '../sampleFile/data2.txt'

describe('fileSystem Test', ()=> {
    it("read Text File", (done)=>{
        
        console.log(FileSystem.readTextFile(filePath));
        console.log(FileSystem.readRawFile(filePath), FileSystem.readRawFile(filePath).length);
        console.log(FileSystem.rawFileToBigIntString(FileSystem.readRawFile(filePath)));
        console.log(FileSystem.readFileToBigIntString(filePath));
        const myData = FileSystem.readFileToBigIntString(filePath);
        console.log(myData.slice(0, 62));
        console.log(myData.slice(62, 124))
        done();

    }).timeout(1000);

    it("encryption test", (done) => {

        const userKey = UserKey.UserKey.keyGen();
        const symEnc = new encryption.symmetricKeyEncryption(userKey.sk);
        console.log(FileSystem.readTextFile(filePath));
        
        done();

    }).timeout(10000);

    it("peer Data", (done) => {
        console.log(FileSystem.readTextFile(filePath2));
        const userKey = UserKey.UserKey.keyGen();
        console.log(Number(1).toString(16));
        done();
    }).timeout(10000);

    it("peerENcData", (done) => {
        const userKey = UserKey.UserKey.keyGen();
        const peerEncData = new FileSystem.peerEncData(userKey.sk);
        peerEncData.uploadDataFromPath(filePath2);
        peerEncData.encryptData();
        console.log(JSON.parse( peerEncData.toJson()));

        const tmp = peerEncData.data;
        console.log(FileSystem.BigIntArrToBuffer(tmp));
        console.log(FileSystem.BigIntArrToTextString(tmp));

        done();
    }).timeout(10000);

    it("Snark Input", (done) => {
        const dataRagistSnarkInput = new SnarkInput.RegistData();
        dataRagistSnarkInput.uploadData(["0","123","55","55","55"]);
        dataRagistSnarkInput.uploadPrivKey("123");
        dataRagistSnarkInput.encryptData();
        dataRagistSnarkInput.makeSnarkInput();
        console.log(JSON.parse(dataRagistSnarkInput.toSnarkInputFormat()));
        done();        
    }).timeout(1000);
})