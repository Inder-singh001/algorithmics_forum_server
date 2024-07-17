const express    =  require('express');
const userRouter = express.Router();
const UserController = require('../../controller/frontend/UserController');

userRouter.get('/user',UserController.index);
userRouter.get('/user/view/:id',UserController.detail);
userRouter.post('/user/add',UserController.add);
userRouter.post('/user/update/:id',UserController.update);
userRouter.post('/user/update-status/:id',UserController.updateStatus);
userRouter.get('/user/delete/:id',UserController.deleteRow);

userRouter.get('/user/profile',UserController.profile);
userRouter.post('/user/sign-up',UserController.signup);
userRouter.post('/user/resend-otp',UserController.resendOtp);
userRouter.post('/user/verify-otp',UserController.verifyOtp);
userRouter.post('/user/login',UserController.login);
userRouter.post('/user/change-password',UserController.changePassword);
userRouter.post('/user/reset-password',UserController.resetPassword);
userRouter.get('/user/user-comments',UserController.userComment);


module.exports =  userRouter;