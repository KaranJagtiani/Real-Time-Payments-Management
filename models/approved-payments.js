const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;

const approvedPaymentsSchema = mongoose.Schema({
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
    type: String,
    required: true,
  },
});

const ApprovedPayments = (module.exports = mongoose.model(
  "ApprovedPayments",
  approvedPaymentsSchema
));

module.exports.getApprovedPaymentById = function (id, callback) {
  ApprovedPayments.findById({ _id: id }, callback);
};

module.exports.getApprovedPaymentByBusinessName = function (
  businessName,
  callBack
) {
  ApprovedPayments.find({ businessName: businessName }, callBack);
};

module.exports.getApprovedPaymentByHolderName = function (
  holderName,
  callBack
) {
  ApprovedPayments.find({ name: holderName }, callBack);
};

module.exports.getApprovedPaymentByBookieUsername = function (
  bookieUsername,
  callBack
) {
  ApprovedPayments.find({ bookieUsername: bookieUsername }, callBack);
};

module.exports.addNewApprovedPayment = function (approvedPayment, callBack) {
  approvedPayment.save(callBack);
};

module.exports.removeApprovedPaymentById = function (_id, callback) {
  ApprovedPayments.deleteOne({ _id: ObjectId(_id) }, callback);
};

module.exports.deleteAllData = function (callBack) {
  ApprovedPayments.deleteMany({}, callBack);
};
