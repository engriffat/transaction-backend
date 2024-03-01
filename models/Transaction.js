const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const transactionSchema = new Schema({
    contract_address: {
        type: String,
        default : ""
    },
    to_address: {
        type: String,
        default : ""
    },
    from_address: {
        type: String,
        default : ""
    },
    transaction_hash: {
        type: String,
        required : [true, "transaction hash is required"]
    },
    gas: {
        type: Number,
        default : 0
    },
    value: {
        type: Number,
        default : 0
    },
    chain_id : {
        type: Number,
        default : 0
    }
},
{
  timestamps: true,
}
);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
