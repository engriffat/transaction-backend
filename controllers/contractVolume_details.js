const Web3 = require('web3');
require('../utility/dbConn');
const { ObjectId } = require('mongodb');
const Transaction = require('../models/Transaction');
const cron = require("node-cron");
let abi = require('../assets/Abi/abi.json')
const Moralis = require("moralis").default;
const axios = require('axios');
const new_token = require('../models/new_token')
const { EvmChain } = require("@moralisweb3/common-evm-utils");
// const Moralis = require("moralis").default;
const Volume = require('../models/Volume')
const price = require('../models/price')
const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
const Contract = require("../models/Contract");
const tokenVerification = require('../utility/tokenVerificationUtils')
// let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNhMzBhMzc0LTMzNWQtNDlhOS1hOGE2LWE1OTU5YTk1ZDk5YyIsIm9yZ0lkIjoiMzgzNDcyIiwidXNlcklkIjoiMzk0MDI1IiwidHlwZUlkIjoiMGQwNGM5M2UtOTQ3MC00NDllLWFiMzAtYjMzZGFhOGFkZjRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MjgwODcsImV4cCI6NDg2NjU4ODA4N30.CaI_31xDwSUM_I_gvj543VPqWy_jV_7b_BBg2dQZ0tc"
const web3 = new Web3('https://mainnet.infura.io/v3/85db29381d6d4e41af9122334af396b2');
// const web3 = new Web3('http://18.205.38.205:8545');
const { request, gql } = require('graphql-request');
const UNISWAP_GRAPHQL_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
// let MORALIS_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNhMzBhMzc0LTMzNWQtNDlhOS1hOGE2LWE1OTU5YTk1ZDk5YyIsIm9yZ0lkIjoiMzgzNDcyIiwidXNlcklkIjoiMzk0MDI1IiwidHlwZUlkIjoiMGQwNGM5M2UtOTQ3MC00NDllLWFiMzAtYjMzZGFhOGFkZjRhIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MjgwODcsImV4cCI6NDg2NjU4ODA4N30.CaI_31xDwSUM_I_gvj543VPqWy_jV_7b_BBg2dQZ0tc"
cron.schedule("0 0 */10 * * *", async function () {
    try{
      const contractsObject = await Contract.find();
      for (const contractObj of contractsObject) {
        const contractAddress = '0xbadff0ef41d2a68f22de21eabca8a59aaf495cf0'
        const contract = new web3.eth.Contract(abi, contractAddress);
        console.log(contractAddress);
        await contract.methods.totalSupply().call().then(async totalSupply => {
          console.log('Total Supply:', contractAddress,  totalSupply);
          await Volume.updateOne({contract_address : contractAddress}, {$set : {total_supply : totalSupply }}, {upsert : true})
        }).catch(error => {
          console.error('Error:', error);
        });
        const response = await Moralis.EvmApi.defi.getPairReserves({
          "chain": "0x1",
          "pairAddress": contractAddress
        });
        console.log(response.raw);
        if(response?.raw){
          let reserve1 =  response?.raw?.reserve0 ? response?.raw?.reserve0 : 0;
          let reserve2 =  response?.raw?.reserve1 ? response?.raw?.reserve1 : 0
          await Volume.updateOne({contract_address : contractAddress}, {$set : {reserve_1: reserve1, reserve_2: reserve2 }}, {upsert : true})
        }
       
        // const reserves = {
        //   "reserve0": "89734046628216808513376",
        //   "reserve1": "485187082584753550889"
        // };
        // const reserve0 = BigInt(reserves.reserve0);
        // const reserve1 = BigInt(reserves.reserve1);
        // const liquidity = Math.sqrt(reserve0 * reserve1);
        // console.log("Liquidity:", liquidity.toString());
      
        // await Volume.updateOne({contract_address : contractAddress}, {$set : {circulating_supply : circulatingSupply}}, {upsert : true});
      }
    }catch(error){
        console.log("error ===>>>>", error)
        return false
    }
});

cron.schedule("0 0 */10 * * *", async function () {
// cron.schedule("*/20 * * * * *", async function () {
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

cron.schedule("0 0 */15 * * *", async function () {
// cron.schedule("0 */30 * * * *", async function () {
  try{
    console.log("price crone is working =================>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    const contractsObject = await Contract.find();
    if(contractsObject.length > 0){
      for(const trx of response.raw.result) {
        const response = await Moralis.EvmApi.token.getTokenPrice({
          "chain": "0x1",
          "include": "percent_change",
          "address": trx.contract_address
        });
        if(response.raw){
          let priceUSD = response.raw.usdPrice
          console.log("usdt price", priceUSD);
          if(priceUSD > 0){
            await price.updateOne({symbol : response.raw.tokenSymbol, contract_address : contract_address}, {$set : {price : priceUSD}}, {upsert : true})
          }
        }
      }
    }
    const response = await Moralis.EvmApi.token.getTokenPrice({
      "chain": "0x1",
      "include": "percent_change",
      "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    });
    if(response.raw){
      let priceUSD = response.raw.usdPrice
      console.log("usdt price", priceUSD);
      if(priceUSD > 0){
        await price.updateOne({symbol : "ETH", contract_address : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}, {$set : {price : priceUSD}}, {upsert : true})
      }
    }
  }catch(error){
    console.error(error)
  }
});

cron.schedule("0 0 */20 * * *", async function () {
// cron.schedule("*/20 * * * * *", async function () {
  try{
    let currentDate = new Date()
    currentDate.setMinutes(currentDate.getMinutes() - 5);
    const contractsObject = await Contract.find();
    if(contractsObject.length > 0){
      for(let address = 0; address < contractsObject.length; address++){
        const response = await Moralis.EvmApi.token.getTokenTransfers({
          "chain": "0x1",
          //"limit": 5,
          "order": "DESC",
          "fromDate": currentDate,
          "toDate": new Date(),
          "address": contractsObject[address].contract_address
        });
        if(response?.raw?.result.length > 0){
          for(const trx of response.raw.result) {
            let priceEth = await price.findOne({symbol : "ETH"})
            let value =  (trx?.value) ?  parseInt(trx?.value) : 0
            let convertValueIntoEthAmount = (value > 0) ? value / 10**18 : 0;
            let convertValueDollar = (convertValueIntoEthAmount > 0) ? (convertValueIntoEthAmount * priceEth.price) : 0;
            // console.log("insertObject", trx)
            let insertObject = {
              name : trx.token_name,
              symbol : trx.token_symbol,
              logo : trx.token_logo,
              token_decimals : trx.token_decimals,
              from_address : trx.from_address,
              to_address : trx.to_address,
              block_timestamp : new Date(trx.block_timestamp),
              // transaction_hash : trx.transaction_hash,
              value : convertValueDollar,
              chain_id : 1,
              status : "pending",
              gas : 0,
              maxFeePerGas : 0
            }
            await Transaction.updateOne({transaction_hash : trx.transaction_hash}, {$set : insertObject}, {upsert : true});
          }//end loop
        }//end if
      }
    }
  }catch(error){
    console.error(error)
  }
});

//token honey pot service
cron.schedule("*/10 * * * * *", async function () {
    let currentTime = new Date();
    const tenMinutesAgo = new Date(currentTime.getTime() - (10 * 60 * 1000));
    let tokens = await new_token.find({ $or : [{lat_update_time : {$exists: false}}, {lat_update_time : {$lte : tenMinutesAgo}}]}).limit(5);
    console.log("tokens", tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let contract_address = tokens[token].contract_address
        console.log("contract_address", contract_address)
        let tokenId = tokens[token]._id.toString()
        let symbol = tokens[token].symbol
        try{
          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://quillcheck-api.quillaudits.com/api/v1/tokens/information/${contract_address}?1`,
            headers: { 
              'x-api-key': process.env.quillCheck
            }
          };
          let response = await axios.request(config)
          console.log("response", response.data)
          let insertObject = {
            liquidity: "",
            number_of_buyer: "", 
            number_of_seller: "", 
            buy_volume: "", 
            sell_volume : "", 
            market_cap : "", 
            status : "success",
            totalSupply : "",
            ownerAddress : "",
            ownerBalance : "",
            creatorAddress : "",
            creatorBalance  : "",
            currentPriceUsd : "",
            exchangabilityChecks : "",
            currentLiquidity : "",
            holdersChecks : "",
            liquidityChecks : "",
            totalLiquidityPercentageLocked : "",
            ownershipChecks : "",
            otherChecks : "",
            honeypotDetails: "",
            lat_update_time : new Date()
          }
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : insertObject});
          if(symbol){
            const url = 'https://api.dexscreener.com/latest/dex/search';
            const params = {
              q: symbol,
            };
            let response = await axios.get(url)
            console.log("response", response.data)
            // get data against pair addrss
            let updateObject = {
              txns : "",
              volume : "",
              liquidity : "",
              priceChange : ""
            }
            await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateObject});
          }
        }catch(error){
          console.error(error.response.data)
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {lat_update_time : new Date()}});
        }
      }//end loop
    }else {
      console.log("No pending tokens")
    }
});
