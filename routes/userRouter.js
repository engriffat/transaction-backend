const transactionController = require("../controllers/transactionController");
const customerController = require("../controllers/contractVolume_details")
// const newService = require("../controllers/newService")

module.exports = (app) => {
  app.post("/api/getTransaction", transactionController.get_transaction);
  app.post("/api/addContract", transactionController.add_contract);
  app.get("/api/getContract", transactionController.get_contract);
  app.post("/api/deleteContract", transactionController.delete_contract);
  app.post("/api/getNewToken", transactionController.getNew_token);
  app.post("/api/addTelegtamAlerts", transactionController.addTelegtam_alerts);
};
