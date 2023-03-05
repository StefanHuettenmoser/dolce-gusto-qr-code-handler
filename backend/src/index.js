const express = require("express");

const { get: getPoints } = require("./points.js");
const {
	post: postCode,
	isValid: codeIsValid,
	get: getCodes,
} = require("./codes.js");
const enterCodesToWebsite = require("./selenium.js");

const app = express();
app.use(express.json()); // to support JSON-encoded bodies
app.set("trust proxy", true);

app.get("/api/codes", async (req, res) => {
	const row = await getCodes();
	res.json({ codes: row.length });
});

app.post("/api/codes", async (req, res) => {
	const code = req.body.qr;
	// validate
	if (!code) {
		return res.status(400).send("No `qrCode` in body");
	} else if (!codeIsValid(code)) {
		return res.status(400).send("Invalid `qrCode`");
	}
	// post
	try {
		await postCode(code);
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).send("This `qrCode` already exists");
		}
		console.error(err);
		return res.status(500).send("Could not save data!");
	}
	res.status(201).send(`Code saved`);
});

app.get("/api/points", async (req, res) => {
	const points = await getPoints();
	return res.json(points);
});
app.post("/api/points", async (req, res) => {
	if (codesAreEntered) {
		return res.status(409).send("Already Processing");
	}

	try {
		const codes = await getCodes();
		codesAreEntered = true;
		await enterCodesToWebsite(codes.map((x) => x.code));
	} catch (err) {
		console.error(err);
		return res.status(500).send("Error while processing");
	} finally {
		codesAreEntered = false;
	}
	res.status(201).send("success");
});

app.listen(8080, () => {
	console.log("HTTP SERVER LISTENING ON PORT 8080");
});

let codesAreEntered = false;
const schedule = async () => {
	console.info("CronJob: Entering Codes on Dolce Gusto Site");
	if (codesAreEntered) {
		return console.warn(
			"Could not add codes. Another process is already on the website"
		);
	}

	try {
		const codes = await getCodes();
		codesAreEntered = true;
		await enterCodesToWebsite(codes.map((x) => x.code));
	} catch (err) {
		console.error("CronJob Failed:");
		console.error(err);
	} finally {
		codesAreEntered = false;
	}
};

const cron = require("node-cron");
cron.schedule(process.env.UPDATE_CRON || "0 * * * *", schedule);
if (
	process.env.NODE_ENV === "development" &&
	process.env.SELENIUM_DEV === "true"
) {
	schedule();
}
