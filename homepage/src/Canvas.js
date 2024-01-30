import React, { useEffect, useState } from 'react';

import './css/Canvas.css';

import FullScreenQuad from './Quad.js';
import GPUFluidSimulator from './GPUFluidSimulator.js';
import Field from './Field.js';

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const factor = .05;

var gpusim, field;
const render = (gl, canvas, dt) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	gpusim.update(dt * .7);

	gl.enable(gl.BLEND);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	
	field.render(canvas);
}

const init = (setCellData) => {
	const canvas = document.getElementById('mainCanvas');
	const gl = canvas.getContext("webgl2", {
		premultipliedAlpha: false,
	});

	if (!gl) { 
		throw new Error('WebGL unavailable'); 
	}
	
	gl.getExtension('EXT_color_buffer_float');
	gl.getExtension('WEBGL_color_buffer_float');
	
	FullScreenQuad.init(gl);

	gpusim = new GPUFluidSimulator(gl, Math.floor(window.innerWidth * factor), Math.floor(window.innerHeight * factor));
	field = new Field(gl, gpusim);
	
	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		gpusim.setSize(Math.floor(canvas.width * factor), Math.floor(canvas.height * factor));
	}
	window.onresize = onResize
	onResize()

	gl.clearColor(0, 0, 0, 1.0);

	let lastTime = 0.0;
	const frame = (t) => {
		const dt = Math.min(.008, Math.max(t - lastTime, .001));
		render(gl, canvas, dt);
		window.requestAnimationFrame(frame);
	}
	frame(0)

	const screenToGrid = (x, y) => {
		return [
			clamp(x, 0, canvas.width - 1),
			clamp(canvas.height - y, 0, canvas.height - 1)
		];
	}

	let last = [0, 0]
	document.addEventListener("mousemove", (e) => {
		const [x, y] = screenToGrid(e.x, e.y);
		gpusim.mousePos = [Math.floor(x * factor), Math.floor(y * factor)];
		
		const current = [e.x, e.y];
		let dp = [current[0] - last[0], current[1] - last[1]];
		last = current;
		const l = Math.sqrt(Math.pow(dp[0], 2) + Math.pow(dp[1], 2));
		const max = 200;
		if (l > 0) {
			const newLen = Math.min(max, l);
			dp = [(dp[0] / l) * newLen, (dp[1] / l) * newLen];
		} else {
			dp = [0, 0];
		}
		gpusim.mouseVel = [dp[0], -dp[1]];
	});

	document.addEventListener("mouseup", (e) => {
		gpusim.mouseDown = false;
	});

	document.addEventListener("mousedown", (e) => {
		gpusim.mouseDown = true;
	});

	document.addEventListener('contextmenu', event => event.preventDefault());
}

function Canvas() {
	const [cellData, setCellData] = useState([1, 2, 3])
	useEffect(() => {
		init(setCellData);
	}, []);

	return (<div>
		<canvas id="mainCanvas">
			HTML5 not enabled!
		</canvas>
	</div>);
}

export default Canvas;