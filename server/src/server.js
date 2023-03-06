import _ from 'lodash';
import express from "express";
import rootRouter from "./routers";
import path, { resolve } from 'path';
import cors from 'cors';
import bodyParser from "body-parser";
import { spawn } from 'child_process';

import UserKey from "./core/wallet/keyStruct";
import Config from './core/utils/config';
import { hexToDec } from './core/contracts/utils';
import { userJoinQuery } from './core/data/db.mysql';
import { getTradeContract } from './core/contracts';

// 서버 함수 비동기로 설정
const server = async (initDB=false) => {
    initServerAccount(initDB);
    const app = express();
    const port = 10801;
    const __dirname = path.resolve();

    // app.use(express.static(path.join(__dirname, '../front/build')));
    // app.get('/', function (요청, 응답) {
    //     응답.sendFile(path.join(__dirname, '../front/build/index.html'));
    // });

    app.use(cors({
        origin: '*', // 모든 출처 허용 옵션. true 를 써도 된다.
    }));
    app.use(bodyParser.json());
    app.use('/', rootRouter);   // 서버가 실행되기 전에 set 라우터 지정
    
    app.set('port', port);
    app.listen(port);
};

export const clearDB = () => {
    return new Promise((resolve, reject) => {
        let prcss = spawn('bash');

        try {
            prcss.stdin.write('npm run clean');

            prcss.stdin.end();

            prcss.on('close', function (code) {
                console.log('end')
                resolve(code);
            });
        } catch (err) {
            console.log('error')
            reject(err);
        }
    })
}

export const initServerAccount = async (initDBflag=false) => {
    const serverKey = UserKey.keyGen();

    _.set(Config.keys, 'pk_enc', serverKey.pk.pkEnc);
    _.set(Config.keys, 'sk_enc', serverKey.skEnc );
    _.set(Config.keys, 'pk_own', serverKey.pk.pkOwn);
    _.set(Config.keys, 'sk_own', serverKey.skOwn);
    _.set(Config.keys, 'addr', serverKey.pk.ena);

    if (initDBflag){
        try {
            
            await clearDB()

            const receipt = await getTradeContract().registUser(
                hexToDec(_.get(Config.keys, 'pk_own')),
                hexToDec(_.get(Config.keys, 'pk_enc')),
                (_.get(Config, 'ethAddr')),
            )
            console.log(receipt);

            userJoinQuery(
                _.merge(Config.keys, 
                    {
                        'nickname'  : 'server',
                        'loginTk'   : serverKey.getLoginTk(),
                        'EOA'       : _.get(Config, 'ethAddr')
                    }),
                    (flag) => {
                        if (!flag) {process.exit();}
                    }
            )
        } catch (error) {
            console.log(error);
            process.exit();
        }
    }
}   

export default server;