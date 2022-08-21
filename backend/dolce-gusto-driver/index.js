// EXECUTE FROM BACKEND DIR
const path = require("path");
const fs = require("fs");
const { By, until, Builder, Browser, Key } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DATA_FILE = path.join(__dirname, "../data/codes.txt");
const ERR_FILE = path.join(__dirname, "../data/not_accepted.txt");

const TIMEOUT = 90 * 1000;

const XPATH = {
	login: {
		tab: `//div[@title="Mein Konto"]`,
		username: `//input[contains(@name, "login[username]")]`,
		password: `//input[contains(@name, "login[password]")]`,
		button: `//button[contains(@title, "anzumelden")]`,
	},
	nav: {
		bonus: `//a[contains(text(),"MEIN BONUS")]`,
		digit: `//div[contains(@aria-label, "Belohnungspunkt")]`,
	},
	form: {
		form: `//form[.//*[contains(@class,"pcm")]]`,
		input: `//input[contains(@aria-label,"Code")]`,
		button: `//button[contains(@title,"speichern")]`,
	},
};

const main = async () => {
	const NEW_DATA_FILE = path.join(
		__dirname,
		`../data/${new Date().toISOString()}_codes.txt`
	);
	// Load codes
	console.info("Loading codes");
	let codes = [];
	try {
		fs.copyFileSync(DATA_FILE, NEW_DATA_FILE, fs.constants.COPYFILE_EXCL);
		const rawData = fs.readFileSync(NEW_DATA_FILE).toString();
		codes = rawData.split("\n");
		codes = codes.filter((code) => code.length === 12);
	} catch (err) {
		console.warn("Could not load or copy data", err);
		throw Error("Could not load or copy data");
	}
	if (codes.length === 0) {
		console.warn("No codes found");
		throw Error("No codes found");
	}

	console.info("Build driver");
	const options = new Options();
	// options.excludeSwitches(["enable-logging"]); // disable 'DevTools listening on...'
	// options.addArguments(["--no-sandbox"]); // not an advised flag b
	options.addArguments("--headless");
	options.addArguments(
		"user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0"
	);
	const builder = new Builder().forBrowser(Browser.CHROME);
	const driver = await builder
		.setChromeOptions(options)
		// .usingServer("http://localhost:4444/wd/hub")
		.build();
	let status = 0;
	let points = 0;
	try {
		console.info("Open Site");
		await driver.get("https://www.dolce-gusto.ch/");
		await driver.sleep(5000);
		points = await enterCodes(codes, driver);
	} catch (err) {
		console.error("Error: ", err);
		status = 1;
	} finally {
		await driver.quit();
		if (status) throw Error("Could not enter codes");
	}
	return points;
};

const enterCodes = async (codes, driver) => {
	// OPEN LOGIN TAB
	console.info("Open Login Tab");
	await driver.findElement(By.xpath(XPATH.login.tab)).click();
	await driver.findElement(By.xpath(XPATH.login.tab)).click();
	// ENTER CREDENTIALS
	console.info("Enter Credentials");
	await driver
		.findElement(By.xpath(XPATH.login.username))
		.sendKeys(process.env.USERNAME);
	await driver
		.findElement(By.xpath(XPATH.login.password))
		.sendKeys(process.env.PASSWORD);
	await driver.findElement(By.xpath(XPATH.login.button)).click();
	// NAVIGATE TO BONUS
	console.info("Navigate to Bonus Page");
	try {
		await driver.wait(until.elementLocated(By.xpath(XPATH.nav.bonus)), TIMEOUT);
		await driver.findElement(By.xpath(XPATH.nav.bonus)).click();
	} catch {
		console.warn("Navigate with link...");
		await driver.get("https://www.dolce-gusto.ch/mybonus");
	}

	let points = await getPoints(driver);
	const initPoints = points;
	console.info("You are starting with " + points + " points");

	// ENTER CODES
	console.info("Entering Codes");
	for (let i in codes) {
		// scroll into view
		driver.sleep(500);
		driver.executeScript(
			"arguments[0].scrollIntoView()",
			await driver.findElement(By.xpath(XPATH.form.form))
		);

		const code = codes[i];
		console.log(code, `${+i + 1}/${codes.length}`);

		driver.sleep(300);
		// enter code
		await driver
			.findElement(By.xpath(XPATH.form.input))
			.sendKeys(code, Key.ENTER);
		// hit save
		driver.sleep(300 + Math.random() * 200);
		// Check if code was valid
		let newPoints = await getPoints(driver);
		if (newPoints === points) {
			console.warn("Code was not accepted");
			fs.appendFileSync(ERR_FILE, code + "\n");
		}
		points = newPoints;
		console.info("You have " + points + " points");
	}

	console.info("Cleaning up...");
	fs.truncateSync(DATA_FILE);
	console.info("Finished");
	return initPoints - points;
};

const getPoints = async (driver) => {
	await driver.wait(until.elementLocated(By.xpath(XPATH.nav.digit)), TIMEOUT);
	const digit = await driver.findElement(By.xpath(XPATH.nav.digit));
	const ariaLabel = await digit.getAttribute("aria-label");
	return +ariaLabel.match(/\d+/)[0];
};

module.exports = main;
