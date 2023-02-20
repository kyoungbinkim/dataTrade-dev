/**
 *  api : https://github.com/snp-labs/libsnark-optimization/blob/master/api.hpp 
 */
import _ from 'lodash';
import ffi from 'ffi-napi';
import ref from 'ref-napi';
import JSONbig from 'json-bigint';
import fs from 'fs';
import process from 'process';
import path from 'path';
import os from 'node:os'
import Config from '../../../utils/config.js';

let snarkLibPath = ''; 
const ffi_flags = ffi.DynamicLibrary.FLAGS.RTLD_NOW | ffi.DynamicLibrary.FLAGS.RTLD_GLOBAL;
if (process.env.NODE_ENV !== 'production') {
    snarkLibPath = Config.homePath+'/src/core/libsnark/js-libsnark-opt/libsnark/libSnark.dylib';
} else {
    snarkLibPath = '../libsnark-optimization/lib/'+os.platform()+'_release/lib/libSnark.dylib';
}
console.log("snarkLibPath : ", snarkLibPath, os.arch(), os.platform());

// const cINT      = "int";
// const cCHARptr  = ref.refType(ref.types.char);
const cINT      = ref.types.int;
const cCHARptr  = ref.types.CString;

export const SnarkLib = ffi.Library(snarkLibPath, {
    createCircuitContext: [cINT, [ cCHARptr, cINT, cINT, cCHARptr, cCHARptr, cCHARptr ]],
    buildCircuit: [cINT, [cINT]],
    assignCircuitArgument: [cINT,[cINT, cCHARptr, cCHARptr]],

    runSetup :[cINT, [cINT]],
    runProof :[cINT, [cINT]],
    runVerify:[cINT, [cINT]],

    updatePrimaryInput:     [cINT, [cINT, cCHARptr, cINT]],
    updatePrimaryInputStr:  [cINT, [cINT,cCHARptr, cCHARptr]],
    updatePrimaryInputArray:[cINT, [cINT,cCHARptr, cINT, cINT]],
    updatePrimaryInputArrayStr: [cINT, [cINT, cCHARptr, cINT, cCHARptr]],
    resetPrimaryInputArray:     [cINT, [cINT, cCHARptr, cINT]],
    resetPrimaryInputArrayStr:  [cINT, [cINT, cCHARptr, cCHARptr]],
    updatePrimaryInputFromJson: [cINT,[ cINT, cCHARptr]],

    writeConstraintSystem: [cINT, [cINT, cCHARptr, cINT, cCHARptr]],
    verifyConstraintSystemFileChecksum: [cINT, [cINT, cCHARptr, cCHARptr]],

    writeCircuitToFile:[cINT, [cINT, cCHARptr]],
    writeInputsToFile: [cINT, [cINT, cCHARptr]],

    writeVK : [cINT, [cINT, cCHARptr]],
    readVK  : [cINT, [cINT, cCHARptr]],

    writePK : [cINT, [cINT, cCHARptr]],
    readPK  : [cINT, [cINT, cCHARptr]],

    writeProof : [cINT, [cINT, cCHARptr]],
    readProof  : [cINT, [cINT, cCHARptr]],

    serializeVerifyKey : [cCHARptr, [cINT]],
    deSerializeVerifyKey:[cINT, [cINT, cCHARptr]],

    serializeProofKey : [cCHARptr, [cINT]],
    deSerializeProofKey:[cINT, [cINT, cCHARptr]],

    serializeProof : [cCHARptr, [cINT]],
    deSerializeProof:[cINT, [cINT, cCHARptr]],

    serializeFormat : [cINT, [cINT, cINT]],

    finalizeCircuit : [cINT, [cINT]],
    finalizeAllCircuit: [cINT, []],

    getLastFunctionMsg : [cCHARptr, [cINT]],

});


function write_text_to_file(file_name, content){
    // fs.writeFile(file_name, content, err => {
    //     if (err) {
    //       console.error(err);
    //     }
    // });
    try{
        fs.writeFileSync(file_name, content)
    }
    catch (e) {
        console.log(e);
    }
}

function read_text_from_file(file_name){
    const result = fs.readFileSync(file_name, 'utf-8');
    return result;
}    

function write_pk_json(contextId, pk_json_name){
    const pk_json = SnarkLib.serializeProofKey(contextId);
    // console.log(pk_json);
    write_text_to_file(pk_json_name, pk_json);
}

function load_pk_json(contextId, pk_json_name){

    const pk_json = fs.readFileSync(pk_json_name, 'utf-8');
    const buf = Buffer.alloc(pk_json.length+20); buf.write(pk_json);
    SnarkLib.deSerializeProofKey(contextId, buf);
}


function write_vk_json(contextId, vk_json_name){
    const pk_json = SnarkLib.serializeVerifyKey(contextId);
    write_text_to_file(vk_json_name, pk_json);
}

function load_vk_json(contextId, vk_json_name){

    const vk_json = fs.readFileSync(vk_json_name, 'utf-8');
    const buf = Buffer.alloc(vk_json.length+20); buf.write(vk_json);
    SnarkLib.deSerializeVerifyKey(contextId, buf);
}

function write_proof_json(contextId, proof_json_name){
    const proof_json = SnarkLib.serializeProof(contextId);
    write_text_to_file(proof_json_name, proof_json);
}

function load_proof_json(contextId, proof_json_name){

    const proof_json = fs.readFileSync(proof_json_name, 'utf-8');
    const buf = Buffer.alloc(proof_json.length+20); buf.write(proof_json);
    SnarkLib.deSerializeProof(contextId, buf);

}

function generate_sample_input(contextId, circuit_name, cmdline_arg_2){
    const sample_input_select = circuit_name;

    // 경로 코드는 나중에 만들어 ~
    const json_json = JSON.parse( fs.readFileSync(process.cwd()+"/../libsnark/sample_input.json", 'utf-8') );
    const json_str  = JSON.stringify(json_json[sample_input_select][0]);
    console.log(json_json[sample_input_select][0]);

    const buf=Buffer.alloc(json_str.length+10); buf.write(json_str); 
    SnarkLib.updatePrimaryInputFromJson(contextId, buf);
}

export const SnarkLibUtils = {
    write_pk_json,
    load_pk_json,
    write_vk_json,
    load_vk_json,
    write_proof_json,
    load_proof_json,
    generate_sample_input,
};

// export default SnarkLibUtils;