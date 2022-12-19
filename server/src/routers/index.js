import express from 'express';
import hello from './hello';
import crypto from './cypto';
import usr from './usr/index';
import data from './data/index';

const rootRouter = express.Router();

//use : 서버가 켜질때 동작되는 middleWare 
rootRouter.use('/hello',  hello);
rootRouter.use('/cypto', crypto);
rootRouter.use('/usr', usr);
rootRouter.use('/data', data);

export default rootRouter;