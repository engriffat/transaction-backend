// const TelegramBot = require('node-telegram-bot-api');
// const bot = new TelegramBot('6836420379:AAE3Zff1UJKqkg2GzZriqWWWnz2ti3iN9dw', { polling: false });
// const channelId = "1002061985444" //'YOUR_CHANNEL_ID';
// // console.log("asim", bot.sendMessage)
// bot.sendMessage(channelId, 'Hello, this is a notification from your bot when you received this inform to me im testing!')
//     .then(() => {
//         console.log('Notification sent successfully');
//     })
//     .catch((error) => {
//         console.error('Error sending notification:', error);
//     });

// bot.on('message', (msg) => {
//     console.log("msg", msg)
//     const chatId = msg.chat.id;
//     console.log("chatId", chatId)
//     bot.sendMessage(chatId, 'Hello, This is a notification from your bot when you received this inform to me im testing!');
// });

// bot.on('new_chat_members', (msg) => {
//     console.log("msg", msg)
//     const chatId = msg.chat.id;
//     console.log("chatId", chatId)
//     const newMembers = msg.new_chat_members;
//     bot.sendMessage(chatId, "New members joined the chat");
//     console.log(`New members joined the chat: ${newMembers.map(member => member.username).join(', ')}`);
// });


const { generateAccount } = require('tron-create-address')
const { address, privateKey } = generateAccount()
console.log(`Tron address is ${address}`)
console.log(`Tron private key is ${privateKey}`)



// require = require('esm')(module /*, options*/);
// const TronWeb = require('tronweb');

// // Create a new instance of TronWeb pointing to the mainnet or testnet
// const tronWeb = new TronWeb({
//     fullHost: 'https://api.trongrid.io', // or any other Tron node
// });

// // Generate a new account
// const newAccount = tronWeb.createAccount();
// console.log('Public Address:', newAccount.address.base58);
// console.log('Private Key:', newAccount.privateKey);

// const TronWeb = require('tronweb');
// var crypto = require('crypto');
// var privateKey = crypto.randomBytes(32).toString('hex');
// console.log("Private Key", privateKey);
// async function wallet(){
//     const HttpProvider = TronWeb.providers.HttpProvider;
//     const fullNode = new HttpProvider("https://api.trongrid.io");
//     const solidityNode = new HttpProvider("https://api.trongrid.io");
//     const eventServer = new HttpProvider("https://api.trongrid.io");
//     const tronWeb = new TronWeb(fullNode,solidityNode,eventServer,privateKey);
//     const wallet = await tronWeb.createAccount();
//     console.log(wallet);
// }

// wallet()