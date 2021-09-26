const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");

const User = require("../../models/user");
const Business = require("../../models/businesses");
const Payments = require("../../models/payments");
const Collections = require("../../models/collections");
const ApprovedPayments = require("../../models/approved-payments");

router.post("/register", (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    email: req.body.email,
    mobile: req.body.mobile,
    bookie: req.body.bookie,
  });
  let confirmPass = req.body.confirmPass;
  if (newUser.password !== confirmPass) {
    return res.json({ success: false, msg: "Password Fields Do Not Match." });
  }
  User.getUserByUsername(newUser.username, (err, user) => {
    if (err) throw err;
    if (user) {
      return res.json({
        success: false,
        msg: "Account with this username already exists.",
      });
    }
    User.addUser(newUser, (err) => {
      if (err) throw err;
      return res.json({ success: true, msg: "Registration Successful." });
    });
  });
});

router.post("/authenticate", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.json({ success: false, msg: "Fill in all the fields." });
  }
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "Invalid Credentials." });
    }
    if (password === user.password) {
      const token = jwt.sign({ data: user }, config.secret, {
        expiresIn: "1h",
      });
      res.json({
        success: true,
        token: "JWT " + token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          admin: user.admin,
          bookie: user.bookie,
        },
      });
    } else {
      return res.json({ success: false, msg: "Invalid Credentials." });
    }
  });
});

router.get(
  "/profile",
  passport.authenticate("user", { session: false }),
  (req, res, next) => {
    res.json({ success: true, user: req.user });
  }
);

// Bookies

router.get("/get-bookies", (req, res, next) => {
  User.getAllBookies((err, bookies) => {
    if (err) throw err;
    res.json({ success: true, bookies: bookies });
  });
});

router.get("/get-bookies-for-business", (req, res, next) => {
  let businessName = decodeURIComponent(req.query.businessName);
  Business.getBusinessByName(businessName, (err, business) => {
    if (err) throw err;
    if (!business) {
      return res.json({ sucess: false, msg: "Business not found" });
    }
    let businessBookies = business.bookies;
    let finalBookies = [];
    User.getAllBookies((err, bookies) => {
      if (err) throw err;

      if (!bookies.length || !businessBookies.length) {
        finalBookies = bookies;
      }

      finalBookies = bookies.filter(function (val) {
        return businessBookies.indexOf(val) == -1;
      });
      finalBookies = bookies;
      for (let i = 0; i < bookies.length; i++) {
        for (let j = 0; j < businessBookies.length; j++) {
          if (bookies[i] && bookies[i].name == businessBookies[j].name)
            finalBookies.splice(finalBookies.indexOf(bookies[i]), 1);
        }
      }
      res.json({
        success: true,
        bookiesToBeAdded: finalBookies,
        businessBookies: businessBookies,
      });
    });
  });
});

// -- Bookies

// Business

router.post("/add_business", (req, res, next) => {
  let newBusiness = new Business({
    name: req.body.name,
  });
  Business.getBusinessByName(newBusiness.name, (err, business) => {
    if (err) throw err;
    if (business)
      return res.json({
        sucess: false,
        msg: "Business with this name already exists.",
      });
    Business.addNewBusiness(newBusiness, (err) => {
      if (err) throw err;
      res.json({ success: true, msg: "Business successfully added." });
    });
  });
});

router.get("/get-businesses", (req, res, next) => {
  Business.getAllBusinesses((err, businesses) => {
    if (err) throw err;
    res.json({ sucess: true, businesses: businesses });
  });
});

router.get("/get-business-by-name", (req, res, next) => {
  let businessName = decodeURIComponent(req.query.businessName);
  Business.getBusinessByName(businessName, (err, business) => {
    if (err) throw err;
    if (!business)
      return res.json({
        sucess: false,
        msg: "Business with this name does not exist.",
      });
    res.json({ success: true, business: business });
  });
});

router.post("/remove_business", (req, res, next) => {
  let businessName = decodeURIComponent(req.body.businessName);
  Business.getBusinessByName(businessName, (err, business) => {
    if (err) throw err;
    if (!business)
      return res.json({
        sucess: false,
        msg: "Business with this name does not exist.",
      });
    Business.removeBusiness(businessName, (err) => {
      if (err) throw err;
      res.json({ success: true, msg: "Business successfully removed." });
    });
  });
});

// -- Business

// Payments

router.get("/get-payments-busiess", (req, res, next) => {
  let businessName = decodeURIComponent(req.query.businessName);
  Payments.getPaymentsByBusinessName(businessName, (err, payments) => {
    if (err) throw err;
    if (!payments)
      return res.json({
        sucess: false,
        msg: "Business with this name does not exist.",
      });

    res.json({ success: true, payments: payments });
  });
});

router.get("/get-payments-bookie", (req, res, next) => {
  let bookieUsername = decodeURIComponent(req.query.username);
  User.getUserByUsername(bookieUsername, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({ success: false, msg: "Bookie not found." });
    }
    let businesses = user.businesses;
    Payments.getPaymentsForBookie(businesses, (err, payments) => {
      if (err) throw err;
      if (!payments) {
        return res.json({ success: false, msg: "Bookie not found." });
      }
      res.json({ success: true, payments: payments });
    });
  });
});

// -- Payments

router.get("/get-collections-of-bookie", (req, res, next) => {
  let bookieUsername = decodeURIComponent(req.query.bookieUsername);
  Collections.getCollectionsByBookieUsername(
    bookieUsername,
    (err, collections) => {
      if (err) throw err;
      if (!collections) {
        return res.json({ success: false, msg: "Bookie not found." });
      }
      res.json({ success: true, collections: collections });
    }
  );
});

router.get("/get-collections-of-business", (req, res, next) => {
  let businessName = decodeURIComponent(req.query.businessName);
  Collections.getCollectionsByBusinessName(businessName, (err, collections) => {
    if (err) throw err;
    if (!collections) {
      return res.json({ success: false, msg: "Bookie not found." });
    }
    res.json({ success: true, collections: collections });
  });
});

// Approved Payments

router.post("/add-approved-payment", (req, res, next) => {
  let obj = req.body;
  console.log("add-approved-payment");
  console.log(obj);
  let obj_id = obj._id;
  delete obj._id;
  Collections.removeCollectionById(obj_id, (err, msg) => {
    if (err) throw err;
    console.log(msg);
    ApprovedPayments.addNewApprovedPayment(
      new ApprovedPayments(obj),
      (err, msg) => {
        if (err) throw err;
        console.log(msg);
        res.json({ success: true, msg: "Payment Approved." });
      }
    );
  });
});

router.get("/get-approved-payments", (req, res, next) => {
  let businessName = decodeURIComponent(req.query.businessName);
  ApprovedPayments.getApprovedPaymentByBusinessName(
    businessName,
    (err, payments) => {
      if (err) throw err;
      if (!payments) {
        return res.json({
          success: false,
          msg: "No payments have been approved.",
        });
      }
      res.json({ success: true, payments: payments });
    }
  );
});

// -- Approved Payments

// Delete all data

router.post("/delete-all-data", (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  if (
    username &&
    password &&
    username === "C00lP@nd@$6578" &&
    password === "J@cKRy@aN*5368"
  ) {
    User.deleteAllData((err, msg) => {
      if (err) throw err;
      Business.deleteAllData((err, msg) => {
        if (err) throw err;
        Payments.deleteAllData((err, msg) => {
          if (err) throw err;
          Collections.deleteAllData((err, msg) => {
            if (err) throw err;
            ApprovedPayments.deleteAllData((err, msg) => {
              if (err) throw err;
              res.json({ success: true, msg: "All Data Deleted." });
            });
          });
        });
      });
    });
  } else {
    res.json({ success: false, msg: "Unauthorized" });
  }
});

module.exports = router;
