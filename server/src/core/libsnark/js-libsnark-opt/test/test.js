import {SnarkLibUtils, SnarkLib} from '../src/libsnark.interface.js';
import _ from 'lodash';
import process from 'process';
import fs from 'fs';

const buffer_size = 150;
const circuit_name = "RegistData";
const circuit_name_buf = Buffer.alloc(20); circuit_name_buf.write(circuit_name);

const snark_path        = process.cwd() + '/../libsnark/'; console.log("snark_path : ", snark_path);
const cs_file_path      = Buffer.alloc(buffer_size); cs_file_path.write(snark_path+circuit_name+'_constraint_system.dat');
const cs_file_checksum  = Buffer.alloc(buffer_size); cs_file_checksum.write("data_Tade");
const pk_file_path      = Buffer.alloc(buffer_size); pk_file_path.write(snark_path+circuit_name+'_crs_pk.dat');
const pk_file_json      = Buffer.alloc(buffer_size); pk_file_json.write(snark_path+circuit_name+'_crs_pk.json');
const pk_file_json_str  = snark_path+circuit_name+'_crs_pk.json';
const vk_file_path      = Buffer.alloc(buffer_size); vk_file_path.write(snark_path+circuit_name+'_crs_vk.dat');
const vk_file_json      = Buffer.alloc(buffer_size); vk_file_json.write(snark_path+circuit_name+'_crs_vk.json');
const vk_file_json_str  = snark_path+circuit_name+'_crs_vk.json';
const proof_file_path   = Buffer.alloc(buffer_size); proof_file_path.write(snark_path+circuit_name+'_proof.dat')
const proof_file_json   = Buffer.alloc(buffer_size); proof_file_json.write(snark_path+circuit_name+'_proof.json');
const proof_file_json_str = snark_path+circuit_name+'_proof.json';

const serializeFormatDefault = 1;
const serializeFormatCRV     = 2;
const serializeFormatZKlay   = 3;

const R1CS_GG       = 1;
const R1CS_ROM_SE   = 2;

const EC_ALT_BN128  = 1;
const EC_BLS12_381  = 2;

const use_json_flag    = false; 
const use_cs_file_flag = false; // true면 libsnark에서도 안돌아감

describe('snark Test', ()=> {
    it('Create Circuit Test', (done) => {
        done();
        /*
        * @return -1   : invalid \b circuit_name \n 
        *         -2   : invalid \b proof_system \n
        *         -3   : invalid \b ec_selection \n
        *         -4   : unknown error
        *         >=1  : success \n
        */

        // let contextId = SnarkLib.createCircuitContext(circuit_name_buf, R1CS_GG, EC_ALT_BN128, new Buffer.alloc(0), new Buffer.alloc(0), new Buffer.alloc(0));
        // const msg = SnarkLib.getLastFunctionMsg(contextId);
        // console.log("msg : ", msg, "context ID : ", contextId);

        // SnarkLib.assignCircuitArgument(contextId, circuit_name_buf, new Buffer.alloc(3));
        // SnarkLib.buildCircuit(contextId);
        // SnarkLib.runSetup(contextId);
        // SnarkLib.writeConstraintSystem(contextId, cs_file_path, 1, cs_file_checksum);
        // SnarkLib.writePK(contextId, pk_file_path);
        // SnarkLib.writeVK(contextId, vk_file_path);
        // SnarkLib.serializeFormat(contextId, serializeFormatDefault);
        // SnarkLibUtils.write_pk_json(contextId, pk_file_json_str);
        // SnarkLibUtils.write_vk_json(contextId, vk_file_json_str);
        // SnarkLib.finalizeCircuit(contextId);
        // done();
    }).timeout(1000000);



    it('Verify Check Sum Test', (done)=> {

        const contextId = SnarkLib.createCircuitContext(circuit_name_buf, R1CS_GG, EC_ALT_BN128, null, null, cs_file_path);
        const msg = SnarkLib.getLastFunctionMsg(contextId);
        console.log(msg);
        const result = SnarkLib.verifyConstraintSystemFileChecksum(contextId, cs_file_path, cs_file_checksum);
        SnarkLib.finalizeCircuit(contextId);
        done();

    }).timeout(10000);



    it('Run Proof Test does not use cs_file', (done) => {

        const contextId = SnarkLib.createCircuitContext(circuit_name_buf, R1CS_GG, EC_ALT_BN128, null, null, (use_cs_file_flag)?cs_file_path:null);
        console.log(SnarkLib.getLastFunctionMsg(contextId));
        SnarkLib.circuit_arguments(contextId, circuit_name_buf, new Buffer.alloc(3));
        SnarkLib.serializeFormat(contextId, serializeFormatDefault);
        SnarkLib.buildCircuit(contextId);
        if(use_json_flag) { SnarkLibUtils.load_pk_json(contextId, pk_file_json_str); }
        else              { SnarkLib.readPK(contextId, pk_file_path); 
                            SnarkLib.getLastFunctionMsg(contextId);}
        SnarkLibUtils.generate_sample_input(contextId, circuit_name, "");
        SnarkLib.runProof(contextId); 
        SnarkLib.writeProof(contextId, proof_file_path);
        SnarkLibUtils.write_proof_json(contextId, proof_file_json_str);
        SnarkLib.finalizeCircuit(contextId);
        console.log("proof test contextID",contextId);
        done();

    }).timeout(200000);



    it('Verify Proof does not use cs_file', (done)=> {
        let contextId = SnarkLib.createCircuitContext(circuit_name_buf, R1CS_GG, EC_ALT_BN128, null, null, (use_cs_file_flag)?cs_file_path:null);
        console.log(SnarkLib.getLastFunctionMsg(contextId));
        SnarkLib.serializeFormat(contextId, serializeFormatDefault);
        SnarkLib.buildCircuit(contextId);
        if(use_json_flag) { 
            SnarkLibUtils.load_pk_json(contextId, pk_file_json_str); 
            SnarkLibUtils.load_vk_json(contextId, vk_file_json_str);
            SnarkLibUtils.load_proof_json(contextId, proof_file_json_str);
        }
        else { 
            SnarkLib.readPK(contextId, pk_file_path);
            SnarkLib.readVK(contextId, vk_file_path);
            SnarkLib.readProof(contextId, proof_file_path);
        }
        SnarkLibUtils.generate_sample_input(contextId, circuit_name, "");   
        const ver_result = SnarkLib.runVerify(contextId);
        console.log("verify result : ", ver_result);
        console.log(SnarkLib.getLastFunctionMsg(contextId));
        SnarkLib.finalizeCircuit(contextId);
        done();
    }).timeout(200000);
})