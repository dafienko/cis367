import INCLUDE from './include.js';

export default `#version 300 es
precision highp float;

${INCLUDE}

uniform sampler2D inputTexture;

uniform float h;
uniform int pass;

out vec4 res;

void main() {
	ivec2 pos = getPos();
	
	switch(pass) {
	case 0: 
		if (onBoundary(pos)) {
			res = vec4(0, 0, 0, 0);
		} else {
			vec4 up = sampleGrid(vel, pos + ivec2(0, 1));
			vec4 down = sampleGrid(vel, pos + ivec2(0, -1));
			vec4 left = sampleGrid(vel, pos + ivec2(-1, 0));
			vec4 right = sampleGrid(vel, pos + ivec2(1, 0));
			res = vec4(-.5 * h * (right.x - left.x + up.y - down.y), 0, 0, 1);
		}
		
		break;

	case 1:
		if (onBoundary(pos)) {
			res = vec4(0, 0, 0, 0);
		} else {
			vec4 up = sampleGrid(inputTexture, pos + ivec2(0, 1));
			vec4 down = sampleGrid(inputTexture, pos + ivec2(0, -1));
			vec4 left = sampleGrid(inputTexture, pos + ivec2(-1, 0));
			vec4 right = sampleGrid(inputTexture, pos + ivec2(1, 0));
			vec4 current = sampleGrid(inputTexture, pos);
			res = vec4(current.x, (current.x + up.y + down.y + left.y + right.y) / 4.0, 0, 1);
		}

		break;

	case 2: 
		if (onBoundary(pos)) {
			res = vec4(0, 0, 0, 0);
		} else {
			vec4 up = sampleGrid(inputTexture, pos + ivec2(0, 1));
			vec4 down = sampleGrid(inputTexture, pos + ivec2(0, -1));
			vec4 left = sampleGrid(inputTexture, pos + ivec2(-1, 0));
			vec4 right = sampleGrid(inputTexture, pos + ivec2(1, 0));
			res = sampleGrid(vel, pos) - 0.5 * vec4(right.y - left.y, up.y - down.y, 0, 0) / h;
			// res = vec4(1, 1, 0, 1);
		}

		break;
	}
}
`;