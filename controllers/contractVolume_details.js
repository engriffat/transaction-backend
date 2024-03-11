const Web3 = require('web3');
require('../utility/dbConn');
const { ObjectId } = require('mongodb');
const Transaction = require('../models/Transaction');
const cron = require("node-cron");
let abi = require('../assets/Abi/abi.json')
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const Moralis = require("moralis").default;
const Volume = require('../models/Volume')
const Contract = require("../models/Contract");
let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjdiOGJiMWZhLTZjZDQtNGJjNi04OGVjLWRmOWYyNDNlMjUxZiIsIm9yZ0lkIjoiMzY0NzcyIiwidXNlcklkIjoiMzc0ODkzIiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiJiZjcxZTIwZi0wMWUxLTQzYWItYTBlYi05ZDVlM2NkYzc3NDMiLCJpYXQiOjE3MDczMzkwNjksImV4cCI6NDg2MzA5OTA2OX0.hm3dP6ZVvUUUXz8AmOL9_NroAg-J1qL8IQrppWMU-m8"
const web3 = new Web3('https://mainnet.infura.io/v3/85db29381d6d4e41af9122334af396b2');
const { request, gql } = require('graphql-request');
const UNISWAP_GRAPHQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
cron.schedule("*/10 * * * * *", async function () {
    try{
      await Moralis.start({
        apiKey: MORALIS_API_KEY
        });
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

cron.schedule("*/10 * * * * *", async function () {
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
              if (receipt.status) {
                await Transaction.updateOne({_id : new ObjectId(order_id)}, {$set : {status : "completed"}})
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