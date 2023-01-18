import express from 'express';

import { registDataController } from '../../controller/registDataController.js';

const router = express.Router();

router.post('/', registDataController);

export default router;