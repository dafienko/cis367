import React, { useEffect, useState } from 'react';

import './Canvas.css';

import FluidSimulator from './FluidSimulator';
import VectorField from './VectorField';
import FullScreenQuad from './Quad';

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

var simulation, vectorField;
const render = (gl) => {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);

	simulation.update(.1);
	simulation.render();
	// vectorField.render();
}

const init = (setCellData) => {
	const canvas = document.getElementById('mainCanvas');
	const gl = canvas.getContext("webgl");
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

	FullScreenQuad.init(gl);

	simulation = new FluidSimulator(gl);
	vectorField = new VectorField(gl, simulation.N, simulation.N);

	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	const frame = () => {
		render(gl);
		window.requestAnimationFrame(frame);
	}
	frame()

	const screenToGrid = (x, y) => {
		return [
			clamp(Math.floor(x / (canvas.width / (simulation.N + 2))), 0, simulation.N+1),
			clamp(Math.floor((canvas.height - y) / (canvas.height / (simulation.N + 2))), 0, simulation.N+1)
		];
	}

	document.addEventListener("mousemove", (e) => {
		const [x, y] = screenToGrid(e.x, e.y);
		simulation.paintAt = [x, y];
		setCellData(simulation.getCellData(x, y));
	});

	document.addEventListener("mouseup", (e) => {
		simulation.painting = false;
	});

	document.addEventListener("mousedown", (e) => {
		simulation.paintAt = screenToGrid(e.x, e.y);
		simulation.painting = true;
	});

	document.getElementById("updateButton").onclick = () => {
		simulation.update(.02);
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
