import express from 'express';
import { getAllUsers, getAUser, loginUser, updateName, verifyUser } from '../controllers/user.js';
import { isAuth } from '../middleware/isAuth.js';
import { myProfile } from '../controllers/user.js';

const router = express.Router();

router.post('/login', loginUser);

router.post("/verify",verifyUser)

router.get('/me', isAuth, myProfile);

router.get('/user/all',isAuth,getAllUsers);

router.get('/user/:id',isAuth,getAUser);

router.post('/update/user',isAuth,updateName)

export default router;