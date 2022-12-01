import express from 'express';
import hello from './hello';
import crypto from './cypto';

const rootRouter = express.Router();

//use : 서버가 켜질때 동작되는 middleWare 
rootRouter.use('/hello',  hello);
rootRouter.use('/cypto', crypto);

export default rootRouter;