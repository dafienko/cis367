import FullScreenQuad from './Quad';
import Shaders from './Shaders.js';

import FIELD_VERTEX_SOURCE from "./shaders/field/vertex.js";
import FIELD_FRAGMENT_SOURCE from "./shaders/field/fragment.js";

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

var initialized = false;
var vao, indexBuffer;
var program;
function initialize(gl) {
	program = Shaders.compileProgram(gl, FIELD_VERTEX_SOURCE, FIELD_FRAGMENT_SOURCE);
		
	indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(FULLSCREEN_QUAD.indices), gl.STATIC_DRAW);
	
	vao = gl.createVertexArray();
	gl.bindVertexArray(vao);
	
	const vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.positions), gl.STATIC_DRAW);
	
	const posLocation = gl.getAttribLocation(program, 'pos');
	gl.enableVertexAttribArray(posLocation);
	gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
	
	const uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.uvCoords), gl.STATIC_DRAW);
	
	const uvLocation = gl.getAttribLocation(program, 'uv_in');
	gl.enableVertexAttribArray(uvLocation);
	gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.bindVertexArray(null);

	initialized = true;
}

class Field {
	constructor(gl, fluidSimulator) {
		if (!initialized) {
			initialize(gl);
		}

		this.gl = gl;
		this.fluid = fluidSimulator;
	}

	render(canvas) {
		const gl = this.gl;

		const d = 1;
		const gridSize = [
			Math.round(this.fluid.w / d),
			Math.round(this.fluid.h / d),
		]

		gl.useProgram(program);
		gl.uniform2iv(gl.getUniformLocation(program, "gridSize"), gridSize);
		gl.uniform1f(gl.getUniformLocation(program, "aspect"), canvas.width / canvas.height);
		
		gl.uniform1i(gl.getUniformLocation(program, "vel"), 0);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.fluid.getVelocityTexture());

		gl.uniform1i(gl.getUniformLocation(program, "dens"), 1);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.fluid.getDensityTexture());

		gl.bindVertexArray(vao);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.drawElementsInstanced(gl.TRIANGLE_STRIP, FULLSCREEN_QUAD.indices.length, gl.UNSIGNED_SHORT, 0, gridSize[0] * gridSize[1]);

		gl.useProgram(null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		gl.bindVertexArray(null);
	}
}

export default Field;