export default `#version 300 es
precision mediump float;

uniform vec3 color;

in vec3 index;
out vec4 c;

float enhance(float x) {
	return 1.0 - pow(1.0 - x, 3.0);
}

void main() {
	// c = vec4(color.xyz, 1.0);
	c = vec4(enhance(index.x), enhance(index.y), enhance(index.z), 1.0);
}
`;