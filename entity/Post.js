
module.exports = (dbConnection, {Schema}) => {
    let { ObjectId } = Schema;

    let PostSchema = new Schema({
        author: {
            type:ObjectId
        },
        title: {
            type:String,
            required:true
        },
        description: {
            type:String,
            required:false
        },
        file: {
            type:String, //"/uploads/jsbgsghsreg.pdf"
            required:false
        },
        status:  {
            type:Number,
            default:1
        },
        type:{
            type:String,
            default:"Public"
        },
        share_count: {
            type:Number,
            required:false
        },
        created_at:{
            type:String,
            required:false,
        },
        updated_at:{
            type:String,
            required:false,
        },
        cat_id:{
            type:ObjectId,
            required:false,
            ref:'post_category'
        }
    });

    let post = dbConnection.model('post',PostSchema);
    
    return post;
}