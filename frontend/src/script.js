const codesElement = document.getElementById("codes");
const audioSuccess = document.getElementById("audioSuccess");
const audioError = document.getElementById("audioError");
const codesCounter = document.getElementById("codesCounter");
const pointsCounter = document.getElementById("pointsCounter");
const manualInput = document.getElementById("manualInput");

const scanner = new Instascan.Scanner({
	video: document.getElementById("preview"),
});

const sparkTank = new SparkTank();

manualInput.addEventListener("input", async () => {
	if (!manualInput || !manualInput.value) return;
	const code = manualInput.value.replaceAll(" ", "");
	if (code.length !== 12) return;
	handleCodeInput(code);
	if (await manualInput.value) {
		manualInput.value = "";
	}
});

const handleCodeInput = async (input) => {
	const code = input.replaceAll(" ", "");
	if (code.length !== 12) {
		console.warn("Error in Code: ", code);
		playAudio(audioError);
		return false;
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
		handleSuccess();
	}
	setTimeout(() => codeElement.classList.add("hide"), 30 * 1000);

	codesElement.prepend(codeElement);
	return res.ok;
};

const handleSuccess = () => {
	setTimeout(() => playAudio(audioSuccess), 20);
	codesCounter.innerText = +codesCounter.innerText + 1;
	const pos = {
		x:
			(document.getElementById("counter").offsetLeft +
				codesCounter.offsetLeft) /
			document.getElementById("overlay").clientWidth,
		y:
			(document.getElementById("counter").offsetTop + codesCounter.offsetTop) /
			document.getElementById("overlay").clientHeight,
	};
	sparkTank.burst({ pos });
};

const preLoad = async () => {
	try {
		const pointsRes = await getPoints();
		const codesRes = await getCodes();
		if (!pointsRes.ok) throw new Error("Could not get points");
		if (!codesRes.ok) throw new Error("Could not get codes");

		const { points } = await pointsRes.json();
		const { codes } = await codesRes.json();

		codesCounter.innerText = codes;
		pointsCounter.innerText = points;
	} catch (err) {
		console.error(err);
		document.body.innerHTML = "ERROR";
	}
};

const init = async () => {
	document.getElementById("startModal").style.display = "none";
	const cameras = await Instascan.Camera.getCameras();

	if (cameras.length > 0) {
		document.getElementById("preview").style.transform = `scaleX(${
			cameras.length > 1 ? 1 : -1
		})`;
		scanner.start(cameras[cameras.length - 1]);
	} else {
		console.error("No cameras found.");
	}

	scanner.addListener("scan", (content) => handleCodeInput(content));
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
	return fetch("/api/codes", {
		method: "POST",
		body: JSON.stringify({ qr: code }),
		headers: {
			"Content-Type": "application/json",
		},
	});
};
const getCodes = () => {
	return fetch("/api/codes", {
		method: "GET",
	});
};
const getPoints = () => {
	return fetch("/api/points", {
		method: "GET",
	});
};
const playAudio = (audioElement) => {
	audioElement.pause();
	audioElement.currentTime = 0;
	audioElement.play();
};

preLoad();
