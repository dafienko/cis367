import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform vec2 sourcePos;
uniform int addSource;
uniform int init;

out vec4 color;

void main() {
	ivec2 pos = getPos();

	if (init == 1) {
		color = vec4(0, 0, 0, 1.0);
	} else {
		color = sampleGrid(dens, pos);
	}

	if (addSource == 1) {
		vec2 p = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
		if (length(sourcePos - p) < 1.0) {
			color = vec4(10.0, 0.0, 0.0, 1.0);
		}
	}
}
`;