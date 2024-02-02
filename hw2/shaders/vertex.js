export default `#version 300 es
precision mediump float;

in vec2 vPosition;

uniform vec2 screenSize;
uniform vec2 pos;
uniform float r;
uniform float s;

mat2 rotate(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, s, -s, c);
}

void main() {
	vec2 p = vPosition * s;
	p *= rotate(-r);
	p += pos;
	p /= (screenSize / 2.0);
	gl_Position = vec4(p.xy, 0, 1);
}
`