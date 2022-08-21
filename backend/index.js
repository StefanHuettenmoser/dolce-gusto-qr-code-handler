const fs = require("fs");
const https = require("https");
const serveStatic = require("serve-static");
const privateKey = fs.readFileSync("certs/server.key", "utf8");
const certificate = fs.readFileSync("certs/server.crt", "utf8");
const enterCodesToWebsite = require("./dolce-gusto-driver/index.js");

const credentials = {
	key: privateKey,
	cert: certificate,
	passphrase: "12345678",
};

const express = require("express");
const app = express();

app.use(express.json()); // to support JSON-encoded bodies

app.post("/send-qr", (req, res) => {
	const DATA_FILE = "data/codes.txt";
	if (req.body?.qr?.length !== 12) {
		return res.status(400).send("Supply a qr code with 12 characters");
	}
	const qrCode = req.body.qr;
	let codes = [];
	try {
		const rawData = fs.readFileSync(DATA_FILE).toString();
		codes = rawData.split("\n");
		codes = codes.filter((code) => code.length === 12);
	} catch (err) {
		console.warn("Could not load data", err);
	}

	if (codes.indexOf(qrCode) !== -1) {
		return res.status(409).send("Already scanned");
	}

	try {
		fs.appendFileSync(DATA_FILE, qrCode + "\n");
	} catch (err) {
		console.err("Could not save data", err);
		return res.status(500).send("Could not save data!");
	}

	res.status(201).send(`Posted ${req.body.qr.length} codes`);
});
app.get("/run", async (req, res) => {
	let points = 0;
	try {
		points += await enterCodesToWebsite();
	} catch (err) {
		return res.status(409).json({ error: true, points });
	}
	res.status(201).json({ points });
});

app.use(serveStatic("../frontend", { index: ["index.html", "index.htm"] }));

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443);
console.log("HTTPS SERVER LISTENING ON PORT 8443");
