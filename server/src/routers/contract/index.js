import express from 'express';
import { 
    getContractAbiController,
    callIsRegisteredDataController, 
} from '../../controller/contractController';

const contractRouter = express.Router();

contractRouter.get('/getAbi', getContractAbiController);

contractRouter.get('/isRegister/:h_ct', callIsRegisteredDataController)

export default contractRouter;