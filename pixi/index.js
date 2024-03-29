
const app = new PIXI.Application();
await app.init({ background: '#050505', resizeTo: document.body });
document.body.appendChild(app.canvas);

await PIXI.Assets.load('sample.png');
let sprite = PIXI.Sprite.from('sample.png');
app.stage.addChild(sprite);

var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }

const SPEED = 20;
app.ticker.add((ticker) => {
	let x_dir = (pressedKeys['d'] || pressedKeys['ArrowRight'] ? 1 : 0) - (pressedKeys['a'] || pressedKeys['ArrowLeft'] ? 1 : 0);
	let y_dir = (pressedKeys['s'] || pressedKeys['ArrowDown'] ? 1 : 0) - (pressedKeys['w'] || pressedKeys['ArrowUp'] ? 1 : 0);
	const mag = Math.sqrt(x_dir * x_dir + y_dir * y_dir);
	if (mag > 0) {
		const factor = ticker.deltaTime * SPEED / mag;
		sprite.x = Math.max(-sprite.width / 2, Math.min(window.innerWidth - sprite.width / 2, sprite.x + x_dir * factor));
		sprite.y = Math.max(-sprite.height / 2, Math.min(window.innerHeight - sprite.height / 2, sprite.y + y_dir * factor));
	}
});

