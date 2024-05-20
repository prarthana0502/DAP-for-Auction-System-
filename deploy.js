const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-sepolia.g.alchemy.com/v2/L-CdtCDioer5lBFsvQjDRg2N0y1CkkQC"
    );

    const wallet = new ethers.Wallet(
        "5846bbf483cbfcbfa80bb5ac37c7719c12f596dd95de72f2daa048478e65e4cb",
        provider
    );


     abi = fs.readFileSync("Auction_sol_Auction.abi", "utf8");
    const binary = fs.readFileSync("Auction_sol_Auction.bin", "utf8");

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
    console.log("Contract is deploying...");

    // Manually set gas limit (e.g., 3000000)
    const gasLimit = 3000000;
    const biddingTime = 360000; // for example, 1 hour
    const beneficiaryAddress = "0x33018191CF9dbFb40c4DC64775Ee96Ff69Cabd00"; // address of the beneficiary

    const contract = await contractFactory.deploy(biddingTime, beneficiaryAddress, { gasLimit });

    console.log(contract);
    console.log("Contract deployed! 🥂🥂");
    console.log(contract.address) 


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });