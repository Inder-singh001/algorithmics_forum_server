const mongoose = require('mongoose');
require('dotenv').config();

const {
    URI,
    NAME,
    PASSWORD,
    HOST,
    DATABASE_NAME
} = process.env;

// const connectionString = 'mongodb://localhost:27017/new';
const connectionString = `${URI}${NAME}:${PASSWORD}@${HOST}/${DATABASE_NAME}`;

try
{
    var dbConnection = mongoose.createConnection(connectionString)
    console.log('Connection has been established successfully.');
}
catch(error)
{
    console.error('Unable to connect to the database:', error);
}

const db = {};
db.mongoose = mongoose;
db.dbConnection = dbConnection;

// Entity
db.postCategory = require('../entity/PostCategory')(dbConnection, mongoose);
db.user = require ('../entity/User')(dbConnection, mongoose);
db.post = require ('../entity/Post')(dbConnection, mongoose);
db.postVote = require ('../entity/PostVote')(dbConnection, mongoose);


module.exports = db;