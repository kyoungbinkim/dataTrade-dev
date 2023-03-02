import express from 'express';
import login from './login.js';
import join from './join.js';
import server from './server.js';

const usrRouter = express.Router();

usrRouter.use('/login',login);

usrRouter.use('/join', join);

usrRouter.use('/server', server);

export default usrRouter;