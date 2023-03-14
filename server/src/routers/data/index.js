import express from 'express';
import { 
    getDataController, 
    getAlldataController,
    getMyDataController, 
    getInfoFromHct
} from '../../controller/dataController';
import { genTradeController } from '../../controller/genTradeController';
import { registDataController } from '../../controller/registDataController';

const dataRouter = express.Router();

// dataRouter.use('/data',data);
dataRouter.post('/register', registDataController);

dataRouter.get('/page/:ind', getDataController);

dataRouter.get('/page', getAlldataController);

dataRouter.get('/mydata', getMyDataController);

dataRouter.get('/info/:h_ct', getInfoFromHct);

dataRouter.get('/gentrade/:h_ct/:tx_hash', genTradeController);

export default dataRouter;