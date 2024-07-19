const express    =  require('express');
const uploadsRouter = express.Router();
const UploadsController = require('../../controller/frontend/UploadsController');

uploadsRouter.post('/uploadsBase64',UploadsController.upload);
module.exports =  uploadsRouter;