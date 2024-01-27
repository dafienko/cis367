import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform vec2 sourcePos;
uniform int addSource;

out vec4 color;

void main() {
	vec2 pos = getPos();

	color = sampleGrid(dens, pos);

	if (addSource == 1) {
		if (length(sourcePos - pos) < 5.0) {
			color = vec4(1.0, 0.0, 0.0, 1.0);
		}
	}
}
`;