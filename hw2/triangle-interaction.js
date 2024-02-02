// Damien Afienko

import Shaders from './Shaders.js';

import Triangle from './Triangle.js';
import Quad from './Quad.js';

import BLUR_VERTEX_SOURCE from './shaders/blurVertex.js';
import BLUR_FRAGMENT_SOURCE from './shaders/blurFragment.js';
import COMPOSITE_VERTEX_SOURCE from './shaders/compositeVertex.js';
import COMPOSITE_FRAGMENT_SOURCE from './shaders/compositeFragment.js';

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext("webgl2");

if (!gl) { 
	throw new Error('WebGL unavailable'); 
}

let blurProgram = Shaders.compileProgram(gl, BLUR_VERTEX_SOURCE, BLUR_FRAGMENT_SOURCE);
let blurQuad = new Quad(gl, blurProgram);

let compositeProgram = Shaders.compileProgram(gl, COMPOSITE_VERTEX_SOURCE, COMPOSITE_FRAGMENT_SOURCE);
let compositeQuad = new Quad(gl, compositeProgram);

function createTextureFramebuffer(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	const fb = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	return [texture, fb];
}

let fbos = [
	createTextureFramebuffer(gl),
	createTextureFramebuffer(gl),
	createTextureFramebuffer(gl),
];

const onResize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, window.innerWidth, window.innerHeight);

	for (let pair of fbos) {
		gl.bindTexture(gl.TEXTURE_2D, pair[0]);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			canvas.width, canvas.height, 0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}
window.onresize = onResize
onResize()

const screenToGrid = (x, y) => [x - canvas.width / 2, (canvas.height - y) - (canvas.height / 2)];

let keys = {
	'ArrowUp': false,
	'ArrowDown': false,
	'ArrowRight': false,
	'ArrowLeft': false,

	'w': false,
	'a': false,
	's': false,
	'd': false,
};

document.addEventListener('keydown', e => {
	if (e.key in keys) {
		keys[e.key] = true;
	}
});

document.addEventListener('keyup', e => {
	if (e.key in keys) {
		keys[e.key] = false;
	}
});

document.addEventListener('mousemove', (e) => {
	c.position = screenToGrid(e.x, e.y);
})


let a = new Triangle(gl, [0, 0, 1]);
a.position = [-100, 0];
a.rotation = -90;

let b = new Triangle(gl, [1, 0, 0]);
b.position = [100, 0];
b.rotation = 90;

let c = new Triangle(gl, [0, 1, 0]);

const update = (dt) => {
	const throttleA = (keys['w'] * 1.0) - (keys['s'] * 1.0);
	const steerA = (keys['a'] * 1.0) - (keys['d'] * 1.0);
	a.update(throttleA, steerA, dt);
	
	const throttleB = (keys['ArrowUp'] * 1.0) - (keys['ArrowDown'] * 1.0);
	const steerB = (keys['ArrowLeft'] * 1.0) - (keys['ArrowRight'] * 1.0);
	b.update(throttleB, steerB, dt);
}

let lastTime = 0;
const render = (t) => {
	update((t - lastTime) / 1000);
	lastTime = t;
	
	// render scene to fbo 0
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[0][1]);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	for (let t of [a, b, c]) {
		t.render(canvas);
	}

	// horizontal gaussian blur to fbo 1
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[1][1]);
	gl.useProgram(blurProgram);
	gl.uniform1i(gl.getUniformLocation(blurProgram, "tex"), 0);
	gl.uniform2f(gl.getUniformLocation(blurProgram, "size"), canvas.width, canvas.height);
	gl.uniform2f(gl.getUniformLocation(blurProgram, "dir"), 3, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbos[0][0]);
	blurQuad.render();

	// vertical gaussian blur texture in fbo 1 to fbox 2
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[2][1]);
	gl.useProgram(blurProgram);
	gl.uniform2f(gl.getUniformLocation(blurProgram, "dir"), 0, 3);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbos[1][0]);
	blurQuad.render();

	// composite blurred scene with scene (bloom with no minimum threshold)
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.clearColor(.1, .1, .1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.useProgram(compositeProgram);
	gl.uniform1i(gl.getUniformLocation(compositeProgram, "tex"), 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbos[0][0]);
	gl.uniform1i(gl.getUniformLocation(compositeProgram, "bloom"), 1);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, fbos[2][0]);
	compositeQuad.render();

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);