const pm2 = require('pm2');
const Web3 = require('web3');
const axios = require('axios');
const RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/b_J0rV5-81u-OwjBa-q4dVzAJWwtoS6b';
const web3 = new Web3(new Web3.providers.WebsocketProvider(RPCURL));
require('../utility/dbConn');
const Transaction = require('../models/Transaction');
const Contract = require("../models/Contract");
const processBlockTransactions = async (blockHeader) => {
    try {
        const block = await web3.eth.getBlock(blockHeader.number, true);
        const transactions = block.transactions;
        console.log("transactions", transactions)
        const contractsObject = await Contract.find();
        for (const contractObj of contractsObject) {
            const contractAddress = contractObj.contract_address;
            const contractTransactions = transactions.filter(tx => tx.to === contractAddress || tx.from === contractAddress);
            if (contractTransactions.length > 0) {
                for (const trx of contractTransactions) {
                    // console.log('contract transactions:', contractTransactions.length);
                    const gasPriceInEth = (trx.gasPrice / 1e18);
                    // const response = await axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=ETH", {
                    //     headers: {
                    //         'X-CMC_PRO_API_KEY': "d3464b4c-5e62-44bd-a512-7704be82fa46",
                    //         'Accept': 'application/json'
                    //     }
                    // });
                    // const usdtPrice = response.data.data.ETH.quote.USD.price;
                    // let convert  = ( (parseFloat(gasPriceInEth) * parseFloat(usdtPrice) )).toFixed(5)
                    // let convertTrxValueIntoEth = trx.value / 1e18;
                    // let convertValueIntoDollar  = ( (parseFloat(convertTrxValueIntoEth) * parseFloat(usdtPrice) )).toFixed(5)
                    // console.log("orignal gas in wei ===>>>>", trx.gasPrice, " Convert into ETH ===>>>>",gasPriceInEth, " Convert into dollar ===>>>", convert)
                    // console.log("orignal value in wei ===>>>>", trx.value, " Convert into ETH ===>>>>",convertTrxValueIntoEth, " Convert into dollar ===>>>", convertValueIntoDollar)
                    // const insertObject = {
                    //     chain_id: trx.chainId,
                    //     to_address: trx.to,
                    //     from_address: trx.from,
                    //     transaction_hash: trx.hash,
                    //     gas: convert,
                    //     value: convertValueIntoDollar
                    // };
                    // await Transaction.create(insertObject);
                }
            }
        }
    } catch (e) {
        console.error("Error processing block transactions:", e);
        restartPm2()  
    }
};
const subscribeToNewBlocks = () => {
    const provider = new Web3.providers.WebsocketProvider(RPCURL);
    const subscription = web3.eth.subscribe('newBlockHeaders', async (error, result) => {
        if (error) {
            console.error('Error subscribing to new block headers:', error);
            restartPm2()
        }
    }).on('data', async (blockHeader) => {
        await processBlockTransactions(blockHeader);
    }).on('error', (error) => {
        console.error('WebSocket error:', error);
        restartPm2()
    }).on('end', () => {
        console.log('WebSocket connection closed');
        restartPm2()
    });
};
subscribeToNewBlocks();
const restartPm2 = async() => {
    pm2.connect((err) => {
        if (err) {
            console.error('Error connecting to PM2:', err);
            process.exit(1);
        }
        pm2.restart('trx', (err, proc) => {
            if (err) {
                console.error('Error restarting process:', err);
                pm2.disconnect();
                process.exit(1);
            }
            console.log('Process restarted successfully:', proc);
            pm2.disconnect();
        });
    });
}

