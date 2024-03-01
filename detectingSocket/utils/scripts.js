require("../services/connection");
const {futureBuy} = require("../../models/futureBuy")
const Balance = require("../../models/Balance")
const Trade_setting = require("../../models/Trade_setting")
const User = require("../../models/User")
const Price = require("../../models/Price")
const {buy_order} = require("../../models/buy_order");
const { ObjectId } = require("mongodb");
const {sell_order} = require("../../models/sell_order");
const {scam_token} = require("../../models/scam_token");
const contractAbi = require("../../assets/Abi/USDT.json")
const axios = require('axios')
const { ethers } = require('ethers');
const RPCURL = 'https://mainnet.infura.io/v3/58b42d1280a04bf4b93d06e519786f6d'
ETHERSCAN_API_KEY = "FE9NA7D3ECAU3VJURDMEGFEGQN5HUYFD6I"
const Web3 = require('web3');
const web3 = new Web3(RPCURL);
const coinMarketCapApi = 'd3464b4c-5e62-44bd-a512-7704be82fa46'

const getSymbol = async() => {
    try{
        console.log("testing")
        let data = await futureBuy.find()
        return data
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    }
}

const getPriceSymbol = async() => {
    try{
        // console.log("testing")
        let data = await Price.find()
        return data
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    }
}

const getOrder = async() => {
    try{
        // let currentTime = new Date()
        // let oldTIme = new Date(currentTime - (10 * 60 * 1000))
        let data = await futureBuy.aggregate([
            {
                $match : {
                    status : "active", 
                }
            },
            {
                $lookup: {
                from: "prices",
                let: { contractAddres: "$contractAddress" },
                pipeline: [
                  {
                    $match: {
                        $expr: {$eq: ["$contract_address", '$$contractAddres']}
                    },
                  }
                ],
                as: "price_data",
                },
            },

            {
                $limit : 10
            }
        ])
        return data
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    } 
}

const markOrder_forBuy = async(order_id) => {
    try{
        await futureBuy.updateOne({_id : new ObjectId(order_id)}, {$set : {status : "ready_for_buy"}})
        return true
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    }
}

const getReadyFor_BuyOrder = async() => {
    try{
        // let currentTime = new Date()
        // let oldTIme = new Date(currentTime - (1 * 60 * 1000))
        let data = await futureBuy.aggregate([
            {
                $match : {
                    status : "ready_for_buy", 
                    // $or : [
                    //     {count : {$lt : 2}},
                    //     {count : {$exists : false}}
                    // ],
                    // updatedAt : { $lte : oldTIme}
                }
            },
            {
                $lookup: {
                from: "prices",
                let: { contractAddres: "$contractAddress" },
                pipeline: [
                  {
                    $match: {
                        $expr: {$eq: ["$contract_address", '$$contractAddres']}
                    },
                  }
                ],
                as: "price_data",
                },
            },
            {
                $limit : 1
            }
        ])
        return data
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    } 
}

const get_users = async() => {
    try{
        let data = await Trade_setting.aggregate([   
            {
                $match  : {
                    trading_status : true
                }
            },
            {
                $lookup: {
                from: "balances",
                let: { userId:  "$user_id" },
                pipeline: [
                  {
                    $match: {
                        $expr: {$eq: ["$user_id", '$$userId']},
                        symbol : "ETH",
                        balance : {$gt : 0}
                    },
                  },
                ],
                as: "balance",
                },
            }
        ])
        return data
    }catch(e){
        console.log("error ===>>>>>", e)
        return false 
    } 
}

const pauseTradeSetting = async(user_id) => {
    try{
        await Trade_setting.updateOne({ user_id: user_id}, {$set : {trading_status : false}});
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }
}

const saveOrder = async(insert_order) => {
    try{
        await buy_order.create(insert_order);
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    } 
}

const getSell_order = async () => {
    try{
        let order = await buy_order.aggregate([
            {
                $match : {
                    status : "ready_for_sell"
                }
            },
            {
                $lookup: {
                from: "prices",
                let: { contractAddres: "$contractAddress" },
                pipeline: [
                  {
                    $match: {
                        $expr: {$eq: ["$contract_address", '$$contractAddres']}
                    },
                  }
                ],
                as: "price_data",
                },
            },
            {
                $limit : 5
            }
        ])
        return order
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }  
}

const deleteBuy_order = async(order_id) => {
    try{
        await buy_order.deleteOne({_id :new ObjectId(order_id)})
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }  
}

const saveSoldOrder = async(insertSellOrder) => {
    try{
        await sell_order.create(insertSellOrder)
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }   
}

const getOpen_order = async() => {
    try{
        // let currentTime = new Date()
        // let oldTime = new Date(currentTime - (1 * 60 * 1000))
        let oldTime = new Date()
        oldTime.setSeconds(oldTime.getSeconds() - 20);

        let current_time = new Date()
        current_time.setSeconds(current_time.getSeconds() - 10);

        let orders = await buy_order.aggregate([
            {
                $match : {
                    status: 'open',
                    updatedAt : {$lte : oldTime}
                }
            },
            {
                $lookup: {
                from: "prices",
                let: { contractAddres: "$contractAddress" },
                pipeline: [
                  {
                    $match: {
                        $expr: {$eq: ["$contract_address", '$$contractAddres']},
                        updatedAt : {$lte : current_time},
                    },
                  }
                ],
                as: "price_data",
                },
            },
            {
                $limit : 10
            }
        ])
        return orders;
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }    
}

const updateStatus = async(order_id) => {
    try{
        await buy_order.updateOne({_id : new ObjectId(order_id)}, {$set : {status : "ready_for_sell"}})
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }   
}

const updateTime = async(order_id) => {
    try{
        await buy_order.updateOne({_id : new ObjectId(order_id)}, {$set : {updatedAt : new Date()}})
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }   
}

const make_tokenScam = async() => {
    try{
        let order = await futureBuy.find({count : {$gte : 3}})
        for(let i = 0; i < order.length; i++) {
            let order_id = (order[i]._id).toString()
            let contractAddress = order[i].contractAddress
            let pairAddress = order[i].pairAddress
            let symbol = order[i].symbol
            let name = order[i].name
            let count = order[i].count
            let insert_order = {
                contractAddress : contractAddress,
                pairAddress : pairAddress,
                status : "scam",
                symbol : symbol, 
                name : name,
                count : count
            }
            await scam_token.create(insert_order)
            await futureBuy.deleteOne({_id : new ObjectId(order_id)})
        }
        return true
    }catch(error){
        console.log("error ===>>>>>", error)
        return false  
    }
}

const checkContractIsVerfied = async(contractAddress) => {
    try {
        const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;                        
        const response = await axios.get(etherscanUrl);
        // console.log(" response.data.result =====>>>>>>>" ,response.data.result)
        if(!response.data.result){
            return false
        }
        let abi = JSON.parse(response.data.result);
        let verficationResult = (response.data.status === '1') ? true : false
        return {status : verficationResult, abi}
    }catch(error){
        // console.log(error)
        return false
    }
}

const checkContractIsSelfDesrruct = async(contractAddress) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPCURL);
        const bytecode = await provider.getCode(contractAddress);
        const hasSelfDestruct = await bytecode.includes('SELFDESTRUCT');
        if (hasSelfDestruct) {
            console.log(`Contract at address ${contractAddress} has self-destructed.`);
            return true
        } else {
            console.log(`Contract at address ${contractAddress} has not self-destructed.`);
            return false
        }
    }catch(error){
        // console.error('Error outer:', error)
        return false
    }
}

const checkOwnershipRenounced = async(contractAddress, abi) => {
    try{
        const contract = new web3.eth.Contract(abi, contractAddress);
        const isRenounced = await contract.methods.isOwnershipRenounced().call();
        console.log('Ownership Renounced:', isRenounced);
        return true
    }catch(error){
        // console.error('Error checking ownership:', error);
        return false;
    }
}

const buy_sellCheck = async(contractAddress, contractABI) => {

    // const provider = new ethers.providers.JsonRpcProvider(RPCURL);
    // const bytecode = await provider.getCode(contractAddress);
    // const isBuy_enabled = await bytecode.includes('isBuyEnabled');
    // if (isBuy_enabled) {
    //     console.log('isBuyEnabled ========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', isBuy_enabled)
    // }else{
    //     console.log('isBuyEnabled ========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    // }

    return true;
    // const contract = new web3.eth.Contract(contractABI, contractAddress);
    // contract.methods.isBuySellEnabled().call((error, result) => {
    //     if (!error) {
    //         console.log('Buy/Sell is enabled:', result);
    //         if(result == true){
    //             return true;
    //         }else{ 
    //             return false;
    //         }
    //     } else {
    //         // console.error('Error checking buy/sell status:', error);
    //         return false;
    //     }
    // });

}

const getTokenSymbol = async(tokenSymbol) => {
    try{        
        // console.log('symbol ===>>>', tokenSymbol)
        const apiUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?symbol=${tokenSymbol}`;
        const config = {
          headers: {
            'X-CMC_PRO_API_KEY': coinMarketCapApi,
          },
        };
        await axios.get(apiUrl, config)
          .then(response => {
            if (response.data.status.error_code === 0) {
              const tokenInfo = response.data.data[tokenSymbol];              
              if (tokenInfo.logo) {
                const logoUrl = tokenInfo.logo;
                console.log(`Logo URL for ${tokenSymbol}: ${logoUrl}`);
                console.log()
                return logoUrl;
              } else {
                console.log(`No logo available for ${tokenSymbol}`);
                return false
              }
            } else {
              console.error('Error:', response.data.status.error_message);
              return false
            }
          })
          .catch(error => {
            console.error('Error:', error.message);
            return false
        });
    }catch(e){
        console.error('e================================================================',e)
        return false   
    }
}

const checkTokenPrices_removeFromList = async() =>{
    try{
        let curretTime = new Date()
        const thirtyMinutesAgo = new Date(curretTime.getTime() - 5 * 60000);
        let tokens = await futureBuy.find({createdAt: { $lt : thirtyMinutesAgo}})
        const contractAddress = tokens.map(obj => obj.contractAddress);
        console.log(contractAddress)
        await Price.deleteMany({contract_address: {$in : contractAddress}})
        await futureBuy.deleteMany({contractAddress : {$in : contractAddress}})
        return true
    }catch(e){
        console.error('e================================================================',e)
        return false
    }
}

const getToken = async() => {
    try{
        let tokens = await Price.find({logo : ""})
        // console.log(tokens)
        return tokens
    }catch(e){
        console.error('e================================================================',e)
        return false
    }
}

const removeFromPriceCollection = async(order_id, contractAddress) => {
    try{
        await buy_order.deleteOne({_id :new ObjectId(order_id)});
        let count = await futureBuy.countDocuments({contractAddress})
        let countBuy = await buy_order.countDocuments({contractAddress})
        if(count == 0 && countBuy == 0){
            await Price.deleteOne({contract_address : contractAddress});
        }
        return true
    }catch(error){
        console.error('e================================================================', error)
        return false
    }
}

const deleteFutureBuy = async(order_id) => {
    try{
        await futureBuy.deleteOne({_id : new ObjectId(order_id)});
        return true
    }catch(error){
        console.error('e================================================================', error)
        return false
    }
}

const getTokenPrice = async(contract_address) => {
    try{
        let price = await Price.findOne({ contract_address : contract_address})
        if(price){
            return price
        }
        return false
    }catch(e){
        return false
    }
}

const getBalanceEth = async() => {
    try{
        let currentTime = new Date()
        let oldTIme = new Date(currentTime - (15 * 60 * 1000))
        // let tokens = await Trade_setting.find({updatedAt : { $lte : oldTIme}, trading_status : true}).limit(10)
        let tokens = await Trade_setting.find({trading_status : true}).limit(5)
        return tokens;
    }catch(error){
        console.error('e ==============', error)
        return false
    }
}

const updateEthBalance = async(userId, ethAmount) => {
    try{
        await Balance.updateOne({ user_id : userId}, {$set : {balance : ethAmount}}, {upsert : true})
        return true
    }catch(error){
        console.error('e================================================================', error)
        return false
    }
}

const checkCount = async(userId, contractAddress) => {
    try {
        let count = await buy_order.countDocuments({contractAddress : contractAddress, user_id : userId})
        return count;
    }catch(error){
        console.log("error ", error)
    }
}

const updatedBalance = async(userId, buy_amount, symbol) => {
    try{
        if(symbol == "sub"){
            await Balance.updateOne({user_id: userId, symbol : "ETH"},   { $inc: { balance: -Number(buy_amount) } })
        }else{
            await Balance.updateOne({user_id: userId, symbol : "ETH"},  { $inc: { balance: Number(buy_amount) } })
        }
        return true
    }catch(error){
        console.log("error ", error)
    }
}

const isBuyEnabled = async(abi, contract_address)=>{
    try {
        const contractInstance = new web3.eth.Contract(abi, contract_address);
        const result = await contractInstance.methods.isBuyEnabled().call();
        console.log('Buying is enabled:', result);
        return result;
    } catch (error) {
        // console.error('Error checking buy status:', error);
        return true
    }
}

const isSellEnabled = async(abi, contract_address) => {
  try {
    const contractInstance = new web3.eth.Contract(abi, contract_address);
    const result = await contractInstance.methods.isSellEnabled().call();
    console.log('Selling is enabled:', result);
    return result
  } catch (error) {
    // console.error('Error checking sell status:', error);
    return true
  }
}

const checkAlready_sold = async(user_id, contract_address) => {
    try{
        let count = await sell_order.countDocuments({user_id: user_id, contractAddress: contract_address, status: "sold"})
        if(count > 0){
            await buy_order.deleteOne({user_id: user_id, contractAddress: contract_address, status: "ready_for_sell"})
            await Price.deleteOne({contract_address: contract_address})

        }
        return (count > 0) ? true : false;
    }catch(error){
        console.error(error)
        return true;
    }
}

module.exports = {
    isSellEnabled, 
    checkAlready_sold,
    isBuyEnabled,
    getSymbol,
    updatedBalance,
    updateEthBalance,
    getOrder,
    get_users,
    pauseTradeSetting,
    saveOrder,
    getTokenPrice,
    getSell_order,
    deleteBuy_order,
    saveSoldOrder,
    getOpen_order,
    updateStatus,
    updateTime,
    make_tokenScam,
    getReadyFor_BuyOrder,
    markOrder_forBuy,
    checkContractIsVerfied,
    checkContractIsSelfDesrruct,
    checkOwnershipRenounced,
    buy_sellCheck,
    getPriceSymbol,
    getTokenSymbol,
    getToken,
    removeFromPriceCollection,
    checkTokenPrices_removeFromList,
    deleteFutureBuy,
    getBalanceEth,
    checkCount
}