module.exports = (dbConnection, { Schema }) => {
  let { ObjectId } = Schema;

  let PostVoteSchema = new Schema({
    author: {
      type: ObjectId,
    },

    user_id: {
      type: ObjectId,
      required: false,
      ref: "user",
    },

    post_id: {
      type: ObjectId,
      required: false,
      ref: "post",
    },

    type: {
      type: Number,
      required: true,
      default: 0,
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

  let postVote = dbConnection.model("post_vote", PostVoteSchema);

  return postVote;
};
