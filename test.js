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

