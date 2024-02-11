import Shaders from './Shaders.js';

import TRIANGLE_VERTEX_SOURCE from './shaders/vertex.js';
import TRIANGLE_FRAGMENT_SOURCE from './shaders/fragment.js';

const mix = (a, b, alpha) => [a[0] * (1 - alpha) + b[0] * alpha, a[1] * (1 - alpha) + b[1] * alpha];

function generateSierpinski(n) {
	let points = [];
	function divideTriangle(a, b, c, count) {
		if (count === 0) {
			points.push(a[0], a[1], b[0], b[1], c[0], c[1]);
		} else {
			const ab = mix(a, b, 0.5);
			const ac = mix(a, c, 0.5);
			const bc = mix(b, c, 0.5);
			
			--count;

			divideTriangle(a, ab, ac, count);
			divideTriangle(c, ac, bc, count);
			divideTriangle(b, bc, ab, count);
		}
	}

	divideTriangle( 
		[-10, -10], 
		[10, -10],
		[0, 10], 
    	n
	);

	return points
}

class Sierpinski {
	static _init(gl) {
		Sierpinski.program = Shaders.compileProgram(gl, TRIANGLE_VERTEX_SOURCE, TRIANGLE_FRAGMENT_SOURCE);
		
		Sierpinski._initialized = true;
	}

	constructor(gl, n) {
		if (!Sierpinski._initialized) {
			Sierpinski._init(gl);
		}

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		
		this.vertices = generateSierpinski(n);

		const bufferID = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		
		const vPosition = gl.getAttribLocation(Sierpinski.program, 'vPosition');
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vPosition);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		this.gl = gl;
		this.position = [0, 0];
		this.rotation = 0;
		this.scale = 20.0;
		this.color = [1.0, 0.0, 0.0];
	}

	render(canvas) {
		const gl = this.gl;

		gl.useProgram(Sierpinski.program);
		gl.bindVertexArray(this.vao);
		gl.uniform2f(gl.getUniformLocation(Sierpinski.program, 'screenSize'), canvas.width, canvas.height);
		gl.uniform2fv(gl.getUniformLocation(Sierpinski.program, 'pos'), this.position);
		gl.uniform3fv(gl.getUniformLocation(Sierpinski.program, 'color'), this.color);
		gl.uniform1f(gl.getUniformLocation(Sierpinski.program, 'r'), this.rotation * (Math.PI / 180.0));
		gl.uniform1f(gl.getUniformLocation(Sierpinski.program, 's'), this.scale);
		gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 2);
		gl.bindVertexArray(null);
	}
}

export default Sierpinski;