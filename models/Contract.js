const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContractSchema = new Schema({
  contract_address: {
    type: String,
    required : [true, "contract address is required"]
  }
},
{
  timestamps: true,
}
);
const Contract = mongoose.model("Contract", ContractSchema);
module.exports = Contract;
