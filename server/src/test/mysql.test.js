import _ from 'lodash';
import mysql from 'mysql';
import mySqlHandler from '../core/data/db.mysql.js';

describe('mysql test', ()=> {    

    const connect = mysql.createConnection({
        host    : "localhost",
        user    : "dataTradeServer",
        password: 'Itsp7501`',
        database: `trade_db`,
    });

    const id = "lee";
    const pwTk = "2e525e7088a20640adbe573881cd422e83aa15fdd757fcfe8b7a172dd18918e8";
    const nickname = "best Writer"
    const userInsertUserQuery = `INSERT INTO users(id, pwToken, nickname) VALUES('${id}', '${pwTk}', '${nickname}');`
    // const duplicateCheckQuery =  `select ${id}, count(${id}) from users group by id HAVING COUNT(id) >= 1;`;
    const duplicateCheckQuery = `select id from users where id=?`;
    const selectQuery = `select * from users`;
    const userPwCheckQuery = `select id, pwToken from users where id=?`

    
    connect.connect();
    it("first", (done) => {

        console.log(pwTk.length);
        

        // connect.query(userInsertUserQuery, (err, result) => {
        //     if(err) {console.log(err); return;}
        //     console.log(result);
        // })

        connect.query(`select id from users`, (err, row, field) => {
            if(err){return;}
            console.log(row);
        })

        connect.query(selectQuery, (err, rows, feild) => {
            if(err){console.log(err); return;}
            console.log(rows);
            // console.log(feild);
        });

        

        done();
    }).timeout(1000);

    it('duplicate query' , (done) => {
        connect.query(duplicateCheckQuery,[`${id}`], (err, res)=>{
            if(err) {console.log(err); return;}
            console.log(res, res.length);
        })

        connect.query(duplicateCheckQuery, ['kim'], (err, res) => {
            if(err) {console.log(err); return;}
            console.log("query for kim : ", res);
        })

        connect.query(`select max(seq)+1 as usrCnt from users;`, (err, res) =>{
            console.log("select max(seq)+1 as usrCnt from users;", res[0].usrCnt);
        })

        connect.query(userPwCheckQuery, ['lee2'], (err, row) =>{
            if(err) {console.log(err); return;}
            if(row.length == 0){
                console.log("row: ", row);
                return;
            }
            console.log(row[0].id, row[0].pwToken);
        })

        done();
    }).timeout(1500);
    
    it('end', (done) => {
        connect.end();
        done();
    }).timeout(500);

    it("mySqlhandler duplicate check", (done)=> {

        // mySqlHandler.idDuplicateCheckQuery("lee", (err, flag) => {
        //     if(err) {console.log(err); return;}
        //     console.log("check duplicate: ", flag);
        // })
        // console.log("check duplicate: ", mySqlHandler.idDuplicateCheckQuery("kim"));

        done();
    }).timeout(1000);

});