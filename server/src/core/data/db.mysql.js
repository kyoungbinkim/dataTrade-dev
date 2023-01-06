import { mysqlConfig, fileStorePath } from "../utils/config.js";
import randomWord from 'random-words';
import mysql from 'mysql';
import _ from 'lodash';
import math from "../utils/math.js";

const connection = mysql.createConnection(mysqlConfig);

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

export function userJoinQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const id       = userInfoJson['id'];
    const pwToken  = userInfoJson['pw'] ?? userInfoJson['pwTk'];
    const nickname = userInfoJson['nickname'] ?? randomWord()+randomWord();
    const pkOwn    = userInfoJson['pkOwn'];
    const pkEnc    = userInfoJson['pkEnc'];
    const ENA      = userInfoJson['ena'];
    const userInsertUserQuery = 
        `INSERT INTO user (id, pw, nickname, pk_own, pk_enc, ENA) 
        VALUES('${id}', '${pwToken}', '${nickname}', '${pkOwn}', '${pkEnc}', '${ENA}');`
    connection.query(userInsertUserQuery, (err, result) => {
        if(err){console.log(err); callback(false); return;}
        console.log("userInsertUserQuery",result);
        callback(true);
    })
    
}

export function userLoginQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const id    = userInfoJson["id"];
    const pwTk  = userInfoJson["pw"]?? userInfoJson["pwTk"];
    const userPwCheckQuery = `select id, pw from user where id=?`

    connection.query(userPwCheckQuery, [`${id}`], (err, row) => {
        if(err) {console.log(err); callback(false); return;}
        if(row.length == 0){
            console.log("id does not exist");
            callback(false);
            return;
        }
        console.log(row);
        if(row[0].pw === pwTk){
            callback(true); return;
        }
        callback(false);
    });
}

export function registDataQuery(registDataJsonInput, callback){
    const registDataJson = _.isString(registDataJsonInput) ? JSON.parse(registDataJsonInput) : registDataJsonInput;

    const userId = registDataJson[`id`] ?? registDataJson['userId'];
    const title  = registDataJson[`title`];
    const desc   = registDataJson[`desc`] ?? registDataJson[`descript`] ??registDataJson[`description`];
    const idData = registDataJson[`id_data`] ?? registDataJson[`h_data`];
    const encKey = registDataJson[`enc_key`] ?? registDataJson[`dataEncKey`] ?? registDataJson[`key`];
    const path   = registDataJson[`filePath`] ?? registDataJson[`enc_data_path`] ?? registDataJson[`path`];
    const h_ct   = registDataJson[`h_ct`] ?? registDataJson[`hCt`];
    const registQuery = 
    `INSERT INTO book (user_id, title, descript, h_data, enc_key, enc_data_path, h_ct) 
    VALUES('${userId}', '${title}', '${desc}', '${idData}', '${encKey}', '${path}', '${h_ct}');`

    connection.query(registQuery, (err, result) => {
        if(err){console.log(err); callback(false); return;}
        callback(true);
    }) 
}

export function getDataList(ind, callback) { 
    const getDataQuery = 
    `SELECT title, descript, user_id, enc_data_path from book LIMIT ${ind*10}, 10;`

    try {
        connection.query(getDataQuery, (err, result) => {
            if(err){
                console.log(err);
                callback(err, undefined); 
                return;
            }
            callback(undefined, result);
        }) 
    } catch (error) {
        callback(error, undefined);
    }
}

export function getAllDataList (callback){
    const getDataQuery = 
    `SELECT title, descript, user_id, enc_data_path from book;`

    try {
        connection.query(getDataQuery, (err, result) => {
            if(err){
                console.log(err);
                callback(err, undefined); 
                return;
            }
            callback(undefined, result);
        }) 
    } catch (error) {
        callback(error, undefined);
    }
}

const mySqlHandler = {
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