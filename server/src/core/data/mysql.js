import { mysqlConfig, fileStorePath } from "../utils/config.js";
import randomWord from 'random-words';
import mysql from 'mysql2';
import _ from 'lodash';

const connection = mysql.createConnection(mysqlConfig);

function nicknameDuplicateCheckQuery(nickname, callback) {
    const duplicateCheck = `select nickname from user where id=?`;
    connection.query(duplicateCheck, [`${nickname}`], (err, res) => {
        if(err) { callback(err, false); }
        callback(null, res.length==0);
    });
}

function userJoinQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const loginTk  = userInfoJson['loginTk'] ?? userInfoJson['login_tk'] ??userInfoJson['login_token'] 
    const nickname = userInfoJson['nickname'] ?? randomWord()+randomWord();
    const skEnc    = userInfoJson['skEnc'];
    const pkOwn    = userInfoJson['pkOwn'];
    const pkEnc    = userInfoJson['pkEnc'];
    const addr     = userInfoJson['addr'] ?? userInfoJson['ena'];
    const userInsertUserQuery = 
        `INSERT INTO user (login_tk, nickname, sk_enc, pk_own, pk_enc, addr) 
        VALUES('${loginTk}', '${nickname}','${skEnc}', '${pkOwn}', '${pkEnc}', '${addr}');`
    connection.query(userInsertUserQuery, (err, result) => {
        if(err){console.log(err); callback(false); return;}
        console.log("userInsertUserQuery",result);
        callback(true);
    })
    
}

export function userLoginQuery(userInfoJsonInput, callback){
    const userInfoJson = _.isString(userInfoJsonInput)? JSON.parse(userInfoJsonInput) : userInfoJsonInput;

    const loginTk = userInfoJson['loginTk']
    const loginQuery = `select login_tk, nickname from user where login_tk=?`

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
            flag : false,
            nickname : row[0].nickname,
        });
    });
}