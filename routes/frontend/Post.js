const express    =  require('express');
const postRouter = express.Router();
const PostController = require('../../controller/frontend/PostController');

postRouter.get('/post/index', PostController.index);
postRouter.get('/post/view/:id',PostController.detail);
postRouter.post('/post/add',PostController.add);
postRouter.post('/post/update/:id',PostController.update);
postRouter.post('/post/update-status/:id',PostController.updateStatus);
postRouter.get('/post/delete/:id',PostController.deleteRow);
postRouter.get('/post/featured-post',PostController.featuredPost);

postRouter.get('/user/post',PostController.userPost);

module.exports =  postRouter;