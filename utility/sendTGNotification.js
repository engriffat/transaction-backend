let botToken = "7458897860:AAEK2DE5IQxvss2LxEK6GBrhg0nHMRkrQNU"//"7370590624:AAHO_mv2jTRPw7YlGXcIOs_X6CSb1vEzlrI"//
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(botToken, { polling: true });
const channelId = "@EthNode"//"-1002178471951"
const sendAlert = async(message) => {
    try{
        bot.sendMessage(channelId, message)
        .then(() => {
            console.log('Notification sent successfully');
            return true;
        })
        .catch((error) => {
            console.error('Error sending notification:', error);
            return false;
        });
    }catch(error){
        console.log("error ===>>>>", error)
        return false
    }
}

module.exports = {
    sendAlert
}