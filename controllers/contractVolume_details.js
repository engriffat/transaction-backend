const Web3 = require('web3');
require('../utility/dbConn');
const { ObjectId } = require('mongodb');
const Transaction = require('../models/Transaction');
const cron = require("node-cron");
let abi = require('../assets/Abi/abi.json')
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
// const Moralis = require("moralis").default;
const Volume = require('../models/Volume')
const price = require('../models/price')
const Contract = require("../models/Contract");
// let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNhMzBhMzc0LTMzNWQtNDlhOS1hOGE2LWE1OTU5YTk1ZDk5YyIsIm9yZ0lkIjoiMzgzNDcyIiwidXNlcklkIjoiMzk0MDI1IiwidHlwZUlkIjoiMGQwNGM5M2UtOTQ3MC00NDllLWFiMzAtYjMzZGFhOGFkZjRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MjgwODcsImV4cCI6NDg2NjU4ODA4N30.CaI_31xDwSUM_I_gvj543VPqWy_jV_7b_BBg2dQZ0tc"
const web3 = new Web3('https://mainnet.infura.io/v3/85db29381d6d4e41af9122334af396b2');
const { request, gql } = require('graphql-request');
const UNISWAP_GRAPHQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
// let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNhMzBhMzc0LTMzNWQtNDlhOS1hOGE2LWE1OTU5YTk1ZDk5YyIsIm9yZ0lkIjoiMzgzNDcyIiwidXNlcklkIjoiMzk0MDI1IiwidHlwZUlkIjoiMGQwNGM5M2UtOTQ3MC00NDllLWFiMzAtYjMzZGFhOGFkZjRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MjgwODcsImV4cCI6NDg2NjU4ODA4N30.CaI_31xDwSUM_I_gvj543VPqWy_jV_7b_BBg2dQZ0tc"
cron.schedule("0 0 */10 * * *", async function () {
    try{
      // await Moralis.start({
      //   apiKey: MORALIS_API_KEY
      // });
      const contractsObject = await Contract.find();
      for (const contractObj of contractsObject) {
        const contractAddress = '0xbadff0ef41d2a68f22de21eabca8a59aaf495cf0'
        const contract = new web3.eth.Contract(abi, contractAddress);
        // console.log(contractAddress);
        // await contract.methods.totalSupply().call().then(async totalSupply => {
        //   console.log('Total Supply:', contractAddress,  totalSupply);
        //   await Volume.updateOne({contract_address : contractAddress}, {$set : {total_supply : totalSupply }}, {upsert : true})
        // }).catch(error => {
        //   console.error('Error:', error);
        // });
        // const response = await Moralis.EvmApi.defi.getPairReserves({
        //   "chain": "0x1",
        //   "pairAddress": contractAddress
        // });
        // console.log(response.raw);
        // if(response?.raw){
        //   let reserve1 =  response?.raw?.reserve0 ? response?.raw?.reserve0 : 0;
        //   let reserve2 =  response?.raw?.reserve1 ? response?.raw?.reserve1 : 0
        //   await Volume.updateOne({contract_address : contractAddress}, {$set : {reserve_1: reserve1, reserve_2: reserve2 }}, {upsert : true})
        // }

        // circulating supply 
        const liquidityPoolQuery = gql`
        query LiquidityPool($tokenAddress: String!) {
          token(id: $tokenAddress) {
            id
            totalLiquidity
          }
        }
        `;
        const data = await request(UNISWAP_GRAPHQL_ENDPOINT, liquidityPoolQuery, {
          tokenAddress: contractAddress.toLowerCase(),
        });
        const circulatingSupply = data?.token?.totalLiquidity ? data.token.totalLiquidity : 0;
        console.log('Circulating Supply:', circulatingSupply);
        await Volume.updateOne({contract_address : contractAddress}, {$set : {circulating_supply : circulatingSupply}}, {upsert : true});
      }
    }catch(error){
        console.log("error ===>>>>", error)
        return false
    }
});

cron.schedule("*/20 * * * * *", async function () {
    try{
      console.log("Transaction confirmation cron is running......");
      let orders = await Transaction.find({status : "pending"})
      if(orders.length > 0){
        for(let orderLoop = 0; orderLoop < orders.length; orderLoop++){
          let order_id = orders[orderLoop]._id;
          let trxhash = orders[orderLoop].transaction_hash;
          web3.eth.getTransactionReceipt(trxhash)
          .then(async receipt => {
            if (receipt) {
              console.log("receipt", receipt)
              if (receipt.status) {
                let priceEth = await price.findOne({symbol : "ETH"})
                let gasUsed = (receipt?.gasUsed) ? (receipt.gasUsed) : 0;
                let effGasPrice = (receipt?.effectiveGasPrice) ? (receipt.effectiveGasPrice) : 0;
                const gasCostWei = gasUsed * effGasPrice;
                const gasCostEth = (gasCostWei > 0) ? gasCostWei/ 10**18 : 0;
                let convertGasIntoDollar = (gasCostEth > 0) ? (gasCostEth * priceEth.price) : 0
                console.log("convertGasIntoDollar", convertGasIntoDollar)
                await Transaction.updateOne({_id : new ObjectId(order_id)}, {$set : {status : "confirmed", gas : convertGasIntoDollar}})
              } else {
                await Transaction.deleteOne({_id : new ObjectId(order_id)})
              }
            }else{
                console.log("Still pending=====>>>>>>>")
            } 
          })
          .catch(error => {
            console.error('Error fetching transaction receipt:', error);
          });
        }
      }else{
        console.log("No pending orders")
      }
    }catch(error){
      console.error(error)
      return res.status(404).send({
        status: 404,
        success: false,
        Error: "Insufficient gas",
      });
    }
});

cron.schedule("0 */30 * * * *", async function () {
  try{
    console.log("price crone is working =================>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const response = await Moralis.EvmApi.token.getTokenPrice({
      "chain": "0x1",
      "include": "percent_change",
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    });
    if(response.raw){
      let priceUSD = response.raw.usdPrice
      console.log("usdt price", priceUSD);
      if(priceUSD > 0){
        await price.updateOne({symbol : "ETH"}, {$set : {price : priceUSD}}, {upsert : true})
      }
    }
  }catch(error){
    console.error(error)
  }
});

