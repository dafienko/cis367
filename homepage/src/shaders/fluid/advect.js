import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform sampler2D current;
uniform vec2 dt0;

out vec4 res;

void main() {
	ivec2 pos = getPos();
	
	if (pos.x == 0 || pos.x == int(gridSize.x) - 1 || pos.y == 0 || pos.y == int(gridSize.y) - 1) {
		res = vec4(0.0, 0.0, 0.0, 1.0);
	} else {
		vec2 p = vec2(floor(gl_FragCoord.x), floor(gl_FragCoord.y));
		vec2 from = p - dt0 * sampleGrid(vel, pos).xy;
		// vec2 from = p - dt0 * vec2(1.0, 0.0);
		// from = vec2(clamp(from.x, .5, gridSize.x - 0.5), clamp(from.y, .5, gridSize.y - 0.5));
		
		ivec2 bl = ivec2(int(from.x), int(from.y));
		vec4 a = sampleGrid(current, bl + ivec2(0, 0));
		vec4 b = sampleGrid(current, bl + ivec2(1, 0));
		vec4 c = sampleGrid(current, bl + ivec2(0, 1));
		vec4 d = sampleGrid(current, bl + ivec2(1, 1));
		
		vec2 alpha = vec2(fract(from.x), fract(from.y));
		res = mix(mix(a, b, alpha.x), mix(c, d, alpha.x), alpha.y);
	}
}
`;