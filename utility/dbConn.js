const mongoose = require("mongoose");
async function connection() {
    try {
        let URL = "mongodb+srv://coinssniper2020:VLjXUKmMyoW0bGcf@trasaction.x7bxslo.mongodb.net/transaction?retryWrites=true&w=majority"
        await mongoose.connect(URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
        });
        console.log("Connection has been created successfully");
    } catch (e) {
        console.log("Error: => ", e.message);
    }
}
connection();
