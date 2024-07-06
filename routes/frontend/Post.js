const express    =  require('express');
const postRouter = express.Router();
const PostController = require('../../controller/frontend/PostController');

postRouter.get('/post/index', PostController.index);
postRouter.get('/post-category/view/:id',PostController.detail);
postRouter.post('/post-category/add',PostController.add);
postRouter.post('/post-category/update/:id',PostController.update);
postRouter.post('/post-category/update-status/:id',PostController.updateStatus);
postRouter.get('/post-category/delete/:id',PostController.deleteRow);

module.exports =  postRouter;