const { update } = require("../models/frontend/PostVote");

module.exports = (dbConnection, { Schema }) => {
    let { ObjectId } = Schema;
    
    let UserFriendsSchema = new Schema({
        author: {
            type: ObjectId,
        },
        user_id: {
            type: ObjectId,
            required: false,
            ref: "user",
        },
        friend_id: {
            type: ObjectId,
            required: false,
            ref: "user",
        },
        created_at: {
            type: Date,
            required: false,
        },
        updated_at: {
            type: Date,
            required: false,
        },
        });

    let userFriends = dbConnection.model("user_friends", UserFriendsSchema);

    return userFriends;
}