import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform sampler2D current;
uniform sampler2D prev;
uniform float a;

out vec4 res;

void main() {
	vec2 pos = getPos();
	
	if (pos.x < 0.5 || pos.x > gridSize.x - .5 || pos.y < .5 || pos.y > gridSize.y - .5) {
		res = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		vec4 up = sampleGrid(current, pos + vec2(0, 1));
		vec4 down = sampleGrid(current, pos + vec2(0, -1));
		vec4 left = sampleGrid(current, pos + vec2(1, 0));
		vec4 right = sampleGrid(current, pos + vec2(-1, 0));
		res = (sampleGrid(prev, pos) + a * (up + down + left + right)) / (1.0 + 4.0 * a);
	}
}
`;