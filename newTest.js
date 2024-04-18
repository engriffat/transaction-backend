const { Connection, PublicKey, Transaction, TransactionInstruction, SYSVAR_RENT_PUBKEY } = require('@solana/web3.js');

const web3 =  require('@solana/web3.js');

const {splToken, createAssociatedTokenAccount, createMintToInstruction} = require('@solana/spl-token');
// Initialize connection to the Solana network
const connection = new Connection('https://api.mainnet-beta.solana.com');
// Sender's account private key
const senderPrivateKey = Buffer.from('4RyPzHEjTxV35Pb5DerVqGbkYY2QvAhCH8CabZBDZpeGkYSfaCWXCipVMMArFJUzTbfUcPpmH251VfHfKKAfUD1C', 'base64');
// Receiver's account public key
const receiverPublicKey = new PublicKey('G5Lu9zLtoiBrwVEV2qNxveAAK9LNnAKXqSxCYyKGscSq');
// Token Mint Address
const tokenMintAddress = new PublicKey('EDegvsxuKp6PXyZpL8gjr6wjs2kPTZyeEBMxo2z84uyW');
// Create a new token wallet for the receiver
// async function createTokenAccount() {
//     // Create a new token account
//     const newTokenAccount = await splToken.Token.createAccountWithSeed(
//         connection,
//         tokenMintAddress,
//         receiverPublicKey,
//         senderPrivateKey
//     );
//     // Initialize the token account
//     const initializeAccountInstruction = splToken.Token.createInitAccountInstruction(
//         splToken.TOKEN_PROGRAM_ID,
//         tokenMintAddress,
//         newTokenAccount,
//         receiverPublicKey
//     );
//     // Construct the transaction
//     const transaction = new Transaction().add(initializeAccountInstruction);
//     // Send the transaction
//     const signature = await connection.sendTransaction(transaction, [senderPrivateKey]);
//     // Wait for confirmation
//     await connection.confirmTransaction(signature);
//     console.log('Token account created and initialized:', newTokenAccount.toBase58());
// }
// createTokenAccount().catch(console.error);



const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } = require('@solana/spl-token');
// async function getAssociatedTokenAccount() {
//   const tokenAccount = await getAssociatedTokenAddress(
//     tokenMintAddress,
//     receiverPublicKey,  
//         true,
//         TOKEN_PROGRAM_ID,
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//     );
  
//     console.log("tokenAccount", tokenAccount.toString());
// }
// getAssociatedTokenAccount()

async function buildCreateAssociatedTokenAccountTransaction() {
  const associatedTokenAddress = await getAssociatedTokenAddress(tokenMintAddress, receiverPublicKey, false);
  console.log("associatedTokenAddress", associatedTokenAddress.toString())
  const transaction = new web3.Transaction().add(
    createAssociatedTokenAccountInstruction(
            receiverPublicKey,
            associatedTokenAddress,
            receiverPublicKey,
            tokenMintAddress
        )
    )   
    console.log("transaction", transaction)
  const transaction1 = new web3.Transaction().add(
    createMintToInstruction(
        tokenMintAddress,
        receiverPublicKey,
      authority,
      0.001
    )
  )
  console.log("transaction1", transaction1) 
}
buildCreateAssociatedTokenAccountTransaction()