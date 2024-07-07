
module.exports = (dbConnection, { Schema }) => {
    let { ObjectId } = Schema;

    let PostCommentsSchema = new Schema({
        author: {
            type: ObjectId,
        },

        user_id: {
            type: ObjectId,
            required: false,
            ref: "post",
        },
        post_id: {
            type: ObjectId,
            required: false,
            ref: "post",
        },
        description: {
            type: String,
            required: true,
        },
        created_at: {
            type: Date,
            required: false,
        },
        parent_id: {
            type: ObjectId,
            required: false,
            ref: "author",
        },
        });

    let postComments = dbConnection.model("post_comments", PostCommentsSchema);

    return postComments;
}