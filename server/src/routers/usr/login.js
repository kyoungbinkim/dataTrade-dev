import express from 'express';
import { 
  loginController 
} from '../../controller/userController.js';

// usr/login
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send("hi");
});
  
router.post('/login', loginController);
  
export default router;