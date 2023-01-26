import express from 'express';
import { 
    getContractAbiController,
    callIsRegisteredDataController, 
    getAllAddressController,
} from '../../controller/contractController';

const contractRouter = express.Router();

contractRouter.get('/getAbi', getContractAbiController);

contractRouter.get('/isRegister/:h_ct', callIsRegisteredDataController)

contractRouter.get('/getAddr', getAllAddressController);

export default contractRouter;