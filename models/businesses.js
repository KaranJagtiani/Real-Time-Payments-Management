const mongoose = require("mongoose");

const businessSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  bookies: {
    type: [Object],
    required: false,
  },
});

const Business = (module.exports = mongoose.model("Business", businessSchema));

module.exports.getBusinessById = function (id, callback) {
  Business.findById({ _id: id }, callback);
};

module.exports.getBusinessByName = function (name, callBack) {
  Business.findOne({ name: name }, callBack);
};

module.exports.getAllBusinesses = function (callBack) {
  Business.find({}, callBack);
};

module.exports.addNewBusiness = function (business, callBack) {
  business.save(callBack);
};

module.exports.removeBusiness = function (businessName, callback) {
  Business.deleteOne({ name: businessName }, callback);
};

module.exports.addBookie = function (name, bookie, callBack) {
  Business.updateOne({ name: name }, { $push: { bookies: bookie } }, callBack);
};

module.exports.removeBookie = function (name, bookie, callBack) {
  Business.updateOne(
    { name: name },
    { $pull: { bookies: { username: bookie.username } } },
    callBack
  );
};

module.exports.deleteAllData = function (callBack) {
  Business.deleteMany({}, callBack);
};
