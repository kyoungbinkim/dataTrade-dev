import express from "express";
import rootRouter from "./routers";
import path from 'path';
import cors from 'cors';

// 서버 함수 비동기로 설정
const server = async () => {
    const app = express();
    const port = 10801;
    const __dirname = path.resolve();
    console.log(__dirname);

    app.use(express.static(path.join(__dirname, '../front/build')));
    app.get('/', function (요청, 응답) {
        응답.sendFile(path.join(__dirname, '../front/build/index.html'));
    });

    app.use(cors(null));        // 모든 것을 허용
    app.use('/', rootRouter);   // 서버가 실행되기 전에 set 라우터 지정
    
    app.set('port', port);
    app.listen(port);
};

export default server;