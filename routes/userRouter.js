const transactionController = require("../controllers/transactionController") 
module.exports = (app) => {
  app.post("/api/getTransaction", transactionController.get_transaction)
  app.post("/api/addContract", transactionController.add_contract)
  app.get("/api/getContract", transactionController.get_contract)
  app.post("/api/deleteContract", transactionController.delete_contract)
};