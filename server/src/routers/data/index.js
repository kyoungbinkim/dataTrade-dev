import express from 'express';
import data from './data';

const dataRouter = express.Router();

dataRouter.use('/data',data);

export default dataRouter;