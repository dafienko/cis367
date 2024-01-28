import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform sampler2D current;
uniform vec2 dt0;

out vec4 res;

void main() {
	vec2 pos = getPos();
	
	if (pos.x < 0.5 || pos.x > gridSize.x - .5 || pos.y < .5 || pos.y > gridSize.y - .5) {
		res = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		pos = pos - dt0 * vec2(sin(pos.x / 50.0), cos(pos.y / 50.0)) * .01; // sampleGrid(vel, pos);
		pos = vec2(clamp(pos.x, .5, gridSize.x - 0.5), clamp(pos.y, .5, gridSize.y - 0.5));
		vec2 posI = vec2(floor(pos.x), floor(pos.y));
		vec4 a = sampleGrid(current, posI + vec2(0, 0));
		vec4 b = sampleGrid(current, posI + vec2(1, 0));
		vec4 c = sampleGrid(current, posI + vec2(0, 1));
		vec4 d = sampleGrid(current, posI + vec2(1, 1));
		res = mix(mix(a, b, pos.x - posI.x), mix(c, d, pos.x - posI.x), pos.y - posI.y);
	}
}
`;