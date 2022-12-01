import express from 'express';
import Web3 from 'web3';

const router = express.Router();
const web3 = new Web3('https://public-node-api.klaytnapi.com/v1/baobab');

router.get('/', (req, res) => {
    console.log("hi i'm in router ~");

    // status 200 means 통신이 정확히 됬다. 404: not found등 의 상태를 적는다.
    return res.status(200).send("hello world !");
});

// 첫번째 인자 url


// await 쓰려면 async를 사용해야한다. 
router.get('/:address', async (req, res) => {
    // console.log(req.params.address);
    const address = req.params.address;
    const balance = await web3.eth.getBalance(address);

    return res.status(200).send(balance);
});




/**
 * params , query, body 로 인자를 받을 수 있다.
 * 
 * url에서 ? -> query
 * body는 url에서 보이지 않는다.
 */


/**
 *  http 프로토콜
 *  get post put delete
 * 
 *  get  : 데이터 요청
 *  post : 데이터가 생성 될 때 ex 회원가입
 *  put  : 데이터가 수정 될 때 ex 정보수정
 *  
 */

 const addressCheck = async (req, res, next) => {
    console.log("address Check");
    next();
 };

 router.get('/:address', addressCheck, async (req, res) => {
     
     const address = req.params.address;
     const balance = await web3.eth.getBalance(address);
     console.log(req.params.address, " balance : ", balance);
     return res.status(200).send(balance);
     
 });


 
 export default router;