import express from 'express';
import { 
    getDataController, 
    getAlldataController,
    getMyDataController, 
} from '../../controller/dataController';
import { registDataController } from '../../controller/registDataController';

const dataRouter = express.Router();

// dataRouter.use('/data',data);
dataRouter.use('/register', registDataController);

dataRouter.get('/page/:ind', getDataController);

dataRouter.get('/page', getAlldataController);

dataRouter.get('/mydata', getMyDataController);

export default dataRouter;