async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            document.getElementById("connectButton").innerHTML = "Status: Connected";
            document.getElementById("accountInfo").innerHTML = "Account Address: " + accounts[0];
            document.getElementById("auctionContainer").style.display = "block";
        } catch (error) {
            console.log(error);
        }
    } else {
        document.getElementById("connectButton").innerHTML = "Please install MetaMask";
    }
}
 
const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
const auctionContractAddress = "0x628cf517c73dcc01289518a512341e0cd6cee696";
const abi = [{
    "inputs": [],
    "name": "auctionEnd",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [],
    "name": "bid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_biddingTime",
            "type": "uint256"
        },
        {
            "internalType": "address payable",
            "name": "_beneficiary",
            "type": "address"
        }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "internalType": "address",
            "name": "winner",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "AuctionEnded",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "internalType": "address",
            "name": "bidder",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "HighestBidIncrease",
    "type": "event"
},
{
    "inputs": [],
    "name": "withdraw",
    "outputs": [
        {
            "internalType": "bool",
            "name": "",
            "type": "bool"
        }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "stateMutability": "payable",
    "type": "receive"
},
{
    "inputs": [],
    "name": "auctionEndTime",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [],
    "name": "beneficiary",
    "outputs": [
        {
            "internalType": "address payable",
            "name": "",
            "type": "address"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [],
    "name": "highestBid",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [],
    "name": "highestBidder",
    "outputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "stateMutability": "view",
    "type": "function"
},
{
    "inputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "name": "pendingReturns",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}];
async function init() {
    const auctionContract = new web3.eth.Contract(abi, auctionContractAddress);

    const accounts = await web3.eth.requestAccounts();
    const currentAccount = accounts[0];

    const beneficiary = await auctionContract.methods.beneficiary().call();
    const auctionEndTime = await auctionContract.methods.auctionEndTime().call();
    const highestBidder = await auctionContract.methods.highestBidder().call();
    const highestBid = await auctionContract.methods.highestBid().call();

    document.getElementById("beneficiary").textContent = beneficiary;
    const auctionEndTimestamp = auctionEndTime * 1000; // Convert seconds to milliseconds
    const auctionEndDatetime = new Date(auctionEndTimestamp);
    const localDatetimeString = auctionEndDatetime.toLocaleString(); // Convert to local date and time string

document.getElementById("auctionEndTime").textContent = localDatetimeString;

    document.getElementById("highestBidder").textContent = highestBidder;
    document.getElementById("highestBid").textContent = web3.utils.fromWei(highestBid, "ether");

    document.getElementById("bidForm").addEventListener("submit", placeBid);
    document.getElementById("withdrawButton").addEventListener("click", withdraw);
    document.getElementById("endAuctionButton").addEventListener("click", auctionEnd);

    
    let ended = false; 
async function auctionEnd() {
    try {
        // Get the current block timestamp
        const currentTimestamp = await web3.eth.getBlock("latest").timestamp;

        // Check if the auction has ended
        if (currentTimestamp < auctionEndTime) {
            throw new Error("The auction has not ended yet");
        }

        // Check if the auction has already ended
        if (ended) {
            throw new Error("The function auctionEnded has already been called");
        }

        // Mark the auction as ended
        ended = true;

        // Emit the AuctionEnded event
        const receipt = await auctionContract.methods.auctionEnd().send({ from: accounts[0] });
        console.log("Auction Ended. Event emitted:", receipt.events.AuctionEnded);

        // Transfer the highest bid to the beneficiary
        const highestBidder = receipt.events.AuctionEnded.returnValues.winner;
        const highestBid = receipt.events.AuctionEnded.returnValues.amount;

        console.log(`Transferring ${highestBid} to beneficiary: ${beneficiary}`);
        await web3.eth.sendTransaction({
            from: accounts[0],
            to: beneficiary,
            value: highestBid
        });

        console.log("Transfer successful");
    } catch (error) {
        console.error("Error ending auction:", error.message);
        // Handle error appropriately
    }
}
async function getPendingReturns() {
    try {
        // Get the pending returns for the specified account
        console.log("0")
        const pendingReturn = await auctionContract.methods.pendingReturns(accounts).call();
       
        console.log("Pending return for account", accounts, ":", pendingReturn);
       
        // Display the pending return on the frontend or perform further actions
        document.getElementById("pendingReturn").textContent = pendingReturn;
    } catch (error) {
        console.error("Error getting pending returns:", error);
    }
}
document.getElementById("getPendingReturnsButton").addEventListener("click", async () => {
    const account = "0x33018191cf9dbfb40c4dc64775ee96ff69cabd00"; // Specify the Ethereum address for which you want to retrieve pending returns
    await getPendingReturns(account);
});

}

async function placeBid(event) {
    event.preventDefault();
    const bidAmount = web3.utils.toWei(document.getElementById("bidAmount").value, "ether");
    const accounts = await web3.eth.requestAccounts();
    const auctionContract = new web3.eth.Contract(abi, auctionContractAddress);
    await auctionContract.methods.bid().send({ from: accounts[0], value: bidAmount, gasLimit: 300000 });
    console.log("Your Bid is placed!!!");
    document.getElementById('Status').innerHTML = "Your Bid is placed!!!";
}

async function withdraw() {
    const accounts = await web3.eth.requestAccounts();
    const auctionContract = new web3.eth.Contract(abi, auctionContractAddress);
    await auctionContract.methods.withdraw().send({ from: accounts[0] });
    console.log("Withdraw done successfully!!");
    document.getElementById('Status').innerHTML = "Withdraw done successfully!!!";
}

// async function endAuction() {
//     const accounts = await web3.eth.requestAccounts();
//     const auctionContract = new web3.eth.Contract(abi, auctionContractAddress);
//     await auctionContract.methods.auctionEnd().send({ from: accounts[0] });
//     console.log("Auction Ended!!!");
//     document.getElementById('Status3').innerHTML = "Auction Ended!!!";
// }



init();
