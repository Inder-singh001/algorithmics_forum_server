const express    =  require('express');
const postcommentsRouter = express.Router();
const PostCommentsController = require('../../controller/frontend/PostCommentsController');

postcommentsRouter.get('/post-comments/index', PostCommentsController.index);
postcommentsRouter.get('/post-comments/view/:id',PostCommentsController.detail);
postcommentsRouter.post('/post-comments/add',PostCommentsController.add);
// postcommentsRouter.post('/post-comments/update/:id',PostCommentsController.update);
// postcommentsRouter.post('/post-comments/update-status/:id',PostCommentsController.updateStatus);
postcommentsRouter.get('/post-comments/delete/:id',PostCommentsController.deleteRow);

module.exports =  postcommentsRouter;