const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot('7370590624:AAHO_mv2jTRPw7YlGXcIOs_X6CSb1vEzlrI', { polling: true });
const channelId = "-1002178471951"
bot.sendMessage(channelId, 'Hello, this is a notification from your bot when you received this inform to me im testing!')
  .then(() => {
    console.log('Notification sent successfully');
  })
  .catch((error) => {
    console.error('Error sending notification:', error);
});

bot.on('message', (msg) => {
    console.log("msg", msg)
    const chatId = msg.chat.id;
    console.log("chatId", chatId)
    bot.sendMessage(chatId, 'Hello, This is a notification from your bot when you received this inform to me im testing!');
});

bot.on('new_chat_members', (msg) => {
    console.log("msg", msg)
    const chatId = msg.chat.id;
    console.log("chatId", chatId)
    const newMembers = msg.new_chat_members;
    bot.sendMessage(chatId, "New members joined the chat");
    console.log(`New members joined the chat: ${newMembers.map(member => member.username).join(', ')}`);
});





// const botToken = '7370590624:AAHO_mv2jTRPw7YlGXcIOs_X6CSb1vEzlrI';
// const axios = require('axios');
// const getUpdates = async (offset) => {
//   const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}`;
//   try {
//     const response = await axios.get(url);
//     const data = response.data;
//     if (data.ok) {
//       return data.result;
//     } else {
//       throw new Error('Error getting updates');
//     }
//   } catch (error) {
//     console.error('Error:', error.message);
//     return [];
//   }
// };

// const processUpdates = async () => {
//   let offset = 0;

//   while (true) {
//     const updates = await getUpdates(offset);

//     for (const update of updates) {
//       console.log('Received update:', update);

//       if (update.message) {
//         const chatId = update.message.chat.id;
//         const text = update.message.text;

//         console.log(`Received message from chat ${chatId}: ${text}`);
//       }

//       offset = update.update_id + 1;
//     }

//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Polling interval
//   }
// };

// processUpdates();


