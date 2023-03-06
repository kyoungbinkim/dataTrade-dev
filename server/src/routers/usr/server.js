import { serverKeyController, userKeyController } from "../../controller/userController";
import express from 'express';

// usr/server
const router = express.Router();

router.get('/keys', serverKeyController);

router.get('/user_keys/:nickname', userKeyController);

export default router;