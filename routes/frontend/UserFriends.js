const express    =  require('express');
const userFriendsRouter = express.Router();
const UserFriendsController = require('../../controller/frontend/UserFriendsController');

userFriendsRouter.get('/user-friends/index', UserFriendsController.index);
userFriendsRouter.get('/user-friends/view/:id',UserFriendsController.detail);
userFriendsRouter.post('/user-friends/add',UserFriendsController.add);
userFriendsRouter.post('/user-friends/update/:id',UserFriendsController.update);
userFriendsRouter.get('/user-friends/delete/:id',UserFriendsController.deleteRow);

module.exports =  userFriendsRouter;