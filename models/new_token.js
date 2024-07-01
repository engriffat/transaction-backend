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
    unlockDate : {
        type : Date,
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
    burn_liquidity : {
        type: Number,
        default : 0
    }, 
    buy_tax_min : {
        type: Number,
        default : 0
    },
    buy_tax_max : {
        type: Number,
        default : 0
    },
    sell_tax_min : {
        type: Number,
        default : 0
    },
    sell_tax_max : {
        type: Number,
        default : 0
    },
    locked_percentage  : {
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
        type: Number,
        default : 0
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
    },
    volume6h : {
        type : Number,
        default : 0
    },
    buys6h: {
        type : Number,
        default : 0
    },
    sells6h: {
        type : Number,
        default : 0
    },
    sellVolume6h: {
        type : Number,
        default : 0
    },
    buyVolume6h: {
        type : Number,
        default : 0
    },
    volume24h: {
        type : Number,
        default : 0
    },
    buys24h: {
        type : Number,
        default : 0
    },
    sells24h: {
        type : Number,
        default : 0
    },
    sellVolume24h: {
        type : Number,
        default : 0
    },
    buyVolume24h: {
        type : Number,
        default : 0
    }
},
{
  timestamps: true,
}
);
const new_token = mongoose.model("new_token", new_tokens);
module.exports = new_token;
