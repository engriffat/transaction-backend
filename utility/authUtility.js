const bip39 = require('bip39')
const ethers = require('ethers');
const createNemonics = async() => {
    try{
        let recoveryPhrase = bip39.generateMnemonic();
        return recoveryPhrase
    }catch(error){
        console.log("error ===>>>>", error)
        return false
    }
}

const createWallet = async(mnemonics) => {
    try {
        const wallet = ethers.Wallet.fromMnemonic(mnemonics);
        const address = wallet.address;
        let privateKey = wallet.privateKey;
        const accountDetails = {
            walletAddress: address,
            privateKey
          };

        return accountDetails;
    } catch (error) {
      console.error("Error creating wallet:", error);
      return false;
    }
  };

module.exports = {
    createNemonics
}