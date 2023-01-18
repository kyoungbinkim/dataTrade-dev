import express from 'express';
import register from './register_data';
import { 
    getDataController, 
    getAlldataController,
    getMyDataController, 
} from '../../controller/dataController';

const dataRouter = express.Router();

// dataRouter.use('/data',data);
dataRouter.use('/register', register);

dataRouter.get('/page/:ind', getDataController);

dataRouter.get('/page', getAlldataController);

dataRouter.get('/mydata', getMyDataController);

export default dataRouter;