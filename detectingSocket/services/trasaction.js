const Web3 = require('web3');
let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/b_J0rV5-81u-OwjBa-q4dVzAJWwtoS6b'
const web3 = new Web3(new Web3.providers.WebsocketProvider(RPCURL));
require('../../utility/dbConn')
let Transaction = require('../../models/Transaction')
let Contract = require("../../models/Contract")
// const axios = require('axios');
// const contractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
web3.eth.subscribe('newBlockHeaders', (error, result) => {
  if (error) {
    console.error('Error:', error);
  }
})
.on('data', async (blockHeader) => {
  const block = await web3.eth.getBlock(blockHeader.number, true);
  const transactions = block.transactions;
  let contractsObject = Contract.find({})
  for(let i = 0; i < contractsObject.length; i++) {
    let contractAddress = contractsObject[i].contract_address
    const contractTransactions = transactions.filter(tx => tx.to === contractAddress || tx.from === contractAddress);
    if(contractTransactions.length > 0){
      for(let trx = 0; trx < contractTransactions.length; trx++){
      console.log('contract transactions:', contractTransactions)
        let gasPriceInEth = (contractTransactions[trx]?.gasPrice/ 1e18).toString()
        let insertObject = {
          chain_id : contractTransactions[trx]?.chainId,
          to_address:   contractTransactions[trx]?.to,
          from_address:  contractTransactions[trx]?.from,
          transaction_hash:  contractTransactions[trx]?.hash,
          gas:  gasPriceInEth,
          value:  contractTransactions[trx]?.value
        }
        await Transaction.create(insertObject)
      }//end loog
    }
  }
});



