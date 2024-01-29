import React, { useEffect, useState } from 'react';

import './css/Canvas.css';

import FullScreenQuad from './Quad.js';
import GPUFluidSimulator from './GPUFluidSimulator.js';

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const dt = .01;
const factor = .3;

var gpusim;
const render = (gl) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	gpusim.update(dt);

	gl.viewport(0, 0, window.innerWidth, window.innerHeight);
	gpusim.render();
}

const init = (setCellData) => {
	const canvas = document.getElementById('mainCanvas');
	const gl = canvas.getContext("webgl2");
	if (!gl) { 
		throw new Error('WebGL unavailable'); 
	}
	gl.getExtension('EXT_color_buffer_float');
	gl.getExtension('WEBGL_color_buffer_float');
	
	FullScreenQuad.init(gl);

	gpusim = new GPUFluidSimulator(gl, Math.floor(window.innerWidth * factor), Math.floor(window.innerHeight * factor));
	
	const onResize = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		gl.viewport(0, 0, window.innerWidth, window.innerHeight);

		gpusim.setSize(Math.floor(canvas.width * factor), Math.floor(canvas.height * factor));
	}
	window.onresize = onResize
	onResize()

	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	const frame = () => {
		render(gl);
		window.requestAnimationFrame(frame);
	}
	frame()

	const screenToGrid = (x, y) => {
		return [
			clamp(x, 0, canvas.width - 1),
			clamp(canvas.height - y, 0, canvas.height - 1)
		];
	}

	document.addEventListener("mousemove", (e) => {
		const [x, y] = screenToGrid(e.x, e.y);
		gpusim.mousePos = [Math.floor(x * factor), Math.floor(y * factor)];
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