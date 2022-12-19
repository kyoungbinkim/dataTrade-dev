import fs from 'fs'
import mimc from '../crypto/mimc.js';
import UserKey from "./keyStruct.js";
import types from '../utils/types.js';
import math from '../utils/math.js';
// import PasswordHelper from "./password.js";
import JoinHelper, { userDBpath } from "./join.js";

const session = {};

export function checkId(id){
    // true : 존재
    return !JoinHelper.idDuplicateCheck(id);
}

export function login(id, pwTk){
    if(!checkId(id)){
        return false;
    }
    const DB = JSON.parse( fs.readFileSync(userDBpath, 'utf-8') );
    if(DB[id]["pw"] === pwTk){
        return true;
    }
    return false;
}

export function makeUID(){
    const uid = math.randomFieldElement();
    return types.decStrToHex(uid.toString()).slice(0,10);
}

export function makeAddress(pk_own, pk_enc){
    if (!types.isBigIntFormat(pk_own) || !types.isBigIntFormat(pk_enc)){
        return undefined;
    }
    const mimc7 = new mimc.MiMC7();
    return mimc7.hash(pk_own, pk_enc);
}

const Login = {
    makeAddress,
    checkId,
    login,
    makeUID
}

export default Login;
