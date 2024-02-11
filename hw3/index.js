// Damien Afienko

import Sierpinski from './Sierpinski.js';
import TriangleFrame from './TriangleFrame.js';

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext("webgl2");

if (!gl) { 
	throw new Error('WebGL unavailable'); 
}

const onResize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}
window.onresize = onResize
onResize()

// const screenToGrid = (x, y) => [x - canvas.width / 2, (canvas.height - y) - (canvas.height / 2)];

const anchors = Array.prototype.slice.call(document.getElementsByClassName("anchor-point"), 0);
for (const anchor of anchors) {
	let last = [0, 0];
	anchor.onmousedown = (e) => {
		e.preventDefault();
		
		last = [e.clientX, e.clientY];
		
		document.onmouseup = (_) => {
			document.onmouseup = null;
			document.onmousemove = null;
		};

		document.onmousemove = (e) => {
			e.preventDefault();
		
			let delta = [e.clientX - last[0], e.clientY - last[1]]
			last = [e.clientX, e.clientY];
			
			anchor.style.left = (anchor.offsetLeft + delta[0]) + "px";
			anchor.style.top = (anchor.offsetTop + delta[1]) + "px";
		};
	};
}

function getAnchorPosition(anchor) {
	const rect = anchor.getBoundingClientRect();
	const p = [(rect.right + rect.left) / 2, (rect.top + rect.bottom) / 2];
	return [p[0] - canvas.width / 2, canvas.height / 2 - p[1]];
}

// const s = new Sierpinski(gl, 8);
const tf = new TriangleFrame(gl);

let lastTime = 0;
const render = (t) => {
	lastTime = t;

	tf.setVertices(anchors.flatMap(getAnchorPosition));
	
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// s.render(canvas);
	tf.render(canvas);
	
	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);