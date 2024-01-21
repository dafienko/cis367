import React, { useEffect, useState } from 'react';

import './Canvas.css';

import VERTEX_SOURCE from "./shaders/vertex.js";
import FRAGMENT_SOURCE from "./shaders/fragment.js";

function compileShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}

	return shader;
}

function compileShaderProgram(gl, vertexSource, fragmentSource) {
	const vertex = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragment = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program));
    }

    return program;
}

const FULLSCREEN_QUAD = {
	positions: [
		-1.0, 1.0, // top-left
		-1.0, -1.0, // bottom-left
		1.0, -1.0, // bottom-right
		1.0, 1.0, // top-right
	],

	uvCoords: [
		0.0, 1.0,
		0.0, 0.0,
		1.0, 0.0,
		1.0, 1.0,
	],

	indices: [
		1, 2, 0, 3
	],
}

var program, vertexBuffer, indexBuffer, samplerLoc;

function initFullScreenQuad(gl) {
	program = compileShaderProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
	gl.useProgram(program);
	samplerLoc = gl.getUniformLocation(program, "texture");

	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(FULLSCREEN_QUAD.indices), gl.STATIC_DRAW);

	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.positions), gl.STATIC_DRAW);

	const posLocation = gl.getAttribLocation(program, 'pos');
	gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(posLocation);

	const uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.uvCoords), gl.STATIC_DRAW);

	const uvLocation = gl.getAttribLocation(program, 'uv');
	gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(uvLocation);
}

function renderFullScreenQuad(gl) {
	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.uniform1i(samplerLoc, 0);
	gl.drawElements(gl.TRIANGLE_STRIP, FULLSCREEN_QUAD.indices.length, gl.UNSIGNED_SHORT,0);
}

const N = 50

const IX = (x, y) => x + (N + 2) * y;

function setBound(type, d) {
	for (let i = 1; i <= N; i++) {
		d[IX(0, i)] = d[IX(1, i)] * (type == 1 ? -1 : 1);
		d[IX(N+1, i)] = d[IX(N, i)] * (type == 1 ? -1 : 1);
		d[IX(i, 0)] = d[IX(i, 1)] * (type == 2 ? -1 : 1);
		d[IX(i, N+1)] = d[IX(i, N)] * (type == 2 ? -1 : 1);
	}

	d[IX(0, 0)] = (d[IX(1, 0)] + d[IX(0, 1)]) / 2;
	d[IX(N+1, 0)] = (d[IX(N, 0)] + d[IX(N+1, 1)]) / 2;
	d[IX(0, N+1)] = (d[IX(1, N+1)] + d[IX(0, N)]) / 2;
	d[IX(N+1, N+1)] = (d[IX(N+1, N)] + d[IX(N, N+1)]) / 2;
}

function diffuse(dt, type, diff, next, initial) {
	const a = dt * diff * N * N;
	for (let k = 0; k < 20; k++) {
		for (let x = 1; x <= N; x++) {
			for (let y = 1; y <= N; y++) {
				const up = next[IX(x, y + 1)];
				const down = next[IX(x, y - 1)];
				const left = next[IX(x - 1, y)];
				const right = next[IX(x + 1, y)];
				const init = initial[IX(x, y)];
				next[IX(x, y)] = (init + a * (up + down + left + right)) / (1 + 4 * a);
			}
		}
	}
	setBound(type, next)
}

function advect(dt, type, next, initial, u, v) {
	for (let x = 1; x <= N; x++) {
		for (let y = 1; y <= N; y++) {
			const vel = [u[IX(x, y)], v[IX(x, y)]];
			const p0 = [x - vel[0] * dt, y - vel[1] * dt];
			const i = Math.floor(p0[0]), j = Math.floor(p0[1]);
			const w = p0[0] - i, z = p0[1] - j
			const a = initial[IX(i, j)];
			const b = initial[IX(i + 1, j)];
			const c = initial[IX(i, j + 1)];
			const d = initial[IX(i + 1, j + 1)];
			next[IX(x, y)] = (1 - z)*((1 - w)*a + w*b) + z*((1 - w)*c + w*d);
		}
	}
	setBound(type, next)
}

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

class FluidSimulator {
	constructor(gl) {
		this.gl = gl;
		this.count = 0

		const size = Math.pow(N + 2, 2);
		this.dens = new Array(size);
		this.prevDens = new Array(size);
		
		this.u = new Array(size);
		this.prevu = new Array(size);
		
		this.v = new Array(size);
		this.prevv = new Array(size);

		this.colors = new Array(size);
		
		for (let i = 0; i < size; i++) {
			this.dens[i] = 0;
			this.prevDens[i] = 0;

			this.u[i] = 0;
			this.prevu[i] = 0;

			this.v[i] = 0;
			this.prevv[i] = 0;

			this.colors[i] = [0, 0, 0];
		}
		
		this.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			N+2, N+2, 0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			null
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	updateDensity(dt) {
		if (this.count < 20) {
			const m = Math.round(N / 2);
			this.dens[IX(m, m)] = 1;
		}
		
		[this.dens, this.prevDens] = [this.prevDens, this.dens];
		diffuse(dt, 0, .05, this.dens, this.prevDens); 
		[this.dens, this.prevDens] = [this.prevDens, this.dens];
		advect(dt, 0, this.dens, this.prevDens, this.u, this.v);
	}

	updateVelocity(dt) {
		if (this.count < 20) {
			const m = Math.round(N / 2);
			for (let i = -5; i < 10; i++) {
				this.v[IX(m-1, m+i)] = 105.0;
				this.v[IX(m, m+i)] = 105.0;
				this.v[IX(m+1, m+i)] = 105.0;
			}
		}

		[this.u, this.prevu] = [this.prevu, this.u];
		[this.v, this.prevv] = [this.prevv, this.v];
		
		diffuse(dt, 1, .05, this.u, this.prevu); 
		diffuse(dt, 2, .05, this.v, this.prevv); 

		[this.u, this.prevu] = [this.prevu, this.u];
		[this.v, this.prevv] = [this.prevv, this.v];

		advect(dt, 1, this.u, this.prevu, this.prevu, this.prevv)
		advect(dt, 2, this.v, this.prevv, this.prevu, this.prevv)
	}

	getCellData(x, y) {
		return [
			x, y,
			this.prevDens[IX(x, y)].toFixed(2),
			this.dens[IX(x, y)].toFixed(2),
			this.u[IX(x, y)].toFixed(2),
			this.v[IX(x, y)].toFixed(2),
		]
	}

	update(dt) {
		this.updateDensity(dt);
		this.updateVelocity(dt);
		this.count += 1
	}

	render() {
		const gl = this.gl;

		let image = new Uint8Array(this.colors.flatMap((_, i) => {
			const normalize = (x) => Math.round(clamp(x, 0, 255));
			const dens = normalize(this.dens[i] * 1000);
			const u = normalize(Math.abs(this.u[i] * 5));
			const v = normalize(Math.abs(this.v[i] * 5));
			return [u, v, dens, 255]
		}));

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			N+2, N+2, 0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			image
		);

		renderFullScreenQuad(gl)
	}
}

var simulation;

const render = (gl) => {
	gl.clear(gl.COLOR_BUFFER_BIT);

	simulation.update(.02);
	simulation.render();
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

	initFullScreenQuad(gl);

	simulation = new FluidSimulator(gl);

	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	const frame = () => {
		render(gl);
		window.requestAnimationFrame(frame);
	}
	frame()

	document.addEventListener("mousemove", (e) => {
		const x = clamp(Math.floor(e.x / (canvas.width / (N + 2))), 0, N+1);
		const y = clamp(Math.floor((canvas.height - e.y) / (canvas.height / (N + 2))), 0, N+1);
		setCellData(simulation.getCellData(x, y));
	  });

	document.getElementById("updateButton").onclick = () => {
		simulation.update();
	};
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
