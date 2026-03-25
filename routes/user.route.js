import express from 'express';
import { editprofile, folllowOrUnfollow, getprofile, getSuggestedUser, login, logout, register } from '../controllers/user.controller.js';
import { isAuthentication } from '../middlewares/isAuthentication.js';
import upload from '../middlewares/multer.js';
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthentication,getprofile);
router.route('/profile/edit').post(isAuthentication,upload.single('profile'),editprofile);
router.route('/suggested').get(isAuthentication,getSuggestedUser);
router.route('/folllowOrUnfollow/:id').post(isAuthentication,folllowOrUnfollow);
export default router;

