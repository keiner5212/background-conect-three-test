import { POINTS_COLOR, POINTS_COLOR_VARIABLE, POINTS_PER_SQUARE, SHOW_RADIOUS } from "./constants";
import "./style.css";
import { TweenLite, Circ } from "gsap";

let posy = 0;

let width,
	height,
	canvas,
	ctx,
  largeHeader,
	points,
	target,
	animateHeader = true;

// Main
initHeader();
initAnimation();
addListeners();

function initHeader() {
	width = innerWidth;
	height = innerHeight;
	target = { x: width / 2, y: height / 2 };

	largeHeader = document.getElementById("large-header");

	canvas = document.getElementById("demo-canvas");
	ctx = canvas.getContext("2d");

	// create points
	points = [];
	for (let x = 0; x < width; x = x + width / POINTS_PER_SQUARE) {
		for (let y = 0; y < height; y = y + height / POINTS_PER_SQUARE) {
			let px = x + (Math.random() * width) / POINTS_PER_SQUARE;
			let py = y + (Math.random() * height) / POINTS_PER_SQUARE;
			let p = { x: px, originX: px, y: py, originY: py };
			points.push(p);
		}
	}

	// for each point find the 5 closest points
	for (let i = 0; i < points.length; i++) {
		let closest = [];
		let p1 = points[i];
		for (let j = 0; j < points.length; j++) {
			let p2 = points[j];
			if (!(p1 == p2)) {
				let placed = false;
				for (let k = 0; k < 5; k++) {
					if (!placed) {
						if (closest[k] == undefined) {
							closest[k] = p2;
							placed = true;
						}
					}
				}

				for (let k = 0; k < 5; k++) {
					if (!placed) {
						if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
							closest[k] = p2;
							placed = true;
						}
					}
				}
			}
		}
		p1.closest = closest;
	}

	// assign a circle to each point
	for (let i in points) {
		let c = new Circle(
			points[i],
			2 + Math.random() * 2,
			POINTS_COLOR
		);
		points[i].circle = c;
	}
}

// Event handling
function addListeners() {
	if (!("ontouchstart" in window)) {
		window.addEventListener("mousemove", mouseMove);
	}
	window.addEventListener("scroll", scrollCheck);
	window.addEventListener("resize", resize);
}

function mouseMove(e) {
	let posx = (posy = 0);
	if (e.pageX || e.pageY) {
		posx = e.pageX;
		posy = e.pageY;
	} else if (e.clientX || e.clientY) {
		posx =
			e.clientX +
			document.body.scrollLeft +
			document.documentElement.scrollLeft;
		posy =
			e.clientY +
			document.body.scrollTop +
			document.documentElement.scrollTop;
	}
	target.x = posx;
	target.y = posy;
}

function scrollCheck() {
	if (document.body.scrollTop > height) animateHeader = false;
	else animateHeader = true;
}

function resize() {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
}

// animation
function initAnimation() {
	animate();
	for (let i in points) {
		shiftPoint(points[i]);
	}
}

function animate() {
	if (animateHeader) {
		ctx.clearRect(0, 0, width, height);
		for (let i in points) {
			// detect points in range
			if (Math.abs(getDistance(target, points[i])) < SHOW_RADIOUS*10000) {
				points[i].active = 0.3;
				points[i].circle.active = 0.6;
			} else if (Math.abs(getDistance(target, points[i])) < SHOW_RADIOUS*10000*2) {
				points[i].active = 0.1;
				points[i].circle.active = 0.3;
			} else if (Math.abs(getDistance(target, points[i])) < SHOW_RADIOUS*10000*3) {
				points[i].active = 0.02;
				points[i].circle.active = 0.1;
			} else {
				points[i].active = 0;
				points[i].circle.active = 0;
			}

			drawLines(points[i]);
			points[i].circle.draw();
		}
	}
	requestAnimationFrame(animate);
}

function shiftPoint(p) {
	TweenLite.to(p, 1 + 1 * Math.random(), {
		x: p.originX - 50 + Math.random() * 100,
		y: p.originY - 50 + Math.random() * 100,
		ease: Circ.easeInOut,
		onComplete: function () {
			shiftPoint(p);
		},
	});
}

// Canvas manipulation
function drawLines(p) {
	if (!p.active) return;
	for (let i in p.closest) {
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
		ctx.lineTo(p.closest[i].x, p.closest[i].y);
		ctx.strokeStyle = POINTS_COLOR_VARIABLE + p.active + ")";
		ctx.stroke();
	}
}

function Circle(pos, rad, color) {
	let _this = this;

	// constructor
	(function () {
		_this.pos = pos || null;
		_this.radius = rad || null;
		_this.color = color || null;
	})();

	this.draw = function () {
		if (!_this.active) return;
		ctx.beginPath();
		ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = POINTS_COLOR_VARIABLE + _this.active + ")";
		ctx.fill();
	};
}

// Util
function getDistance(p1, p2) {
	return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

resize();

setTimeout(() => {
	resize();
}, 1000);
