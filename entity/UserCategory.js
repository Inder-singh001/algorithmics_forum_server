
module.exports = (dbConnection, {Schema}) => {
    let { ObjectId } = Schema;

    let UserCategorySchema = new Schema({
        author: {
            type:ObjectId
        },
        category_id: {
            type:ObjectId,
            required:true,
        },
        user_id: {
            type:ObjectId,
            required:true,
            ref: "user",
        },
        created_at: {
            type:Date
        },
        });

    let userCategory = dbConnection.model('user_category',UserCategorySchema);
    
    return userCategory;
}