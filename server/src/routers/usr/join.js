import express from 'express';
import LoginHelper from '../../core/wallet/login.js';
import JoinHelper from '../../core/wallet/join.js';
import mySqlHandler from '../../core/data/db.mysql.js';

const router = express.Router();

router.get('/', (req, res) => {
    const msg = req.query.msg;
    res.render('./', { msg });
});

router.get('/duplicate/:id', async (req, res) => {
    const id = req.params.id;
    mySqlHandler.idDuplicateCheckQuery(id, (err, flag) => {
        if(err) {return res.status(400).send(flag);}
        
        console.log("out of handler ",id, flag);
        return res.status(200).send(flag);
    });
    // const duplicateFlag = JoinHelper.idDuplicateCheck(id);
    // return res.status(200).send(duplicateFlag);
});

router.post('/join', (req, res) => {
     
    const id    = req.body["id"];
    const pwTk  = req.body["pw"];
    console.log(req.body);

    if(!JoinHelper.idDuplicateCheck(id)){
        return res.status(400).send("id already exsist");
    }

    if(!JoinHelper.idLengthCheck(id)){
        return res.status(400).send("id is too long");
    }

    console.log("id check sucess");
    if(JoinHelper.writeDB(id, pwTk)){
        return res.status(200).send("sucess");
    }
    else{
        return res.redirect('/');
    }
  });
  
export default router;