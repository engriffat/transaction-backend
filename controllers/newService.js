const Web3 = require('web3');
require('../utility/dbConn');
const pm2 = require('pm2');
const Transaction = require('../models/Transaction');
const Contract = require("../models/Contract");
let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/UHm-FJzBVdJDsvGXJ3HyI39UfLg7J9VA'
// let RPCURL = "wss://mainnet.infura.io/ws/v3/2b1eac7434014a04b279e24da8abc275"
const web3 = new Web3(new Web3.providers.WebsocketProvider(RPCURL));
web3.eth.subscribe('pendingTransactions', (error, transaction) => {
    console.log("transaction", transaction);
    if (!error) {
        web3.eth.getTransaction(transaction).then(async transaction => {
            if(transaction?.type != 2){
                const contractsObject = await Contract.find();
                for (const contractObj of contractsObject) {
                    const contractAddress = contractObj.contract_address;
                    // console.log("transaction",transaction)
                    if (transaction?.to === contractAddress || transaction?.from === contractAddress) {
                        // console.log("transaction", transaction);
                        const insertObject = {
                            chain_id: transaction?.chainId,
                            to_address: transaction?.to,
                            from_address: transaction?.from,
                            transaction_hash: transaction?.hash,
                            gas: transaction?.gasPrice,
                            value: transaction?.value,
                            type : transaction?.type == 0 ? "transfer" : "contract_execution" , 
                            nonce : transaction?.nonce,
                            status : transaction?.blockNumber > 0 ? "confirmed" : "pending",
                            maxFeePerGas : transaction?.maxFeePerGas
                        };
                        await Transaction.create(insertObject);
                        console.log("data done ===>>>>")
                    }
                }
            }
        }).catch(error => {
            console.error('Error fetching transaction details:', error);
            restartPm2()
        });
    } else {
        console.error('Error:', error);
        restartPm2()
    }
})
.on('error', (error) => {
    console.error('WebSocket error:', error);
    restartPm2()
});

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