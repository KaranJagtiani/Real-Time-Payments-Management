var IO = require("socket.io");

const User = require("../../models/user");
const Business = require("../../models/businesses");
const Payments = require("../../models/payments");
const Collections = require("../../models/collections");

function Socket() {
  return {
    init: function (server) {
      var io = IO.listen(server);
      let admin,
        adminSocket,
        bookies = {};
      io.sockets.on("connection", function (client) {
        console.log("New user connected:", client.id);

        client.on("admin-joined", (message) => {
          message = JSON.parse(message);
          admin = message.user;
          adminSocket = client.id;
          console.log("Admin Joined:", adminSocket);
        });

        client.on("bookie-joined", (message) => {
          message = JSON.parse(message);
          bookies[message.user.username] = client.id;
          console.log("Bookie Joined.");
          console.log(bookies);
        });

        client.on("added-bookie-to-business", (message) => {
          message = JSON.parse(message);
          let bookieUsername = message.data.username;
          let business = message.business;
          User.getUserByUsername(bookieUsername, (err, bookie) => {
            if (err) {
              client.emit("error");
              throw err;
            }
            if (!bookie) {
              client.emit("bookieNotFound");
              return;
            }
            // client.emit('bookieAdded');
            // io.to(bookies[bookieUsername]).emit('addedAsBookie', business);
            Business.addBookie(business.name, bookie, (err, msg) => {
              if (err) {
                client.emit("error");
                throw err;
              }
              User.addBusiness(bookieUsername, business.name, (err, msg) => {
                if (err) {
                  client.emit("error");
                  throw err;
                }
                client.emit("bookieAdded");
                if (bookies[bookieUsername]) {
                  console.log("Bookie Online");
                  io.to(bookies[bookieUsername]).emit("addedAsBookie", message);
                } else console.log("Bookie Not Online.");
              });
            });
          });
        });

        client.on("remove-bookie-from-business", (message) => {
          message = JSON.parse(message);
          let bookieUsername = message.data.username;
          let business = message.business;
          User.getUserByUsername(bookieUsername, (err1, bookie) => {
            if (err1) {
              client.emit("error");
              throw err1;
            }
            if (!bookie) {
              client.emit("bookieNotFound");
              return;
            }
            User.removeBusiness(bookieUsername, business.name, (err, msg) => {
              if (err) {
                client.emit("error");
                throw err;
              }
              Business.removeBookie(business.name, bookie, (err, msg) => {
                if (err) {
                  client.emit("error");
                  throw err;
                }
                client.emit("bookieRemoved");
                if (bookies[bookieUsername]) {
                  console.log("Bookie Online");
                  io.to(bookies[bookieUsername]).emit(
                    "removedAsBookie",
                    message
                  );
                } else console.log("Bookie Not Online.");
              });
            });
          });
        });

        client.on("add-payment-business", (message) => {
          message = JSON.parse(message);
          let businessName = message.data.businessName;
          let payment = new Payments(message.data);
          Business.getBusinessByName(businessName, (err, business) => {
            if (err) {
              client.emit("error");
              throw err;
            }
            if (!business) {
              client.emit("businessNotFound");
              return;
            }
            Payments.addNewPayment(payment, (err, msg) => {
              if (err) {
                client.emit("error");
                throw err;
              }
              client.emit("paymentAddedAdmin");
              business.bookies.forEach((b) => {
                if (bookies[b.username]) {
                  io.to(bookies[b.username]).emit("newPaymentBookie", msg);
                }
              });
            });
          });
        });

        client.on("delete-payment-business", (message) => {
          message = JSON.parse(message);
          Business.getBusinessByName(message.businessName, (err, business) => {
            if (err) {
              client.emit("error");
              throw err;
            }
            if (!business) {
              client.emit("businessNotFound");
              return;
            }
            Payments.removePaymentById(message.payment._id, (err, msg) => {
              if (err) {
                client.emit("error");
                throw err;
              }
              client.emit("paymentRemovedAdmin");
              business.bookies.forEach((b) => {
                if (bookies[b.username]) {
                  io.to(bookies[b.username]).emit(
                    "deletePaymentBookie",
                    message
                  );
                }
              });
            });
          });
        });

        client.on("add-new-collection", (message) => {
          message = JSON.parse(message);
          Business.getBusinessByName(message.businessName, (err, business) => {
            if (err) {
              client.emit("error");
              throw err;
            }
            if (!business) {
              client.emit("businessNotFound");
              return;
            }
            Payments.updateAmount(
              message.prev_id,
              message.balance,
              (err, msg) => {
                if (err) {
                  client.emit("error");
                  throw err;
                }
                // client.emit('paymentCollectedBookie', message); // Bookie
                // io.to(adminSocket).emit('paymentCollectedAdmin', message); // Admin
                let newCollection = new Collections(message);
                Collections.addNewCollection(newCollection, (err, msg) => {
                  if (err) {
                    client.emit("error");
                    throw err;
                  }
                  client.emit("paymentCollectedBookie", message); // Bookie
                  if (adminSocket)
                    io.to(adminSocket).emit("paymentCollectedAdmin", message); // Admin
                });
              }
            );
          });
        });
      });
    },
  };
}

module.exports = new Socket();
