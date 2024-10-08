
module.exports = (dbConnection, { Schema }) => {
    let { ObjectId } = Schema;

    let PostSchema = new Schema({
        author: {
            type: ObjectId
        },
        user_id: {
            type: ObjectId,
            ref: 'user',
            required:true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        file: {
            type: String,
            required: false
        },
        status: {
            type: Number,
            default: 1
        },
        type: {
            type: String,
            default: "Public"
        },
        share_count: {
            type: Number,
            required: false
        },
        created_at: {
            type: Date,
            required: false,
        },
        updated_at: {
            type: Date,
            required: false,
        },
        cat_id: {
            type: ObjectId,
            required: false,
            ref: 'post_category'
        }
    });

    let post = dbConnection.model('post', PostSchema);

    return post;
}