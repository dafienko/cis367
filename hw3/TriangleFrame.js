import Shaders from './Shaders.js';

import TRIANGLE_VERTEX_SOURCE from './shaders/vertex.js';
import TRIANGLE_FRAGMENT_SOURCE from './shaders/fragment.js';

class TriangleFrame {
	static _init(gl) {
		TriangleFrame.program = Shaders.compileProgram(gl, TRIANGLE_VERTEX_SOURCE, TRIANGLE_FRAGMENT_SOURCE);
		
		TriangleFrame._initialized = true;
	}

	constructor(gl) {
		if (!TriangleFrame._initialized) {
			TriangleFrame._init(gl);
		}

		this.gl = gl;
		this.color = [1, 1, 1];
		this.position = [0, 0];
		this.rotation = 0;
		this.scale = 1.0;
		this.vertices = [
			-1, -1,
			1, -1,
			0, 1,
		];

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		
		this.bufferID = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferID);
		
		const vPosition = gl.getAttribLocation(TriangleFrame.program, 'vPosition');
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);
		
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		this._bufferVertices();
	}

	_bufferVertices() {
		const gl = this.gl;

		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferID);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindVertexArray(null);
	}

	setVertices(vertices) {
		this.vertices = vertices;
		this._bufferVertices();
	}

	render(canvas) {
		const gl = this.gl;

		gl.useProgram(TriangleFrame.program);
		gl.bindVertexArray(this.vao);
		gl.uniform2f(gl.getUniformLocation(TriangleFrame.program, 'screenSize'), canvas.width, canvas.height);
		gl.uniform2fv(gl.getUniformLocation(TriangleFrame.program, 'pos'), this.position);
		gl.uniform3fv(gl.getUniformLocation(TriangleFrame.program, 'color'), this.color);
		gl.uniform1f(gl.getUniformLocation(TriangleFrame.program, 'r'), this.rotation * (Math.PI / 180.0));
		gl.uniform1f(gl.getUniformLocation(TriangleFrame.program, 's'), this.scale);
		gl.drawArrays(gl.LINE_LOOP, 0, 3);
		gl.bindVertexArray(null);
	}
}

export default TriangleFrame;