import { mysqlConfig, fileStorePath } from "../utils/config.js";
import mysql from 'mysql';
import _ from 'lodash';

const connection = mysql.createConnection(mysqlConfig);

// const userInsertUserQuery = `INSERT INTO users(id, pwToken, nickname) VALUES('${id}', '${pwTk}', '${nickname}');`

/**
 * 
 * @param {String} id 
 * @param {Callback} callback 
 * 
 * @return {boolean} true: you can use Id 
 */
export function idDuplicateCheckQuery(id, callback) {
    const duplicateCheck = `select id from users where id=?`;
    connection.query(duplicateCheck, [`${id}`], (err, res) => {
        if(err) { callback(err, false); }
        console.log("in handler",id, res);
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
    const duplicateCheck = `select ${type} from users where ${type}=?`;
    connection.query(duplicateCheck, [`${val}`], (err, res) => {
        if(err) { callback(err, false); return;}
        callback(null, res.length==0);
    })
}

export function getUserNum(callback){
    connection.query(`select max(seq)+1 from users;`,num = (err, row) => {
        if(err){ callback(null); }
        callback(row[0][`max(seq)+1`]);
    });
}

export function userJoinQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const id      = userInfoJson['id'];
    const pwToken = userInfoJson['pw'] ?? userInfoJson['pwTk'];
    const nickname = userInfoJson['nickname'];
}


const mySqlHandler = {
    duplicateCheckQuery,
    getUserNum,
    idDuplicateCheckQuery,
    userJoinQuery,
};

export default mySqlHandler;