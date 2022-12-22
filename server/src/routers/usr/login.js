import express from 'express';
import Login from '../../core/wallet/login.js';
import mySqlHandler from '../../core/data/db.mysql.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("hi");
});
  

router.post('/login', (req, res, next) => {

  mySqlHandler.userLoginQuery(req.body, (loginFlag) => {
    const response = {
      flag  : false,
      sid  : undefined
    };
    if(loginFlag){
      const sid = Login.makeUID();
      response["flag"] = true; 
      response["sid"] = sid;
    }
    res.status(200).send(response); 
  })
});
  
export default router;