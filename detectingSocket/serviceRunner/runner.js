const marketPrices  =   require('../services/marketPrice');
const cron          =   require('node-cron');
const buy_order = require('../services/buy_service')
const sell_service = require('../services/sell_service')
const ready_for_sell = require('../services/ready_for_sell')
const ready_forBuy = require('../services/ready_for_buy')
const remove_token_from_price_futureBuy = require('../services/remove_token_from_price_futureBuy');
const balance_update = require('../services/balance_update')
const pmRestart = require('../services/pmRestart')
cron.schedule('0 */30 * * * *', () => {
    // pmRestart.restart();
});

cron.schedule('*/20 * * * * *', () => {
    // marketPrices.getTokenPrice();
});

cron.schedule('*/5 * * * * *', () => {
    // ready_forBuy.ready_forBuy();
});

cron.schedule('*/30 * * * * *', () => {
    // buy_order.buy_order();
});

cron.schedule('*/3 * * * * *', () => {
    // ready_for_sell.ready_forSell();
});

cron.schedule('*/30 * * * * *', () => {
    sell_service.sell_order();
});

cron.schedule('0 */5 * * * *', () => {
    // marketPrices.updateSymbol_logo();
});// not done

cron.schedule('0 */5 * * * *', () => {
    // remove_token_from_price_futureBuy.remove_tokenIfPriceNotComing();
});

cron.schedule('0 */2 * * * *', () => {
    // balance_update.balance();
});






// token0: 0x5FB001D2990aa1703e9323150AD69891F12b7f97
// token1: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
// pairAddress: 0xECF5e671bd8157DEc874abd2e60ad7B29094C8A7
