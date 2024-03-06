const Web3 = require('web3');
require('../utility/dbConn');
let abi = require('../assets/Abi/abi.json')
const Transaction = require('../models/Transaction');
const Contract = require("../models/Contract");
let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/b_J0rV5-81u-OwjBa-q4dVzAJWwtoS6b'
const web3 = new Web3(new Web3.providers.WebsocketProvider(RPCURL));
web3.eth.subscribe('pendingTransactions', (error, transaction) => {
    if (!error) {
        web3.eth.getTransaction(transaction).then(async transaction => {
            console.log('Transaction details:', transaction);
            if(transaction?.type != 2){
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
            }
        }).catch(error => {
            console.error('Error fetching transaction details:', error);
        });
    } else {
        console.error('Error:', error);
    }
})
.on('error', (error) => {
    console.error('WebSocket error:', error);
});