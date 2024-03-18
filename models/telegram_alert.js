const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const telegramAlertsSchema = new Schema({
    field_name: {
        type: String,
        default : ""
    },
    from_value: {
        type: Number,
        default : 0
    },
    to_value: {
        type: Number,
        default : 0
    },
    contract_address : {
        type: String,
        default : ""
    },
    status : {
        type: String,
        default : "active"
    }
},
{
  timestamps: true,
}
);
const telegram_alert = mongoose.model("telegram_alert", telegramAlertsSchema);
module.exports = telegram_alert;
