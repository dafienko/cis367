export default `
uniform sampler2D dens;
uniform sampler2D dens_prev;
uniform sampler2D vel;
uniform sampler2D vel_prev;

uniform vec2 gridSize;

in vec2 uv;

ivec2 getPos() {
	return ivec2(int(gl_FragCoord.x), int(gl_FragCoord.y));
}

bool onBoundary(ivec2 pos) {
	return pos.x == 0 || pos.x == int(gridSize.x) - 1 || pos.y == 0 || pos.y == int(gridSize.y) - 1;
}

vec4 sampleGrid(in sampler2D tex, ivec2 pos) {
	return texelFetch(tex, pos, 0);
}
`;