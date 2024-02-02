import Shaders from './Shaders.js';

import TRIANGLE_VERTEX_SOURCE from './shaders/vertex.js';
import TRIANGLE_FRAGMENT_SOURCE from './shaders/fragment.js';

class Triangle {
	static _init(gl) {
		Triangle.program = Shaders.compileProgram(gl, TRIANGLE_VERTEX_SOURCE, TRIANGLE_FRAGMENT_SOURCE);

		const VERTICES = [
			-1, -1,
			0, 1,
			1, -1,
		];

		Triangle.vao = gl.createVertexArray();
		gl.bindVertexArray(Triangle.vao);
		
		const bufferID = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);
		
		const vPosition = gl.getAttribLocation(Triangle.program, 'vPosition');
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		
		Triangle._initialized = true;
	}

	constructor(gl, color) {
		if (!Triangle._initialized) {
			Triangle._init(gl);
		}

		this.gl = gl;
		this.color = color;
		this.position = [0, 0];
		this.rotation = 0;
		this.scale = 20.0;
	}

	update(throttle, steer, dt) {
		const r = (this.rotation + 90) * (Math.PI / 180);
		const look = [Math.cos(r), Math.sin(r)];
		const vel = dt * throttle * 200;
		this.position = [this.position[0] + look[0] * vel, this.position[1] + look[1] * vel];
		this.rotation += steer * 180 * dt;
	}

	render(canvas) {
		const gl = this.gl;

		gl.useProgram(Triangle.program);
		gl.bindVertexArray(Triangle.vao);
		gl.uniform2f(gl.getUniformLocation(Triangle.program, 'screenSize'), canvas.width, canvas.height);
		gl.uniform2fv(gl.getUniformLocation(Triangle.program, 'pos'), this.position);
		gl.uniform3fv(gl.getUniformLocation(Triangle.program, 'color'), this.color);
		gl.uniform1f(gl.getUniformLocation(Triangle.program, 'r'), this.rotation * (Math.PI / 180.0));
		gl.uniform1f(gl.getUniformLocation(Triangle.program, 's'), this.scale);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	}
}

export default Triangle;