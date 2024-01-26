import Shaders from './Shaders.js';

import VERTEX_SOURCE from "./shaders/vertex.js";
import FRAGMENT_SOURCE from "./shaders/fragment.js";

var quadProgram, vertexBuffer, indexBuffer, samplerLoc;

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
		1, 2, 0, 3,
	],
}

export default {
	init: function(gl) {
		quadProgram = Shaders.compileProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
		gl.useProgram(quadProgram);
		samplerLoc = gl.getUniformLocation(quadProgram, "texture");
	
		indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(FULLSCREEN_QUAD.indices), gl.STATIC_DRAW);
	
		vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.positions), gl.STATIC_DRAW);
	
		const posLocation = gl.getAttribLocation(quadProgram, 'pos');
		gl.enableVertexAttribArray(posLocation);
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
	
		const uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.uvCoords), gl.STATIC_DRAW);
	
		const uvLocation = gl.getAttribLocation(quadProgram, 'uv');
		gl.enableVertexAttribArray(uvLocation);
		gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	},

	render: function(gl) {
		console.log('render')
		gl.useProgram(quadProgram);
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.uniform1i(samplerLoc, 0);
		gl.drawElements(gl.TRIANGLE_STRIP, FULLSCREEN_QUAD.indices.length, gl.UNSIGNED_SHORT,0);
	}
}