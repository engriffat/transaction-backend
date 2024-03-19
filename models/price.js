const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const priceSchema = new Schema({
    symbol : {
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
const price = mongoose.model("price", priceSchema);
module.exports = price;
