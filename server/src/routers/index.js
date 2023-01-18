import express from 'express';
import usr from './usr/index';
import data from './data/index';
import { authMiddleWare } from '../core/crypto/jwt';

const rootRouter = express.Router();

//use : 서버가 켜질때 동작되는 middleWare 
rootRouter.use('/usr', usr);
rootRouter.use('/data',authMiddleWare, data);

export default rootRouter;