// Damien Afienko

import createShaderProgram from "../libraries/Common/createShaderProgram.js";

import vertex_source from "./shaders/vertex.js";
import fragment_source from "./shaders/fragment.js";

const canvas = document.getElementById('gl-canvas');
const gl = WebGLUtils.setupWebGL(canvas);
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

const VERTICES = [
	vec2(-1, 1),
	vec2(0, -1),
	vec2(1, 1)
];

gl.clearColor(1.0, 1.0, 1.0, 1.0);

const program = createShaderProgram(gl, vertex_source, fragment_source);

const bufferID = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
gl.bufferData(gl.ARRAY_BUFFER, flatten(VERTICES), gl.STATIC_DRAW);

const vPosition = gl.getAttribLocation(program, 'vPosition');
gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vPosition);

gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);