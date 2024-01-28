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

vec4 sampleGrid(in sampler2D tex, ivec2 pos) {
	return texelFetch(tex, pos, 0);
}
`;
