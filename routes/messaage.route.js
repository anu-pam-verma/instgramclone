import express from 'express';
import { isAuthentication } from '../middlewares/isAuthentication.js';
import { getMessage, sendMessage } from '../controllers/message.controller.js';
const router = express.Router();


router.route('/send/:id').post(isAuthentication,sendMessage);
router.route('/all/:id').get(isAuthentication,getMessageMessage);


export default router;

