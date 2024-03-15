const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const VolumeSchema = new Schema({
    contract_address: {
        type: String,
        default : ""
    },
    reserve_1: {
        type: Number,
        default : 0
    },
    reserve_2: {
        type: Number,
        default : 0
    },
    total_supply : {
        type: Number,
        default : 0
    },
    circulating_supply : {
        type: Number,
        default : 0
    }
},
{
  timestamps: true,
}
);
const Volume = mongoose.model("Volume", VolumeSchema);
module.exports = Volume;
