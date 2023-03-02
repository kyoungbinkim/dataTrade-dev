import { serverKeyController } from "../../controller/userController";
import express from 'express';

const router = express.Router();

router.get('/keys', serverKeyController);

export default router;