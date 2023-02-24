import express from 'express';
import { 
    getContractAbiController,
    getContractAddressController,
    getContractInfoController,
    callIsRegisteredDataController, 
    getAllAddressController,
} from '../../controller/contractController';

const contractRouter = express.Router();

contractRouter.get('/getAbi', getContractAbiController);

contractRouter.get('/isRegister/:h_ct', callIsRegisteredDataController)

contractRouter.get('/getAddr', getContractAddressController);

contractRouter.get('/getInfo', getContractInfoController);

export default contractRouter;