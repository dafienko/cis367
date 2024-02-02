export default `#version 300 es
precision mediump float;

uniform vec3 color;

out vec4 c;

void main() {
	c = vec4(color.xyz, 1.0);
}
`;