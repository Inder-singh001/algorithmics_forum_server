module.exports = (dbConnection, {Schema}) => {
    let { ObjectId } = Schema;

    let PostCategorySchema = new Schema({
        author: {
            type:ObjectId
        },
        title: {
            type:String,
            required:true
        },
        slug: {
            type:String,
            required:false
        },
        status:  {
            type:Number,
            default:1
        },
        created_at: {
            type:Date
        },
        updated_at: {
            type:Date
        }
    });

    let postCategory = dbConnection.model('post_category',PostCategorySchema);
    
    return postCategory;
}