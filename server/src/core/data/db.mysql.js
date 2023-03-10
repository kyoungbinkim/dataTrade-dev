import { mysqlConfig, fileStorePath } from "../utils/config.js";
import randomWord from 'random-words';
import mysql from 'mysql2';
import mysqlPromise from 'mysql2/promise';
import _ from 'lodash';
import math from "../utils/math.js";

const connection = mysql.createConnection(mysqlConfig);
const promiseConnection = await mysqlPromise.createConnection(mysqlConfig);

/**
 * 
 * @param {String} id 
 * @param {Callback} callback 
 * 
 * @return {boolean} true: you can use Id 
 */
export function idDuplicateCheckQuery(id, callback) {
    const duplicateCheck = `select id from user where id=?`;
    connection.query(duplicateCheck, [`${id}`], (err, res) => {
        if(err) { callback(err, false); }
        callback(null, res.length==0);
    });
}

/**
 * 
 * @param {*} nickname 
 * @param {*} callback 
 */
export function nicknameDuplicateCheckQuery(nickname, callback) {
    const duplicateCheck = `select nickname from user where nickname=?`;
    connection.query(duplicateCheck, [`${nickname}`], (err, res) => {
        if(err) { callback(err, false); }
        callback(null, res.length==0);
    });
}


/**
 * 
 * @param {String} type     : id nickname
 * @param {String} val      : want to check
 * @param {Callback} callback : true: not duplicatae
 */
export function duplicateCheckQuery(type, val, callback){
    const duplicateCheck = `select ${type} from user where ${type}=?`;
    connection.query(duplicateCheck, [`${val}`], (err, res) => {
        if(err) { callback(err, false); return;}
        callback(null, res.length==0);
    })
}

export function getUserNum(callback){
    connection.query(`select max(user_idx)+1 as usrCnt from user;`,num = (err, row) => {
        if(err){ callback(null); }
        callback(row[0].usrCnt);
    });
}

export function getUserInfoFromId(id, callback){
    const getUserInfo = `select * from user where id=?`;

    connection.query(getUserInfo, [`${id}`], (err, row) => {
        if(err) {console.log(err); callback(err, null); return;}
        else if(row.length == 0){
            console.log("id does not exist");
            callback("id does not exist", null);
            return;
        }
        callback(null, row[0]);
    });
}

// export function userJoinQuery(userInfoJsonInput, callback){
//     const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

//     const id       = userInfoJson['id'];
//     const pwToken  = userInfoJson['pw'] ?? userInfoJson['pwTk'];
//     const nickname = userInfoJson['nickname'] ?? randomWord()+randomWord();
//     const pkOwn    = userInfoJson['pkOwn'];
//     const pkEnc    = userInfoJson['pkEnc'];
//     const ENA      = userInfoJson['ena'];
//     const userInsertUserQuery = 
//         `INSERT INTO user (id, pw, nickname, pk_own, pk_enc, ENA) 
//         VALUES('${id}', '${pwToken}', '${nickname}', '${pkOwn}', '${pkEnc}', '${ENA}');`
//     connection.query(userInsertUserQuery, (err, result) => {
//         if(err){console.log(err); callback(false); return;}
//         console.log("userInsertUserQuery",result);
//         callback(true);
//     })
    
// }

export function userJoinQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const loginTk  = userInfoJson['loginTk'] ?? userInfoJson['login_tk'] ??userInfoJson['login_token'] 
    const nickname = userInfoJson['nickname'] ?? randomWord()+randomWord();
    const skEnc    = userInfoJson['skEnc'] ?? _.get(userInfoJson, 'sk_enc');
    const pkOwn    = userInfoJson['pkOwn'] ?? _.get(userInfoJson, 'pk_own');
    const pkEnc    = userInfoJson['pkEnc'] ?? _.get(userInfoJson, 'pk_enc');
    const addr     = userInfoJson['addr'] ?? userInfoJson['ena'];
    const EOA      = userInfoJson['EOA'];
    const userInsertUserQuery = 
        `INSERT INTO user (login_tk, nickname, sk_enc, pk_own, pk_enc, addr, eoa_addr) 
        VALUES('${loginTk}', '${nickname}','${skEnc}', '${pkOwn}', '${pkEnc}', '${addr}', '${EOA}');`
    connection.query(userInsertUserQuery, (err, result) => {
        if(err){console.log(err); callback(false); return;}
        console.log("userInsertUserQuery",result);
        callback(true);
    })
    
}
//0xed3fe2e1ca09a6daaf7993a30de36aa1a4afa8d1b05ac2de1063e31330ae5e
// export function userLoginQuery(userInfoJsonInput, callback){
//     const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

//     const id    = userInfoJson["id"];
//     const pwTk  = userInfoJson["pw"]?? userInfoJson["pwTk"];
//     const userPwCheckQuery = `select id, pw from user where id=?`

//     connection.query(userPwCheckQuery, [`${id}`], (err, row) => {
//         if(err) {console.log(err); callback(false); return;}
//         if(row.length == 0){
//             console.log("id does not exist");
//             callback(false);
//             return;
//         }
//         console.log(row);
//         if(row[0].pw === pwTk){
//             callback(true); return;
//         }
//         callback(false);
//     });
// }

export function userLoginQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const loginTk = userInfoJson['loginTk']
    const loginQuery = `select login_tk, nickname, sk_enc from user where login_tk=?`

    connection.query(loginQuery, [`${loginTk}`], (err, row) => {
        if(err) {console.log(err); callback(false); return;}
        if(row.length == 0){
            console.log("loginTk does not exist");
            callback({
                flag : false
            });
            return;
        }
        console.log(row);
        
        callback({
            flag : true,
            nickname : row[0].nickname,
            login_tk : row[0].login_tk,
            sk_enc   : row[0].sk_enc,
        });
    });
}

// export function registDataQuery_(registDataJsonInput, callback){
//     const registDataJson = _.isString(registDataJsonInput) ? JSON.parse(registDataJsonInput) : registDataJsonInput;

//     const userId = registDataJson[`id`] ?? registDataJson['userId'];
//     const title  = registDataJson[`title`];
//     const desc   = registDataJson[`desc`] ?? registDataJson[`descript`] ??registDataJson[`description`];
//     const idData = registDataJson[`id_data`] ?? registDataJson[`h_data`];
//     const encKey = registDataJson[`enc_key`] ?? registDataJson[`dataEncKey`] ?? registDataJson[`key`];
//     const path   = registDataJson[`filePath`] ?? registDataJson[`enc_data_path`] ?? registDataJson[`path`];
//     const h_ct   = registDataJson[`h_ct`] ?? registDataJson[`hCt`];
//     const registQuery = 
//     `INSERT INTO book (user_id, title, descript, h_data, enc_key, enc_data_path, h_ct) 
//     VALUES('${userId}', '${title}', '${desc}', '${idData}', '${encKey}', '${path}', '${h_ct}');`

//     connection.query(registQuery, (err, result) => {
//         if(err){console.log(err); callback(false); return;}
//         callback(true);
//     }) 
// }

export async function registDataQuery(registDataJsonInput){
    const owner_nickname    = registDataJsonInput['nickname'];
    const title             = registDataJsonInput['title'];
    const descript          = registDataJsonInput['desc'];
    const h_k               = registDataJsonInput['h_k'];
    const h_ct              = registDataJsonInput['h_ct'];
    const h_data            = registDataJsonInput['h_data'];
    const enc_key           = registDataJsonInput['enc_key'];
    const data_path         = registDataJsonInput['data_path'];

    const query = 
    `INSERT INTO data (owner_nickname, title, descript, h_ct, h_data, enc_key, data_path, h_k)
    VALUES('${owner_nickname}', '${title}', '${descript}', '${h_ct}', '${h_data}', '${enc_key}', '${data_path}', '${h_k}')`

    try {
        const [ret] = await promiseConnection.execute(query);
        console.log(ret);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function getDataList(ind, callback) { 
    const getDataQuery = 
    `SELECT title, descript, owner_nickname from data LIMIT ${ind*10}, 10;`

    const [data] = await promiseConnection.execute(getDataQuery);
    console.log(data);
    return data;
}

export async function getAllDataList (callback){
    const getDataQuery = 
    `SELECT title, descript, owner_nickname, h_ct from data;`

    const [data] = await promiseConnection.execute(getDataQuery)
    console.log(data);
    return data;
}

export async function getMyData(nickname){
    const getMyDataQuery = 
    `SELECT title, descript, h_ct, enc_key FROM data WHERE owner_nickname='${nickname}';`
    
    const [rows, fields] = await promiseConnection.execute(getMyDataQuery);
    console.log(rows);
    return rows
}

export async function getDataInfoFromHct(h_ct) {
    const getDataInfoFromHctQuery = 
    `SELECT * FROM data WHERE h_ct='${h_ct}';`

    const [rows] = await promiseConnection.execute(
        getDataInfoFromHctQuery
    );
    console.log(rows);
    return rows
}

export async function getSkEncKey(lgTk) {
    try {
        const getSkQuery = `SELECT sk_enc FROM user where login_tk=?`
        const [rows, fields] = await promiseConnection.execute(getSkQuery, [`${lgTk}`]);
        console.log('getSkEncKey : ', rows, fields);
        return rows[0].sk_enc;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

export async function getUserInfo(lgTk) { 
    try {
        const getUserInfoQuery = `SELECT * from user where login_tk=?`
        const [rows, fields] = await promiseConnection.execute(getUserInfoQuery, [`${lgTk}`]);
        return rows[0];
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function getUserKeysFromNickname(nickname) {
    try {
        const getUserKeyQuery = `SELECT nickname, pk_enc, pk_own from user where nickname=?`
        const [rows] = await promiseConnection.execute(getUserKeyQuery, [`${nickname}`])
        return rows[0]
    } catch (error) {
        console.log(error);
        return undefined;
    }
}



const mySqlHandler = {
    nicknameDuplicateCheckQuery,
    duplicateCheckQuery,
    getUserNum,
    getUserInfoFromId,
    idDuplicateCheckQuery,
    userJoinQuery,
    userLoginQuery,
    registDataQuery,
    getAllDataList,
    getDataList,
};

export default mySqlHandler;