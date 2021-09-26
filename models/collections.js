const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;

const collectionsSchema = mongoose.Schema({
  bookieUsername: {
    type: String,
    required: true,
  },
  bookieName: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  originalAmount: {
    type: Number,
    required: true,
  },
  collectedAmount: {
    type: Number,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  typeOfPayment: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  originalDate: {
    type: String,
    required: true,
  },
  collectionDate: {
    type: Date,
    required: true,
  },
});

const Collections = (module.exports = mongoose.model(
  "Collections",
  collectionsSchema
));

module.exports.getCollectionById = function (id, callback) {
  Collections.findById({ _id: id }, callback);
};

module.exports.getCollectionsByBusinessName = function (
  businessName,
  callBack
) {
  Collections.find({ businessName: businessName }, callBack);
};

module.exports.getCollectionsByHolderName = function (holderName, callBack) {
  Collections.find({ name: holderName }, callBack);
};

module.exports.getCollectionsByBookieUsername = function (
  bookieUsername,
  callBack
) {
  Collections.find({ bookieUsername: bookieUsername }, callBack);
};

module.exports.addNewCollection = function (collection, callBack) {
  collection.save(callBack);
};

module.exports.removeCollectionById = function (_id, callback) {
  Collections.deleteOne({ _id: ObjectId(_id) }, callback);
};

module.exports.deleteAllData = function (callBack) {
  Collections.deleteMany({}, callBack);
};
