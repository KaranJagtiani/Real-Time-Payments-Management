const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  mobile: {
    type: String,
    required: false,
  },
  admin: {
    type: Boolean,
    required: false,
  },
  bookie: {
    type: Boolean,
    required: false,
  },
  businesses: {
    type: [String],
    required: false,
  },
});

const User = (module.exports = mongoose.model("User", userSchema));

module.exports.getUserById = function (id, callback) {
  User.findById({ _id: id }, { password: 0 }, callback);
};

module.exports.getUserByUsername = function (username, callBack) {
  const query = { username: username };
  User.findOne(query, callBack);
};

module.exports.getUserByEmail = function (email, callback) {
  const query = { email: email };
  User.findOne(query, callback);
};

module.exports.addUser = function (newUser, callback) {
  newUser.save(callback);
};

module.exports.updatePassword = function (newUser, callback) {
  User.updateOne(
    { username: newUser.username },
    { $set: { password: newUser.newPassword } },
    callback
  );
};

module.exports.getAllUsers = function (query, callback) {
  User.find({}, { password: 0 }, callback);
};

module.exports.getAllBookies = function (callback) {
  User.find({ bookie: true }, callback);
};

module.exports.deleteAccount = function (username, callback) {
  User.deleteOne({ username: username }, callback);
};

module.exports.addBusiness = function (username, businessName, callBack) {
  User.updateOne(
    { username: username },
    { $push: { businesses: businessName } },
    callBack
  );
};

module.exports.removeBusiness = function (username, businessName, callBack) {
  User.updateOne(
    { username: username },
    { $pull: { businesses: businessName } },
    callBack
  );
};

module.exports.deleteAllData = function (callBack) {
  User.deleteMany({}, callBack);
};
