const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;

const paymentsSchema = mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  amount: {
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
  date: {
    type: Date,
    required: true,
  },
});

const Payments = (module.exports = mongoose.model("Payments", paymentsSchema));

module.exports.getPaymentById = function (id, callback) {
  Payments.findById({ _id: id }, callback);
};

module.exports.getPaymentsByBusinessName = function (businessName, callBack) {
  Payments.find({ businessName: businessName }, callBack);
};

module.exports.getPaymentsByHolderName = function (holderName, callBack) {
  Payments.find({ name: holderName }, callBack);
};

module.exports.addNewPayment = function (payment, callBack) {
  payment.save(callBack);
};

module.exports.removePaymentById = function (_id, callback) {
  Payments.deleteOne({ _id: ObjectId(_id) }, callback);
};

module.exports.updateAmount = function (_id, balance, callback) {
  if (balance == 0) {
    Payments.deleteOne({ _id: ObjectId(_id) }, callback);
  } else {
    Payments.updateOne(
      { _id: ObjectId(_id) },
      { $set: { amount: balance } },
      callback
    );
  }
};

module.exports.deleteAllData = function (callBack) {
  Payments.deleteMany({}, callBack);
};

module.exports.getPaymentsForBookie = function (businesses, callBack) {
  if (businesses.length) {
    let final = [];
    businesses.forEach((data) => {
      final.push({ businessName: data });
    });
    Payments.find({ $or: final }, callBack);
  } else callBack("", []);
};
