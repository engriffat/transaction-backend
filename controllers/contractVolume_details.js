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
const Volume = require('../models/Volume')
const TGNotification = require('../utility/sendTGNotification')
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
cron.schedule("0 */20 * * * *", async function () {
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

cron.schedule("0 */20 * * * *", async function () {
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

// cron.schedule("0 */16 * * * *", async function () {
// // cron.schedule("0 */30 * * * *", async function () {
//   try{
//     console.log("price crone is working =================>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
//     const contractsObject = await Contract.find();
//     if(contractsObject.length > 0){
//       for(const trx of response.raw.result) {
//         const response = await Moralis.EvmApi.token.getTokenPrice({
//           "chain": "0x1",
//           "include": "percent_change",
//           "address": trx.contract_address
//         });
//         if(response.raw){
//           let priceUSD = response.raw.usdPrice
//           console.log("usdt price", priceUSD);
//           if(priceUSD > 0){
//             await price.updateOne({symbol : response.raw.tokenSymbol, contract_address : contract_address}, {$set : {price : priceUSD}}, {upsert : true})
//           }
//         }
//       }
//     }
//     const response = await Moralis.EvmApi.token.getTokenPrice({
//       "chain": "0x1",
//       "include": "percent_change",
//       "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
//     });
//     if(response.raw){
//       let priceUSD = response.raw.usdPrice
//       console.log("usdt price", priceUSD);
//       if(priceUSD > 0){
//         await price.updateOne({symbol : "ETH", contract_address : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}, {$set : {price : priceUSD}}, {upsert : true})
//       }
//     }
//   }catch(error){
//     console.error(error)
//   }
// });

cron.schedule("0 */3 * * * *", async function () {
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

// let dexToolApi = "1qZgD7eLUV9uvziW8biVG65a2Up0s5fS7Pjht9qA" // for pro plan
let dexToolApi = "YHgL80oavT7BqEvhCIIK437MDvriTM093EvVAuy1"// for advance

//token honey pot service working on this only
cron.schedule("*/30 * * * * *", async function () {
  console.log("Quill check api working now ===>>>>>")
    let currentTime = new Date();
    const tenMinutesAgo = new Date(currentTime.getTime() - (30 * 60 * 1000));
    // let tokens = await new_token.find({ $or : [{lat_update_time : {$exists: false}}, {lat_update_time : {$lte : tenMinutesAgo}}]}).limit(5);
    // let tokens = await new_token.find({contract_address : {$in : [ "0x443459D45c30A03f90037d011CbE22e2183d3b12","0x405154cFAF5Ea4EF57B65b86959c73Dd079FA312","0xBE4D9c8C638B5f0864017d7F6A04b66c42953847","0x3973C606B493EeE0E14B2b5654d5c4049cE9C2d9","0x470c8950C0c3aA4B09654bC73b004615119A44b5","0x6558f69322DB3265fBD64B847D450F5Bfa8c87A5"]}});
    let tokens = await new_token.find({}).sort({createdAt : -1})
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        // console.log("loop ===>>>>", token)
        let contract_address = tokens[token].contract_address
        let poolAddress = tokens[token].pair_address
        console.log("contract address", contract_address)
        let tokenId = tokens[token]._id.toString()
        try{
          let configDexTool = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://public-api.dextools.io/advanced/v2/token/ether/${contract_address}/price`,
            // url: `https://public-api.dextools.io/pro/v2/token/ether/${contract_address}/price`,
            headers: { 
              'accept': 'application/json',
              'x-api-key': dexToolApi
            }
          };
          let responsePrice = await axios.request(configDexTool)
          console.log("Price ===>>>>>>", responsePrice?.data?.data?.price)
          let price = (responsePrice?.data?.data?.price) ? responsePrice.data.data.price : 0
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {price : price}})
          // console.log("responsePrice price", price)
          // let config = {
          //   method: 'get',
          //   maxBodyLength: Infinity,
          //   url: `https://quillcheck-api.quillaudits.com/api/v1/tokens/information/${contract_address}?1`,
          //   headers: { 
          //     'x-api-key': process.env.quillCheck
          //   }
          // };
          // let response = await axios.request(config)
          // let symbol = (response?.data?.tokenInformation?.tokenSymbol) ? response.data.tokenInformation.tokenSymbol : ""
          // let insertObject = {
          //   burn_liquidity : response?.data?.marketChecks?.liquidityChecks?.aggregatedInformation?.percentDistributed?.burnt?.percent,
          //   holdersChecks : (response?.data?.marketChecks?.holdersChecks) ? response.data.marketChecks.holdersChecks : 0,
          //   ownerAddress : (response?.data?.tokenInformation?.ownerAddress)? response.data.tokenInformation.ownerAddress : 0,
          //   ownerBalance : (response?.data?.tokenInformation?.ownerBalance) ? response.data.tokenInformation.ownerBalance : 0,
          //   creatorAddress : (response?.data?.tokenInformation?.creatorAddress) ? response.data.tokenInformation.creatorAddress : 0,
          //   creatorBalance  : (response?.data?.tokenInformation?.creatorBalance) ? response.data.tokenInformation.creatorBalance : 0,
          //   currentPriceUsd : (response?.data?.tokenInformation?.marketData?.currentPriceUsd) ? response.data.tokenInformation.marketData.currentPriceUsd : 0,
          //   liquidityChecks : (response?.data?.codeChecks?.liquidityChecks) ? response.data.codeChecks.liquidityChecks : 0,
          //   ownershipChecks : (response?.data?.codeChecks?.ownershipChecks) ? response.data.codeChecks.ownershipChecks : 0,
          //   otherChecks : (response?.data?.otherChecks) ? response.data.otherChecks : 0,
          //   honeypotDetails : (response?.data?.honeypotDetails) ? response.data.honeypotDetails : 0,
          //   lat_update_time : new Date()
          // }
          // await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : insertObject});
          console.log("================================================")
          let configLiq = {
            method: 'get',
            maxBodyLength: Infinity,
            url : `https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/liquidity`,
            // url : `https://public-api.dextools.io/pro/v2/pool/ether/${poolAddress}/liquidity`,
            headers: { 
              'accept': 'application/json',
              'x-api-key': dexToolApi
            }
          };
          let responseLiq = await axios.request(configLiq)
          // console.log("responseLiq", responseLiq.data)
          let updateLiquadidty = {
            currentLiquidity : (responseLiq?.data?.data?.liquidity) ?  responseLiq.data.data.liquidity : 0
          }
          // console.log("responseLiq?.data?.data?.liquidity", responseLiq?.data?.data?.liquidity)
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateLiquadidty});
          let lockConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url :`https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/locks`,
            // url :`https://public-api.dextools.io/pro/v2/pool/ether/${poolAddress}/locks`,
            headers: { 
              'accept': 'application/json',
              'x-api-key': dexToolApi
            }
          }      
          let lockLiquadidty = await axios.request(lockConfig)
          console.log("lock liqudidty data  ===>>>>", lockLiquadidty?.data?.data)
          let updateLockLiquadidty = {
            locked_percentage : lockLiquadidty?.data?.data?.amountLocked ? (lockLiquadidty.data.data.amountLocked) : 0,
            unlockDate : lockLiquadidty?.data?.data?.nextUnlock?.unlockDate ? lockLiquadidty.data.data.nextUnlock.unlockDate : ''
          }
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateLockLiquadidty});
          console.log("============ after =============================")
          // if(symbol){
          //   const url = `https://api.dexscreener.com/latest/dex/search?q=${symbol}`;
          //   let response = await axios.get(url)   
          //   console.log("response", response.data)
          //   let data = response.data.pairs
          //   const ethereumPair = data.find(pair => pair.chainId === 'ethereum');
          //   let updateObject = {
          //     txns : ethereumPair.txns,
          //     volume : ethereumPair.volume,
          //     liquidity : ethereumPair.liquidity,
          //     priceChange : ethereumPair.priceChange
          //   }
          //   await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateObject});
          // }
          console.log("============================================================")
          let volumeConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url :`https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/price`,
            // url :`https://public-api.dextools.io/pro/v2/pool/ether/${poolAddress}/price`,
            headers: { 
              'accept': 'application/json',
              'x-api-key': dexToolApi
            }
          }      
          let volumeDetails = await axios.request(volumeConfig)
          console.log("volumeDetails data  ===>>>>", volumeDetails.data.data)
        }catch(error){
          console.error("error asim", error.response.data.message)
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {lat_update_time : new Date()}});
        }
      }//end loop
    }else {
      console.log("No pending tokens")
    }
});

cron.schedule("0 */20 * * * *", async function(){
  try{
    console.log("New service is running")
    let currentTime = new Date();
    const tenMinutesAgo = new Date(currentTime.getTime() - (30 * 60 * 1000));
    // let tokens = await new_token.find({ $or : [{lat_update_time : {$exists: false}}, {lat_update_time : {$lte : tenMinutesAgo}}]}).limit(5);
    let tokens = await new_token.find({ contract_address: "0x3132F6d0e7361fb335391C920DF8049830A1534C"});
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let contract_address = tokens[token].contract_address
        console.log("contract_address", contract_address)
        let tokenId = tokens[token]._id.toString()
        let pair_address = tokens[token].pair_address
        let configDexTool = {
          method: 'get',
          url: `https://public-api.dextools.io/advanced/v2/pool/ether/${pair_address}/liquidity`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let responseLiquadity = await axios.request(configDexTool)
        console.log("liquaditiy", responseLiquadity.data.data.liquidity)
        if(responseLiquadity?.data?.data?.liquidity){
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {totalLiquidityPercentageLocked : responseLiquadity.data.data.liquidity}});
        }
        let configDextoken = {
          method: 'get',
          url: `https://public-api.dextools.io/advanced/v2/token/ether/${contract_address}/info`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let responseToken = await axios.request(configDextoken)
        console.log("total supply", responseToken.data.data.totalSupply)
        if(responseToken?.data?.data?.totalSupply){
          await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {totalSupply : responseToken.data.data.totalSupply}});
        }
        let configPrice = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://public-api.dextools.io/advanced/v2/token/ether/${contract_address}/price`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let responsePrice = await axios.request(configPrice)
        let price = (responsePrice?.data?.data?.price) ? responsePrice.data.data.price : 0
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {price : price}})
        let configLiquidity = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://public-api.dextools.io/advanced/v2/pool/ether/${pair_address}/locks`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let data = await axios.request(configLiquidity)
        let update = {
          locked_percentage: (data?.data?.data?.amountLocked) ? data.data.data.amountLocked : 0,
          unlockDate : (data?.data?.data?.nextUnlock?.unlockDate) ? data.data.data.nextUnlock.unlockDate : ""
        }
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : update});
      }
    }
  }catch(error){
    console.error("liquadidty error ===>>>>>", error)
  }
})

////////////////////////////////////////////// SPLIT SERVICES /////////////////////////////////////////////////////////


cron.schedule("0 */10 * * * *", async function () {
  try{
    console.log("Price socket is running ====>>>>>>>")
    console.log("process.env ====>>>>>>>", process.env.dexToolApi)
    let tokens = await new_token.find({});
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let contract_address = tokens[token].contract_address
        let poolAddress = tokens[token].pair_address
        console.log("pool address", poolAddress)
        let tokenId = tokens[token]._id.toString()
        let configDexTool = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `https://public-api.dextools.io/advanced/v2/token/ether/${contract_address}/price`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let responsePrice = await axios.request(configDexTool)
        console.log("responsePrice", responsePrice.data.data)
        let price = (responsePrice?.data?.data?.price) ? responsePrice.data.data.price : 0
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : {price : price}})
      }
    }
  }catch(error){
    console.error("error comming ===>>>>>", error)
  }
})

cron.schedule("0 */20 * * * *", async function () {
  try{
    console.log("liquidity socket is running ====>>>>>>>")
    let tokens = await new_token.find({});
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let poolAddress = tokens[token].pair_address
        let tokenId = tokens[token]._id.toString()
        let configLiq = {
          method: 'get',
          maxBodyLength: Infinity,
          url : `https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/liquidity`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        };
        let responseLiq = await axios.request(configLiq)
        console.log("response ====>>>>>>>", responseLiq.data.data)
        let updateLiquadidty = {
          currentLiquidity : (responseLiq?.data?.data?.liquidity) ?  responseLiq.data.data.liquidity : 0
        }
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateLiquadidty});
      }
    }
  }catch(error){
    console.error("error comming ===>>>>>", error)
  }
})

cron.schedule("0 */30 * * * *", async function () {
  try{
    console.log("lock socket is running ====>>>>>>>")
    let tokens = await new_token.find({});
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let poolAddress = tokens[token].pair_address
        let tokenId = tokens[token]._id.toString()
        let lockConfig = {
          method: 'get',
          maxBodyLength: Infinity,
          url :`https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/locks`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        }      
        let lockLiquadidty = await axios.request(lockConfig)
        console.log("lock liqudidty data  ===>>>>", lockLiquadidty.data.data)
        let updateLockLiquadidty = {
          locked_percentage : lockLiquadidty?.data?.data?.amountLocked ? (lockLiquadidty.data.data.amountLocked) : 0,
          unlockDate : lockLiquadidty?.data?.data?.nextUnlock?.unlockDate ? lockLiquadidty.data.data.nextUnlock.unlockDate : ''
        }
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : updateLockLiquadidty});
      }
    }
  }catch(error){
    console.error("error comming ===>>>>>", error)
  }
})

cron.schedule("0 */30 * * * *", async function () {
  try{
    console.log("lock socket is running ====>>>>>>>")
    let tokens = await new_token.find({});
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let poolAddress = tokens[token].pair_address
        let tokenId = tokens[token]._id.toString()
        let volumeConfig = {
          method: 'get',
          maxBodyLength: Infinity,
          url :`https://public-api.dextools.io/advanced/v2/pool/ether/${poolAddress}/price`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        }      
        let volumeDetails = await axios.request(volumeConfig)
        let data = volumeDetails.data.data;
        let insertObject = {
          volume6h : (data?.volume6h) ? data.volume6h : 0,
          buys6h: (data?.buys6h) ? data.buys6h : 0,
          sells6h: (data?.sells6h) ? data.sells6h : 0,
          sellVolume5m : (data?.sellVolume5m) ? data.sellVolume5m : 0,
          buyVolume5m : (data?.buyVolume5m) ? data.buyVolume5m : 0,
          sellVolume6h: (data?.sellVolume6h) ? data.sellVolume6h : 0,
          buyVolume6h: (data?.buyVolume6h) ? data.buyVolume6h : 0,
          volume24h: (data?.volume24h) ? data.volume24h : 0,
          buys24h: (data?.buys24h) ? data.buys24h : 0,
          sells24h: (data?.sells24h) ? data.sells24h : 0,
          sellVolume24h: (data?.sellVolume24h) ? data.sellVolume24h : 0,
          buyVolume24h: (data?.buyVolume24h) ? data.buyVolume24h : 0
        }
        console.log("volumeDetails data  ===>>>>", insertObject)
        console.log("sellVolumeDetails data ===>>>>",poolAddress)
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : insertObject});
      }
    }
  }catch(error){
    console.error("error comming ===>>>>>", error)
  }
})

cron.schedule("0 */30 * * * *", async function () {
  try{
    console.log("lock socket is running ====>>>>>>>")
    let tokens = await new_token.find({});
    console.log("token lenght: " + tokens.length)
    if(tokens.length > 0){
      for(let token= 0; token < tokens.length; token++){
        let contract_address = tokens[token].contract_address
        let tokenId = tokens[token]._id.toString()
        let volumeConfig = {
          method: 'get',
          maxBodyLength: Infinity,
          url :`https://public-api.dextools.io/advanced/v2/token/ether/${contract_address}/audit`,
          headers: { 
            'accept': 'application/json',
            'x-api-key': process.env.dexToolApi
          }
        }      
        let tax = await axios.request(volumeConfig)
        let insertTax = {
          buy_tax_min : (tax?.data?.data?.buyTax?.min) ? tax?.data?.data?.buyTax?.min.toFixed(4) : 0,
          buy_tax_max : (tax?.data?.data?.buyTax?.max) ?  tax?.data?.data?.buyTax?.max.toFixed(4) : 0,
          sell_tax_min:  (tax?.data?.data?.sellTax?.min) ? tax?.data?.data?.sellTax?.min.toFixed(4)  :  0,
          sell_tax_max  : (tax?.data?.data?.sellTax?.max) ? tax?.data?.data?.sellTax?.max.toFixed(4) :  0
        }
        console.log("insertTax data  ===>>>>", insertTax)
        await new_token.updateOne({_id : new ObjectId(tokenId)}, {$set : insertTax});
      }
    }
  }catch(error){
    console.error("error comming ===>>>>>", error.message)
  }
})

// send telegram alterts 
cron.schedule("0 0 */10 * * *", async function() {
  try{
    console.log("Telegram service is running")
    let currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 10);
    let getRecordAlert = await new_token.find({$or : [{tg_alert : {$exists : false}},  {tg_alert : false}], createdAt : {$lte : currentTime}}).limit(1)
    console.log("getRecordAlert lenght: " + getRecordAlert.length)
    for(let i = 0; i < getRecordAlert.length; i++){
      let id = getRecordAlert[i]._id.toString()
      let contract_address = (getRecordAlert[i]?.contract_address) ? getRecordAlert[i].contract_address : ""
      let pair_address = (getRecordAlert[i]?.pair_address) ? getRecordAlert[i].pair_address : ""
      let owner_address = (getRecordAlert[i]?.ownerAddress)? getRecordAlert[i].ownerAddress : ""
      let symbol = (getRecordAlert[i]?.symbol) ? getRecordAlert[i].symbol : ""
      let liqudity = (getRecordAlert[i]?.currentLiquidity)? getRecordAlert[i].currentLiquidity : 0
      let burn_liquidity = (getRecordAlert[i]?.burn_liquidity) ? getRecordAlert[i].burn_liquidity : 0      
      let buyVolume24h = (getRecordAlert[i]?.buyVolume24h) ?getRecordAlert[i].buyVolume24h : 0
      let sellVolume24h = (getRecordAlert[i]?.sellVolume24h) ? getRecordAlert[i].sellVolume24h : 0
      let locked_percentage = (getRecordAlert[i]?.locked_percentage) ? getRecordAlert[i].locked_percentage : 0
      let unlockDate = (getRecordAlert[i]?.unlockDate) ? getRecordAlert[i].unlockDate : ""
      let sell_tax_min = (getRecordAlert[i]?.sell_tax_min) ? getRecordAlert[i].sell_tax_min : 0
      let sell_tax_max = (getRecordAlert[i]?.sell_tax_max) ? getRecordAlert[i].sell_tax_max : 0
      let buy_tax_max = (getRecordAlert[i]?.buy_tax_max) ? getRecordAlert[i].buy_tax_max : 0
      let buy_tax_min = (getRecordAlert[i]?.buy_tax_min) ? getRecordAlert[i].buy_tax_min : 0
      let buyVolume5m = (getRecordAlert[i]?.buyVolume5m) ? getRecordAlert[i].buyVolume5m : 0
      let sellVolume5m = (getRecordAlert[i]?.sellVolume5m) ? getRecordAlert[i].sellVolume5m : 0
      let currentPriceUsd = (getRecordAlert[i]?.currentPriceUsd) ? getRecordAlert[i].currentPriceUsd : 0
      // let market_cap = (getRecordAlert[i]?.) ? getRecordAlert[i]. :""
      // let current_supply = (getRecordAlert[i]?.) ? getRecordAlert[i]. : ""
      // let holders = (getRecordAlert[i]?.) ? getRecordAlert[i]. : ""
      // let total_market_cap = (getRecordAlert[i]?.) ? getRecordAlert[i]. :""
      // let total_supply = (getRecordAlert[i]?.) ? getRecordAlert[i]. : ""
      // let validity = (getRecordAlert[i]?.) ? getRecordAlert[i]. : ""
      // let current_supply_percentage = (getRecordAlert[i]?.) ? getRecordAlert[i]. :""
      let alertMessage = `New token contract address: ${contract_address},\n pair address : ${pair_address},\n owner address: ${owner_address}, \n symbol: ${symbol}\n
      liqudity: ${liqudity},\n burn liqudity: ${burn_liquidity},\n buy volume 24: ${buyVolume24h},\n sell volume 24: ${sellVolume24h},\n locked_percentage: ${locked_percentage}\n
      unlockDate: ${unlockDate},\n sell tax minimum: ${sell_tax_min},\n sell tax maximum: ${sell_tax_max},\n buy tax minimum: ${buy_tax_min},\n sell tax maximum: ${buy_tax_max}\n
      buy Volume 5m: ${buyVolume5m},\n sell Volume 5m: ${sellVolume5m},\n current price is ${currentPriceUsd}
      `;
      await TGNotification.sendAlert(alertMessage);
      await new_token.updateOne({_id : new ObjectId(id)}, {$set: {tg_alert : true}})
    }

  }catch(error){
    console.error("error comming ===>>>>>", error)
  }
})
