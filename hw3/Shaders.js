export default {
	compileShader: function(gl, source, type) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(source);
			throw new Error(gl.getShaderInfoLog(shader));
		}
	
		return shader;
	},

	compileProgram: function(gl, vertexSource, fragmentSource) {
		const vertex = this.compileShader(gl, vertexSource, gl.VERTEX_SHADER);
		const fragment = this.compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
	
		const program = gl.createProgram();
		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);
		
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(gl.getProgramInfoLog(program));
		}
	
		return program;
	},
}