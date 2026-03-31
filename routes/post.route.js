import express from 'express';
import { isAuthentication } from '../middlewares/isAuthentication.js';
import { addcomment, addNewPost, bookMarkPost, deletePost, disLikePost, getAllPost, getCommentOfPost, getUserPost, likePost } from '../controllers/post.controller.js';
import upload from '../middlewares/multer.js';

const router = express.Router();


router.route('addpost').post(isAuthentication,upload.single('image'),addNewPost);
router.route('/all').get(isAuthentication,getAllPost);
router.route('/userpost/all').get(isAuthentication,getUserPost);
router.route('/:id/like').get(isAuthentication,likePost);
router.route('/:id/dislike').get(isAuthentication,disLikePost);
router.route('/:id/comment').post(isAuthentication,addcomment);
router.route('/:id/comment/all').post(isAuthentication,getCommentOfPost);
router.route('/delete/:id').post(isAuthentication,deletePost);
router.route('/:id/bookmark').post(isAuthentication,bookMarkPost);


export default router;

