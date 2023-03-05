class Spark {
	constructor(parent, sparkTank, pos) {
		this.sparkTank = sparkTank;

		this.element = document.createElement("div");

		const day = new Date().getDay() + 6;
		const color = (360 / 7) * day;
		this.element.style.backgroundColor = `hsl(${
			(Math.random() * 100 + color) % 360
		}, 100%, 50%)`;
		const size = Math.floor(3 + Math.random() * 3);
		this.element.style.width = size + "px";
		this.element.style.height = size + "px";
		this.element.style.position = "absolute";

		this.element.style.borderRadius = "100%";

		parent.append(this.element);
		this.init(parent, pos);
	}
	init(parent, pos = { x: 0.5, y: 0.5 }) {
		this.parent = parent;
		this.element.style.display = "block";

		this.x = this.parent.clientWidth * pos.x;
		this.y = this.parent.clientHeight * pos.y;

		const SPEED = 10;
		const DIR = Math.random() * 2 * Math.PI;

		this.dx = SPEED * Math.cos(DIR);
		this.dy = -SPEED * Math.sin(DIR);

		this.move();
	}
	move() {
		if (this.outOfBounce()) return this.die();
		this.x += this.dx;
		this.y += this.dy;
		this.element.style.left = this.x + "px";
		this.element.style.top = this.y + "px";

		requestAnimationFrame(this.move.bind(this));
	}
	outOfBounce() {
		return (
			this.x < 0 ||
			this.x > this.parent.clientWidth ||
			this.y < 0 ||
			this.y > this.parent.clientHeight
		);
	}
	die() {
		// this.element.parentNode.removeChild(this.element)
		this.element.style.display = "none";
		this.sparkTank.returnSpark(this);
	}
}
class SparkTank {
	constructor(max = 250) {
		this.max = max;
		this.content = [];
		this.released = [];
		this.connect();
	}
	connect() {
		this.parent = document.getElementsByClassName("sparks-container")?.[0];
		if (this.parent) {
			console.info("spark tank connected");
		} else {
			setTimeout(this.connect.bind(this), 200);
		}
	}
	shootSparks(n = 1, pos = { x: 0.5, y: 0.5 }) {
		if (!this.parent) {
			return console.warn("spark tank is not yet connected");
		}
		for (let i = 0; i < n; i++) {
			if (this.released.length > this.max) continue;

			const spark = this.content.pop();
			if (spark) {
				spark.init(this.parent, pos);
				this.released.push(spark);
			} else {
				const newSpark = new Spark(this.parent, this, pos);
				this.released.push(newSpark);
			}
		}
	}
	burst(options = {}, i = 0) {
		const min = options.min ?? 5;
		const n = options.n ?? 15;
		const p = options.p ?? 0.5;
		this.shootSparks(n, options.pos);

		if (min > i || Math.random() < p) {
			setTimeout(
				() => this.burst(options, i + 1),
				options.interval ?? 50 + Math.random() * 10 * i
			);
		}
	}
	returnSpark(spark) {
		this.released = this.released.filter((x) => x !== spark);
		this.content.push(spark);
	}
}
