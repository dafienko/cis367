import INCLUDE from './include.js';
import PERLIN from './perlin.js';

export default `#version 300 es
precision highp float;

${INCLUDE}
${PERLIN}

uniform sampler2D target;
uniform vec2 sourcePos;
uniform vec4 sourceValue;
uniform int addSource;
uniform float r;
uniform int mode;
uniform int init;
uniform float t;

out vec4 color;

void main() {
	ivec2 pos = getPos(); 
	if (init == 1) {
		color = vec4(0, 0, 0, 1.0);
	} else {
		color = sampleGrid(target, pos);
	}

	if (borderDist(pos) <= 4) {
		vec3 sampleAt = vec3((vec2(float(pos.x), float(pos.y)) / 18.0).xy, t);

		if (mode == 0) {
			vec2 dir = vec2(cnoise(sampleAt), cnoise(sampleAt + vec3(0, 0, 5.0)));
			float len = 2.0 + abs(cnoise(sampleAt + vec3(0, 0, 15.0))) * 1.0;
			color = vec4((dir * len).xy, 0, 1);
		} else {
			float h = (3.0 + 2.0 * cnoise(sampleAt)) / 6.0;
			color = vec4(hsv2rgb(vec3(h, 1.0, 1.0)).xyz, 1.0);
		}
	}

	if (addSource == 1) {
		vec2 p = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
		if (length(sourcePos - p) < r) {
			color = sourceValue;
		}
	}
}
`;