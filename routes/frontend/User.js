const express    =  require('express');
const userRouter = express.Router();
const UserController = require('../../controller/frontend/UserController');

userRouter.get('/user',UserController.index);
userRouter.get('/user/view/:id',UserController.detail);
userRouter.post('/user/add',UserController.add);
userRouter.post('/user/update/:id',UserController.update);
userRouter.post('/user/update-status/:id',UserController.updateStatus);
userRouter.get('/user/delete/:id',UserController.deleteRow);

module.exports =  userRouter;