export default `#version 300 es
precision mediump float;

in vec3 vPosition;
out vec3 index;

uniform vec2 screenSize;
uniform vec2 pos;
uniform float r;
uniform float s;

uniform vec2 A;
uniform vec2 B;
uniform vec2 C;

mat2 rotate(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, s, -s, c);
}

void main() {
	index = vPosition;
	vec2 p = vPosition.x * A + vPosition.y * B + vPosition.z * C;
	p *= s;
	p *= rotate(-r);
	p += pos;
	p /= (screenSize / 2.0);
	gl_Position = vec4(p.xy, 0, 1);
}
`