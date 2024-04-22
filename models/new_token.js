const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const new_tokens = new Schema({
    contract_address: {
        type: String,
        default : ""
    },
    liquidity: {
        type: [],
        default : []
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
    status : {
        type : "string",
        default : "pending"
    },
    price: {
        type: Number,
        default : 0
    },
    symbol : {
        type: String,
        default : ""
    },
    totalSupply : {
        type: Number,
        default : 0
    },
    ownerAddress : {
        type: String,
        default : ""
    },
    ownerBalance : {
        type: Number,
        default : 0
    },
    creatorAddress : {
        type: String,
        default : ""
    },
    creatorBalance  : {
        type: Number,
        default : 0
    },
    currentPriceUsd : {
        type: Number,
        default : 0
    },
    exchangabilityChecks : {
        type: [],
        default : []
    },
    currentLiquidity : {
        type: [],
        default : []
    },
    holdersChecks : {
        type: [],
        default : []
    },
    liquidityChecks : {
        type: [],
        default : []
    },
    totalLiquidityPercentageLocked : {
        type: [],
        default : []
    },
    ownershipChecks : {
        type: [],
        default : []
    },
    otherChecks : {
        type: [],
        default : []
    },
    honeypotDetails: { 
        type: [],
        default : []
    },  
    txns : {
        type: [],
        default : []
    },
    volume : {
        type: [],
        default : []
    },
    priceChange : {
        type: [],
        default : []
    },
    priceChange : {
        type: [],
        default : []
    },
    lat_update_time : {
        type : Date,
    }
},
{
  timestamps: true,
}
);
const new_token = mongoose.model("new_token", new_tokens);
module.exports = new_token;
