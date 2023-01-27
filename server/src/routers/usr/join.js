import express from 'express';
import { 
    nicknameDeduplicateCheckController,
    addressDeduplicateChcekController,
    joinController,
} from '../../controller/userController.js';

const router = express.Router();

router.get('/', (req, res) => {
    const msg = req.query.msg;
    res.render('./', { msg });
});

router.get('/check/nickname/:nickname', nicknameDeduplicateCheckController);

router.get('/check/address/:address', addressDeduplicateChcekController)

router.post('/join', joinController);
  
export default router;