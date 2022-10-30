// EXECUTE FROM BACKEND DIR
const fs = require("fs");
const { By, until, Builder, Browser, Key } = require("selenium-webdriver");
const { Options } = require("selenium-webdriver/chrome");
const q = require("./db");
const { setError, setEntered } = require("./codes");
const { update } = require("./points");

const TIMEOUT = 90 * 1000;
const M = 1;

const BASE_URL = "https://www.dolce-gusto.ch";
const POINTS_URL = "https://www.dolce-gusto.ch/reward/customer/info/";

const XPATH = {
	login: {
		myAccount: `//a[contains(@class,"my-account")]`,
		myAccountLoggedIn: `//a[contains(@class,"my-account-logged-in")]`,
		username: `//input[@id="email"]`,
		password: `//input[@id="pass"]`,
	},
	points: {
		counter: `//span[@class="reward__points--total"]`,
		input: `//input[@id="code"]`,
	},
	language: "//li[contains(@class,'view-ndg_ch_de')]",
};

const run = async (codes) => {
	if (codes.length === 0) {
		console.warn("No Code found. List is empty");
		throw Error("No codes found");
	}
	console.info(`Received ${codes.length} codes to enter`);

	console.info("Building driver...");
	const options = new Options();
	const args = [
		"--lang=de-DE",
		"--no-sandbox",
		"--disable-dev-shm-usage",
		"--headless",
		"user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0",
		`--width=${1920}`,
		`--height=${988}`,
	];
	options.addArguments(args);

	const builder = new Builder().forBrowser(Browser.CHROME);
	const driver = await builder.setChromeOptions(options).build();

	let status = 0;
	let points = 0;
	try {
		console.info("Open Site");
		await driver.get(BASE_URL);
		await driver.sleep(5000 * M);
		await selectLanguage(driver);
		await driver.sleep(2000 * M);
		await login(driver);
		await navigateToBonusPage(driver);
		points = await enterCodes(driver, codes);
	} catch (err) {
		console.error("Error: ", err);
		await saveScreenshot(driver);
		await dumpHTML(driver);
		status = 1;
	} finally {
		await driver.quit();
		if (status) throw Error("Could not enter codes");
	}
	return points;
};

const selectLanguage = async (driver) => {
	console.info("Selecting Language...");
	try {
		await driver.findElement(By.xpath(XPATH.language)).click();
		console.info("language successfully selected");
	} catch {
		console.info("Language seems to be selected");
	}
};

const login = async (driver) => {
	// OPEN LOGIN TAB
	console.info("Opening Login Tab...");
	try {
		let i = 0;
		while (true) {
			console.info("spam click", i);
			await driver.findElement(By.xpath(XPATH.login.myAccount)).click();
			await driver.sleep(Math.random() * 300);
			i++;
		}
	} catch {
		console.info("finish spamming");
	}
	await driver.sleep(6000 * M);
	// ENTER CREDENTIALS
	console.info("Enter Credentials");
	await driver
		.findElement(By.xpath(XPATH.login.username))
		.sendKeys(process.env.DG_USERNAME);
	await driver
		.findElement(By.xpath(XPATH.login.password))
		.sendKeys(process.env.DG_PASSWORD);
	await driver.findElement(By.xpath(XPATH.login.password)).sendKeys(Key.ENTER);

	console.info("Waiting for login to complete...");
	await driver.wait(
		until.elementLocated(By.xpath(XPATH.login.myAccountLoggedIn)),
		TIMEOUT
	);
	console.info("Login complete");
};
const navigateToBonusPage = async (driver) => {
	console.warn("Navigating to Bonus Page with link...");
	await driver.get(POINTS_URL);
};

const enterCodes = async (driver, codes) => {
	console.info("Entering Codes...");
	let points = await getPoints(driver);
	const initPoints = points;
	console.info("You are starting with " + points + " points");

	// ENTER CODES
	for (let i in codes) {
		const code = codes[i];
		console.log(code, `${+i + 1}/${codes.length}`);
		// scroll into view
		driver.sleep(M * 400 + Math.random() * 200 * M);
		// enter code
		await driver
			.findElement(By.xpath(XPATH.points.input))
			.sendKeys(code, Key.ENTER);
		// hit save
		driver.sleep(M * 300 + Math.random() * 200 * M);
		// Check if code was valid
		let newPoints = await getPoints(driver);
		if (newPoints === points) {
			console.warn("Code was not accepted");
			await setError(code);
		}
		await setEntered(code);
		points = newPoints;
		console.info("You have " + points + " points");
		update(points);
	}
	console.info("Finished");
	return initPoints - points;
};

const getPoints = async (driver) => {
	await driver.wait(
		until.elementLocated(By.xpath(XPATH.points.counter)),
		TIMEOUT
	);
	const points = await driver
		.findElement(By.xpath(XPATH.points.counter))
		.getAttribute("innerHTML");
	return +points;
};

const saveScreenshot = async (driver) => {
	const dir = "/selenium/screenshots/";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const image = await driver.takeScreenshot();

	await fs.writeFileSync(`${dir}error_${+new Date()}.png`, image, "base64");
};
const dumpHTML = async (driver) => {
	const dir = "/selenium/html/";
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	const pageSource = await driver
		.wait(until.elementLocated(By.css("body")), TIMEOUT)
		.getAttribute("innerHTML");

	await fs.writeFileSync(`${dir}error_${+new Date()}.html`, pageSource);
};

module.exports = run;
