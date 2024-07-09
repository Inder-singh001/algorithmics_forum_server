const { encrypt } = require("../helper/General");

module.exports = (dbConnection, { Schema }) => {
  let { ObjectId } = Schema;

  let UserSchema = new Schema({
    author: {
      type: ObjectId,
    },
    first_name: {
        type: String,
        required: false,
        get: function(value) {
        return value + this.last_name;
        },
    },
    last_name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
      set: (value) => {
        return encrypt(value);
      },
    },
    email_verified: {
      type: Boolean,
      required: false,
    },
    email_verified_at: {
      type: Date,
      required: false,
    },
    last_login_at: {
      type: Date,
      required: false,
    },
    otp: {
      type: Number,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    login_token: {
      type: String,
      required: false,
    },
    token_expiry_at: {
      type: Date,
      required: false,
    },
    about_me: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
      required: false,
    },
    updated_at: {
      type: Date,
      required: false,
    },
    status: {
      type: Number,
      default: 1,
    },
  });
  let user = dbConnection.model("user", UserSchema);
  return user;
};
