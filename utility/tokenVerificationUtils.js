
let ETHERSCAN_API_KEY = "FE9NA7D3ECAU3VJURDMEGFEGQN5HUYFD6I"
const RPCURL = 'https://mainnet.infura.io/v3/58b42d1280a04bf4b93d06e519786f6d'
const { ethers } = require('ethers');
const axios = require('axios')
const Web3 = require('web3');
const web3 = new Web3(RPCURL);
const checkContractIsVerfied = async(contractAddress) => {
    try{
        const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`;                        
        const response = await axios.get(etherscanUrl);
        if(!response.data.result){
            return false
        }
        let abi = JSON.parse(response.data.result);
        let verficationResult = (response.data.status === '1') ? true : false
        return {status : verficationResult, abi}
    }catch(error){
        // console.error(error)
        return false
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
const checkContractIsSelfDesrruct = async(contractAddress) => {
    try {
        const provider = new ethers.providers.JsonRpcProvider(RPCURL);
        const bytecode = await provider.getCode(contractAddress);
        const hasSelfDestruct = await bytecode.includes('SELFDESTRUCT');
        if (hasSelfDestruct) {
            console.log(`Contract at address ${contractAddress} has self-destructed.`);
            return true
        } else {
            // console.log(`Contract at address ${contractAddress} has not self-destructed.`);
            return false
        }
    }catch(error){
        console.error('Error outer:', error)
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
const checkIsMintable = async(contractAddress, abi) => {
    try{
        const contract = new web3.eth.Contract(abi, contractAddress);
        const functions = Object.keys(contract.methods);
        if (functions.includes('mint')) {
            console.log('The contract is mintable.');
            return true;
        } else {
            console.log('The contract is not mintable.');
            return false;
        }
    }catch(error){
        console.error('Error checking mintable:', error);
        return false;
    }
}
module.exports = {
    checkContractIsVerfied,
    isBuyEnabled,
    checkIsMintable,
    isSellEnabled,
    checkContractIsSelfDesrruct,
    checkOwnershipRenounced
}