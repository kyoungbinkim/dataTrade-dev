import express from 'express';
import login from './login.js';
import join from './join.js'

const usrRouter = express.Router();

usrRouter.use('/login',login);
usrRouter.use('/join', join);

export default usrRouter;