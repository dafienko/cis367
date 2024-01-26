import Shaders from './Shaders.js';

import VERTEX_SOURCE from "./shaders/vectorFieldVertex.js";
import FRAGMENT_SOURCE from "./shaders/vectorFieldFragment.js";

var vfProgram, vecSizeLoc, gridSizeLoc, blLoc, trLoc;

class VectorField {
	constructor(gl, w, h, bl, tr, vecSize, f) {
		this.gl = gl;
		this.bl = bl;
		this.tr = tr;
		this.vecSize = vecSize;
		this.f = f;

		this.setSize(w, h);
	}

	setSize(w, h) {
		const gl = this.gl;
		if (!vfProgram) {
			vfProgram = Shaders.compileProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
			vecSizeLoc = gl.getUniformLocation(vfProgram, "vecSize");
			gridSizeLoc = gl.getUniformLocation(vfProgram, "gridSize");
			blLoc = gl.getUniformLocation(vfProgram, "bl");
			trLoc = gl.getUniformLocation(vfProgram, "tr");
			gl.useProgram(null);
		}

		this.w = w;
		this.h = h;
		
		const positions = [];
		this.dirs = [];
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				const i = y * w + x;
				positions.push(x, y, x, y);
				this.dirs.push(0, 0, Math.sin(x / 10), Math.cos(x / 10));
			}
		}
		
		if (this.indexBuffer) {
			gl.deleteBuffer(this.indexBuffer);
			gl.deleteBuffer(this.positionBuffer);
			gl.deleteBuffer(this.dirBuffer);
			gl.deleteBuffer(this.typeBuffer);
			gl.deleteVertexArray(this.vao);
		}

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		const posLocation = gl.getAttribLocation(vfProgram, 'pos');
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(posLocation);

		this.dirBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.dirBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.dirs), gl.DYNAMIC_DRAW);

		const dirLocation = gl.getAttribLocation(vfProgram, 'dir');
		gl.vertexAttribPointer(dirLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(dirLocation);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindVertexArray(null);
	}

	render() {
		const gl = this.gl;

		for (let y = 0; y < this.h; y++) {
			for (let x = 0; x < this.w; x++) {
				const vel = this.f(x, y);
				const i = ((y * this.w + x) * 2 + 1) * 2;
				this.dirs[i] = vel[0];
				this.dirs[i + 1] = vel[1];
			}
		}

		gl.useProgram(vfProgram);
		gl.uniform2fv(vecSizeLoc, this.vecSize)
		gl.uniform2f(gridSizeLoc, this.w - 1, this.h - 1);
		gl.uniform2fv(blLoc, this.bl);
		gl.uniform2fv(trLoc, this.tr);

		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.dirBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.dirs), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.drawArrays(gl.LINES, 0, this.w * this.h * 2);

		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindVertexArray(null);
	}
}

export default VectorField;