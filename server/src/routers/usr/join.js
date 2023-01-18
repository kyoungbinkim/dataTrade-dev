import express from 'express';
import { 
    deduplicateCheckController,
    joinController,
} from '../../controller/userController.js';

const router = express.Router();

router.get('/', (req, res) => {
    const msg = req.query.msg;
    res.render('./', { msg });
});

router.get('/check/:nickname', deduplicateCheckController);

router.post('/join', joinController);
  
export default router;