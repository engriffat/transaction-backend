const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const new_tokens = new Schema({
    contract_address: {
        type: String,
        default : ""
    },
    liquidity: {
        type: Number,
        default : 0
    },
    number_of_buyer: {
        type: Number,
        default : 0
    },
    number_of_seller: {
        type: Number,
        default : 0
    },
    buy_volume: {
        type: Number,
        default : 0
    },
    sell_volume : {
        type: Number,
        default : 0
    },
    market_cap : {
        type: Number,
        default : 0
    },
    pair_address : {
        type: String,
        default : ""
    },
    price: {
        type: Number,
        default : 0
    },
},
{
  timestamps: true,
}
);
const new_token = mongoose.model("new_token", new_tokens);
module.exports = new_token;
