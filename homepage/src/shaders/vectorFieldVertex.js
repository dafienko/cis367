export default `#version 300 es

uniform vec2 vecSize;
uniform vec2 gridSize;
uniform vec2 bl;
uniform vec2 tr;

in vec2 pos;
in vec2 dir;

void main() {
	gl_PointSize = 2.0;

	vec2 root = pos / gridSize;
	root = root * (tr - bl) + bl;

	if (gl_VertexID % 2 == 0) {
		gl_Position = vec4(root.xy, 0.0, 1.0); 
	} else {
		vec2 displayDir = dir * min(1.0, length(dir));
		gl_Position = vec4(root.xy + displayDir * vecSize, 0.0, 1.0); 
	}
}
`