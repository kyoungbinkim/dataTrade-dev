import express from 'express';
import Login from '../../core/wallet/login.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("hi");
});
  

router.post('/login', (req, res, next) => {
  console.log(req.body);
  const id    = req.body["id"];
  const pwTk  = req.body["pw"];
  
  const response = {
    flag  : false,
    sid  : undefined
  };

  if(Login.login(id, pwTk)){
    const sid = Login.makeUID();
    response["sid"] = sid;
    response["flag"] = true;  
  }
  else{
    response["flag"] = false
  }
  res.status(200).send(response); 
});
  
export default router;