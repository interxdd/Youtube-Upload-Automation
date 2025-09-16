const mongoose = require('mongoose');

const googleTokenSchema = new mongoose.Schema(
  {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    googleId: { type: String, index: true },
    displayName: String,
    photoUrl: String,
    tokens: googleTokenSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


