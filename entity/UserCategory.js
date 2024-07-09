
module.exports = (dbConnection, {Schema}) => {
    let { ObjectId } = Schema;

    let UserCategorySchema = new Schema({
        author: {
            type:ObjectId
        },
        user_id: {
            type:ObjectId,
            required:true,
            ref: "user",
        },
        cat_id: [{
            type:ObjectId,
            required:false,
            ref : "post_category"
        }],
        updated_at: {
            type:Date
        },
        });

    let userCategory = dbConnection.model('user_category',UserCategorySchema);
    
    return userCategory;
}