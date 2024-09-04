const { Wallet } = require("ethers")
const { ethers } = require("ethers")

function main() {
    console.log(new Wallet("0xf2af6834f41c3eb81eb35408a631ee0060addfb4af2d3156ffd90922a9fc5cd7").address);
    
    const wallet = Wallet.createRandom()
    console.log(wallet);
}

main()