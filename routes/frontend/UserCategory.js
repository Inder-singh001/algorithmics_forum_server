const express    =  require('express');
const userCategoryRouter = express.Router();
const UserCategoryController = require('../../controller/frontend/UserCategoryController');

userCategoryRouter.get('/user-category/index', UserCategoryController.index);
userCategoryRouter.get('/user-category/view/:id',UserCategoryController.detail);
userCategoryRouter.post('/user-category/add',UserCategoryController.add);
userCategoryRouter.post('/user-category/update/:id',UserCategoryController.update);
userCategoryRouter.post('/user-category/update-status/:id',UserCategoryController.updateStatus);
userCategoryRouter.get('/user-category/delete/:id',UserCategoryController.deleteRow);

module.exports =  userCategoryRouter;