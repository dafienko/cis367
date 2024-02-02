var indexBuffer;

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

class Quad {
	static _init(gl) {
		Quad.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Quad.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(FULLSCREEN_QUAD.indices), gl.STATIC_DRAW);
		
		Quad.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Quad.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.positions), gl.STATIC_DRAW);
		
		Quad.uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Quad.uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FULLSCREEN_QUAD.uvCoords), gl.STATIC_DRAW);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		Quad._initialized = true;
	}
	
	constructor(gl, program) {
		if (!Quad._initialized) {
			Quad._init(gl);
		}
		
		this.gl = gl;
		this.program = program;

		this.vao = gl.createVertexArray();
		gl.bindVertexArray(this.vao);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, Quad.vertexBuffer);
		const posLocation = gl.getAttribLocation(program, 'pos_in');
		gl.enableVertexAttribArray(posLocation);
		gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, Quad.uvBuffer);
		const uvLocation = gl.getAttribLocation(program, 'uv_in');
		gl.enableVertexAttribArray(uvLocation);
		gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	render() {
		const gl = this.gl;

		gl.useProgram(this.program);
		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Quad.indexBuffer);
		gl.drawElements(gl.TRIANGLE_STRIP, FULLSCREEN_QUAD.indices.length, gl.UNSIGNED_SHORT, 0);
		
		gl.bindVertexArray(null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
}

export default Quad;