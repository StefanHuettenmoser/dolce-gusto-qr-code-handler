const codesElement = document.getElementById("codes");
const audioSuccess = document.getElementById("audioSuccess");
const audioError = document.getElementById("audioError");
const scannedCounter = document.getElementById("scannedCounter");
const pointsCounter = document.getElementById("pointsCounter");
const runButton = document.getElementById("run");

runButton.disabled = true;

const scanner = new Instascan.Scanner({
	video: document.getElementById("preview"),
});

runButton.addEventListener("click", async () => {
	runButton.innerText = "Loading...";
	scannedCounter.innerText = "0";
	runButton.disabled = true;
	const res = await fetch("/run", {
		method: "GET",
	});
	const json = await res.json();
	const points = json.points;
	pointsCounter.innerText = +pointsCounter.innerText + points;
	runButton.disabled = false;
	runButton.innerText = "Eingeben";
});

scanner.addListener("scan", (content) => handleScan(content));

const handleScan = async (content) => {
	const code = content.replaceAll(" ", "");
	if (code.length !== 12) {
		console.warn("Error in Code: ", code);
		playAudio(audioError);
		return;
	}

	const formattedCode = formatCode(code, 4);
	const codeElement = document.createElement("span");
	codeElement.innerText = formattedCode;

	// Post code
	const res = await sendCode(code);

	if (!res.ok) {
		codeElement.classList.add("invalid");
		codeElement.style.color = "red";
		playAudio(audioError);
	} else {
		playAudio(audioSuccess);
		scannedCounter.innerText = +scannedCounter.innerText + 1;
	}
	setTimeout(() => codeElement.classList.add("hide"), 30 * 1000);

	codesElement.prepend(codeElement);
};

const main = async () => {
	const cameras = await Instascan.Camera.getCameras();

	if (cameras.length > 0) {
		document.getElementById("preview").style.transform = `scaleX(${
			cameras.length > 1 ? 1 : -1
		})`;
		scanner.start(cameras[cameras.length - 1]);
	} else {
		console.error("No cameras found.");
	}
};

const formatCode = (code, interval, filler = " ") => {
	let output = "";
	for (let i = 0; i < code.length; i++) {
		output += code[i];
		if ((i + 1) % interval === 0) output += filler;
	}
	return output.trim();
};

const sendCode = (code) => {
	return fetch("/send-qr", {
		method: "POST",
		body: JSON.stringify({ qr: code }),
		headers: {
			"Content-Type": "application/json",
		},
	});
};
const playAudio = (audioElement) => {
	audioElement.pause();
	audioElement.currentTime = 0;
	audioElement.play();
};

main();

// DEBUGIN: add fake codes
const fakeAdd = () => {
	handleScan("aaaabbbbccc" + Math.floor(Math.random() * 10));
	setTimeout(fakeAdd, 2000 + Math.random() * 5000);
};
