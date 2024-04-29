// const axios = require('axios');
// axios.post('https://rpc.ankr.com/multichain', {
//   jsonrpc: '2.0',
//   method: 'ankr_getTokenTransfers',
//   params: {
//     address: '0x443459d45c30a03f90037d011cbe22e2183d3b12',
//     blockchain: ['eth'],
//     fromTimestamp: 1712095962,
//     toTimestamp: 1712995962
//   },
//   id: 1
// }, {
//   headers: {
//     'Content-Type': 'application/json'
//   }
// })
// .then(response => {
//   console.log('Response:', response.data);
// })
// .catch(error => {
//   console.error('Error:', error);
// });


// const { AnkrProvider } =require('@ankr.com/ankr.js');
// const provider = new AnkrProvider();
// const tokenTransfers = async () => {
//   return await provider.getTokenTransfers({ 
//     blockchain:    'eth',
//     address:       '0xf16e9b0d03470827a95cdfd0cb8a8a3b46969b91',
//     fromTimestamp: 1711095962,
//     toTimestamp:   1712095962,
//     pageSize:      1,
//     descOrder: true,
//     includeLogs: true });
// };
// tokenTransfers().then((reply) => {
//   console.log(reply)
// })

// const  {ethers, JsonRpcProvider}  = require("ethers");
// const ABI = [
//     { inputs: [], stateMutability: "nonpayable", type: "constructor" },
//     {
//       anonymous: false,
//       inputs: [
//         {
//           indexed: true,
//           internalType: "address",
//           name: "previousOwner",
//           type: "address",
//         },
//         {
//           indexed: true,
//           internalType: "address",
//           name: "newOwner",
//           type: "address",
//         },
//       ],
//       name: "OwnershipTransferred",
//       type: "event",
//     },
//     {
//       inputs: [{ internalType: "bool", name: "status", type: "bool" }],
//       name: "EndPresale",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "buyTokensNative",
//       outputs: [],
//       stateMutability: "payable",
//       type: "function",
//     },
//     {
//       inputs: [{ internalType: "uint256", name: "usdtAmount", type: "uint256" }],
//       name: "buyTokensUSDT",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "claimTokens",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "getLatestPriceETH",
//       outputs: [{ internalType: "int256", name: "", type: "int256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         { internalType: "address", name: "walletAddress", type: "address" },
//       ],
//       name: "getPurchaseInfo",
//       outputs: [
//         {
//           components: [
//             { internalType: "uint256", name: "stage", type: "uint256" },
//             { internalType: "uint256", name: "amount", type: "uint256" },
//             { internalType: "bool", name: "claimed", type: "bool" },
//           ],
//           internalType: "struct PreSaleEth.Purchase[]",
//           name: "",
//           type: "tuple[]",
//         },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "getTotalCoinsSoldData",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "getTotalSold",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "getTotalSoldInContract",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "isClaimable",
//       outputs: [{ internalType: "bool", name: "", type: "bool" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "isPresaleOpen",
//       outputs: [{ internalType: "bool", name: "", type: "bool" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "lastStagetime",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "owner",
//       outputs: [{ internalType: "address", name: "", type: "address" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       name: "pricesUSDT",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [
//         { internalType: "address", name: "", type: "address" },
//         { internalType: "uint256", name: "", type: "uint256" },
//       ],
//       name: "purchases",
//       outputs: [
//         { internalType: "uint256", name: "stage", type: "uint256" },
//         { internalType: "uint256", name: "amount", type: "uint256" },
//         { internalType: "bool", name: "claimed", type: "bool" },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "renounceOwnership",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [{ internalType: "bool", name: "status", type: "bool" }],
//       name: "setClaimable",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         { internalType: "address", name: "_tokenAddress", type: "address" },
//       ],
//       name: "setTSCAddress",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [
//         { internalType: "address", name: "_tokenAddress", type: "address" },
//       ],
//       name: "setTokenAddress",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [{ internalType: "uint256", name: "tSold", type: "uint256" }],
//       name: "setTotalSold",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "stage",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "stages",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "token",
//       outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "tokenAmountPerStage",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "tokenSold",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "tokenSoldInContract",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "tokensLeft",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "totalSoldCoins",
//       outputs: [
//         { internalType: "contract TotalSoldCoins", name: "", type: "address" },
//       ],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "totalTokenAmount",
//       outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
//       name: "transferOwnership",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "updateTotalSoldCombined",
//       outputs: [{ internalType: "bool", name: "", type: "bool" }],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "usdt",
//       outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
//       stateMutability: "view",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "withdrawStablecoins",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//     {
//       inputs: [],
//       name: "withdrawTokens",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
// ];   
// const contractAddress = "0x620F8e75222741dA25cE4EAC580318ffbFA5eF10";
// const provider = new JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
// const contract = new ethers.Contract(contractAddress, ABI, provider);
// // console.log("contract", contract)
// async function callContractFunction() {
//     try {
//         const result = await contract.buyTokensNative({value : 1});
//         console.log("Function result:", result);
//     } catch (error) {
//         console.error("Error calling function:", error);
//     }
// }

// callContractFunction();

