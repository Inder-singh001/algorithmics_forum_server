const express    =  require('express');
const postCategoryRouter = express.Router();
const PostCategoryController = require('../../controller/frontend/PostCategoryController');

postCategoryRouter.get('/post-category',PostCategoryController.index);
postCategoryRouter.get('/post-category/view/:id',PostCategoryController.detail);
postCategoryRouter.post('/post-category/add',PostCategoryController.add);
postCategoryRouter.post('/post-category/update/:id',PostCategoryController.update);
postCategoryRouter.post('/post-category/update-status/:id',PostCategoryController.updateStatus);
postCategoryRouter.get('/post-category/delete/:id',PostCategoryController.deleteRow);

module.exports =  postCategoryRouter;