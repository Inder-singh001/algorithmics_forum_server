const express    =  require('express');
const postVoteRouter = express.Router();
const PostVoteController = require('../../controller/frontend/PostVoteController');

postVoteRouter.get('/post-vote/index', PostVoteController.index);
postVoteRouter.get('/post-vote/view/:id',PostVoteController.detail);
postVoteRouter.post('/post-vote/add',PostVoteController.add);
postVoteRouter.post('/post-vote/update/:id',PostVoteController.update);
postVoteRouter.post('/post-vote/update-status/:id',PostVoteController.updateStatus);
postVoteRouter.get('/post-vote/delete/:id',PostVoteController.deleteRow);

module.exports =  postVoteRouter;