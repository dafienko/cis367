import React, { useEffect, useState } from 'react';

import './Canvas.css';

import FluidSimulator from './FluidSimulator.js';
import VectorField from './VectorField.js';
import FullScreenQuad from './Quad.js';
import GPUFluidSimulator from './GPUFluidSimulator.js';

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const dt = .02;

const factor = .5;

var simulation, vectorField;
var gpusim;
const render = (gl) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	// simulation.update(dt);
	// simulation.render();
	// vectorField.render();

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
	simulation = new FluidSimulator(gl);
	
	const cellSize = [2.0 / (simulation.N + 2), 2.0 / (simulation.N + 2)];
	vectorField = new VectorField(
		gl, 
		simulation.N, simulation.N,
		new Float32Array([-1 + cellSize[0] * 1.5, -1 + cellSize[1] * 1.5]), 
		new Float32Array([1 - cellSize[0] * 1.5, 1 - cellSize[1] * 1.5]),
		new Float32Array([cellSize[0] * .7, cellSize[1] * .7]),
		(x, y) => simulation.getVelocity(x + 1, y + 1)
	);
	
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

	// const screenToGrid = (x, y) => {
	// 	return [
	// 		clamp(Math.floor(x / (canvas.width / (simulation.N + 2))), 0, simulation.N+1),
	// 		clamp(Math.floor((canvas.height - y) / (canvas.height / (simulation.N + 2))), 0, simulation.N+1)
	// 	];
	// }

	const screenToGrid = (x, y) => {
		return [
			clamp(x, 0, canvas.width - 1),
			clamp(canvas.height - y, 0, canvas.height - 1)
		];
	}

	document.addEventListener("mousemove", (e) => {
		const [x, y] = screenToGrid(e.x, e.y);
		// simulation.paintAt = [x, y];
		gpusim.mousePos = [Math.floor(x * factor), Math.floor(y * factor)];
		// setCellData(simulation.getCellData(x, y));
	});

	document.addEventListener("mouseup", (e) => {
		// simulation.painting = false;
		gpusim.mouseDown = false;
	});

	document.addEventListener("mousedown", (e) => {
		// simulation.paintAt = screenToGrid(e.x, e.y);
		// simulation.painting = true;
		gpusim.mouseDown = true;
	});

	document.getElementById("updateButton").onclick = () => {
		// simulation.update(dt);
		gpusim.update(dt);
	};

	document.addEventListener('contextmenu', event => event.preventDefault());
}

function Canvas() {
	const [cellData, setCellData] = useState([1, 2, 3])
	useEffect(() => {
		init(setCellData);
	}, []);

	return (<div>
		<button id="updateButton">  Update</button>
		<p id="info">{cellData.join(", ")}</p>
		<canvas id="mainCanvas">
			HTML5 not enabled!
		</canvas>
	</div>);
}

export default Canvas;