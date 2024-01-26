import Shaders from './Shaders.js';

import VERTEX_SOURCE from "./shaders/vectorFieldVertex.js";
import FRAGMENT_SOURCE from "./shaders/vectorFieldFragment.js";

var vfProgram;

class VectorField {
	constructor(gl, w, h) {
		this.gl = gl;
		this.setSize(w, h);
	}

	setSize(w, h) {
		const gl = this.gl;
		
		if (!vfProgram) {
			vfProgram = Shaders.compileProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
		}

		gl.useProgram(vfProgram);

		const positions = [];
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				positions.push(1.0, 1.0);
			}
		}

		if (this.positionBuffer) {
			gl.deleteBuffer(this.positionBuffer);
		}
		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW);

		const posLocation = gl.getAttribLocation(vfProgram, 'pos');
		gl.enableVertexAttribArray(posLocation);
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	setBounds(tl, br) {

	}

	render() {
		console.log('vf')
		const gl = this.gl;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.useProgram(vfProgram);
		gl.drawArrays(gl.POINTS, 0, this.w * this.h);
	}
}

export default VectorField;