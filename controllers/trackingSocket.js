const ethers = require('ethers');
require('../utility/dbConn');
const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
require('dotenv').config()
const new_token = require('../models/new_token')
let WETHAddress= '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
let factoryAddress= '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' 
let routerAddress= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
let recipientAddress= '0x81D84b1C6656aafc194b34feC426C19e63eEE431' 
let mnemonicPhrase = 'slow sound beyond inhale husband during next weasel east library split matrix' 
let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/UHm-FJzBVdJDsvGXJ3HyI39UfLg7J9VA'
// let RPCURL = "http://18.205.38.205:8551"
// let RPCURL = "wss://18.205.38.205:30303"
const Web3 = require('web3')
let USDTABI = require('../assets/Abi/abi.json')
const web3 = new Web3(RPCURL) 
console.log("RPCURL ====>>>>>>>", RPCURL)
const addresses = {
  WETH: WETHAddress,
  factory: factoryAddress, 
  router: routerAddress,
  recipient: recipientAddress 
}
const mnemonic = mnemonicPhrase 
const provider = new ethers.providers.WebSocketProvider(RPCURL);
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);
const factory = new ethers.Contract(
  addresses.factory,
  ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
  account
);
const router = new ethers.Contract(
  addresses.router,
  [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
  ],
  account
);
console.log(`Listening for new pairs...\n`)
factory.on('PairCreated', async (token0, token1, pairAddress) => {
  try{
    console.log(`
      New pair detected
      =================
      token0: ${token0}
      token1: ${token1}
      pairAddress: ${pairAddress}
    `);
    //The quote currency needs to be WETH (we will pay with WETH)
    let tokenIn, tokenOut;
    if(token0 === addresses.WETH) {
      tokenIn = token0; 
      tokenOut = token1;
    }
    if(token1 == addresses.WETH) {
      tokenIn = token1; 
      tokenOut = token0;
    }
    if(typeof tokenIn === 'undefined') {
      return;
    }
    console.log(`Checking liquidity...\n`)
    const uPair = new web3.eth.Contract(IUniswapV2Pair.abi, pairAddress)
    const reserves = await uPair.methods.getReserves().call()
    console.log(`Token has no liquidity bot added this contract added in database for again checking after some time...`)
    let saveAddress  = (token0 == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ? token1 : token0
    const contract = new web3.eth.Contract(USDTABI, saveAddress);
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Token name: ${name}`);
    await new_token.updateOne({contract_address : saveAddress},{$set: {pair_address : pairAddress, symbol : symbol}},{upsert: true});
  }catch(error){
    console.log("error ====>>>>>", error.message)
    let saveAddress  = (token0 == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ? token1 : token0
    const contract = new web3.eth.Contract(USDTABI, saveAddress);
    const symbol = await contract.methods.symbol().call();
    const name = await contract.methods.name().call();
    console.log(`Token Symbol: ${symbol}`);
    console.log(`Token name: ${name}`);
    await new_token.updateOne({contract_address : saveAddress},{$set: {pair_address : pairAddress, symbol : symbol}},{upsert: true})
    console.log(`Listening for new pairs...\n`)
  }
});




// const ethers = require('ethers');
// require("dotenv").config();
// const {futureBuy} = require("../../models/futureBuy");
// const price = require("../../models/Price")
// require("./connection");
// const IUniswapV2Pair = require('@uniswap/v2-core/build/IUniswapV2Pair.json')
// require('dotenv').config()
// const script = require('../utils/scripts')
// let WETHAddress= '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
// let factoryAddress= '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f' 
// let routerAddress= '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
// let recipientAddress= '0x81D84b1C6656aafc194b34feC426C19e63eEE431' 
// let mnemonicPhrase = 'slow sound beyond inhale husband during next weasel east library split matrix' 
// let RPCURL = 'wss://eth-mainnet.g.alchemy.com/v2/b_J0rV5-81u-OwjBa-q4dVzAJWwtoS6b'

// const Web3 = require('web3')
// let USDTABI = require('../../assets/Abi/USDT.json')
// const web3 = new Web3(RPCURL) 
// console.log("RPCURL ====>>>>>>>", RPCURL)
// const addresses = {
//   WETH: WETHAddress,
//   factory: factoryAddress, 
//   router: routerAddress,
//   recipient: recipientAddress 
// }
// const mnemonic = mnemonicPhrase 
// const provider = new ethers.providers.WebSocketProvider(RPCURL);
// const wallet = ethers.Wallet.fromMnemonic(mnemonic);
// const account = wallet.connect(provider);
// const factory = new ethers.Contract(
//   addresses.factory,
//   ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
//   account
// );
// const router = new ethers.Contract(
//   addresses.router,
//   [
//     'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
//     'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
//   ],
//   account
// );
// console.log(`Listening for new pairs...\n`)
// factory.on('PairCreated', async (token0, token1, pairAddress) => {
//   try{
//     console.log(`
//       New pair detected
//       =================
//       token0: ${token0}
//       token1: ${token1}
//       pairAddress: ${pairAddress}
//     `);
//     //The quote currency needs to be WETH (we will pay with WETH)
//     let tokenIn, tokenOut;
//     if(token0 === addresses.WETH) {
//       tokenIn = token0; 
//       tokenOut = token1;
//     }
//     if(token1 == addresses.WETH) {
//       tokenIn = token1; 
//       tokenOut = token0;
//     }
//     if(typeof tokenIn === 'undefined') {
//       return;
//     }
//     console.log(`Checking liquidity...\n`)
//     const uPair = new web3.eth.Contract(IUniswapV2Pair.abi, pairAddress)
//     const reserves = await uPair.methods.getReserves().call()
//     console.log(`Token has no liquidity bot added this contract added in database for again checking after some time...`)
//     let saveAddress  = (token0 == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ? token1 : token0
//     const contract = new web3.eth.Contract(USDTABI, saveAddress);
//     const symbol = await contract.methods.symbol().call();
//     const name = await contract.methods.name().call();
//     console.log(`Token Symbol: ${symbol}`);
//     console.log(`Token name: ${name}`);
//     await futureBuy.updateOne({contractAddress : saveAddress},{$set: {type: "auto", pairAddress : pairAddress, symbol : symbol, name : name, status : "active"}},{upsert: true});
//     // await futureBuy.create({type: "auto", contractAddress : saveAddress, pairAddress : pairAddress, symbol : symbol, name : name, status : "active"});
//     let priceToken= {
//       // contract_address: saveAddress, 
//       symbol,
//       slug: "",
//       logo: "",
//       price: 0,
//       chain_id: 1 
//     }
//     await price.updateOne({contract_address: saveAddress},{$set: priceToken}, {upsert: true});
//     // await price.create(priceToken);
//   }catch(error){
//     console.log("error ====>>>>>", error.message)
//     let saveAddress  = (token0 == "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2") ? token1 : token0
//     const contract = new web3.eth.Contract(USDTABI, saveAddress);
//     const symbol = await contract.methods.symbol().call();
//     const name = await contract.methods.name().call();
//     console.log(`Token Symbol: ${symbol}`);
//     console.log(`Token name: ${name}`);
//     // await futureBuy.create({ contractAddress : saveAddress, pairAddress : pairAddress, symbol : symbol, name : name, status : "active", type: "auto"})
//     await futureBuy.updateOne({contractAddress : saveAddress},{$set: {pairAddress : pairAddress, symbol : symbol, name : name, status : "active", type: "auto"}},{upsert: true})
//     let priceToken= {
//       symbol,
//       slug: "",
//       logo: "",
//       price: 0,
//       chain_id: 1 
//     }
//     await price.updateOne({contract_address: saveAddress}, {$set : priceToken}, {upsert: true});
//     // await price.create(priceToken);
//     console.log(`Listening for new pairs...\n`)
//   }
// });
