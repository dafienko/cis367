export default `
uniform sampler2D dens;
uniform sampler2D dens_prev;
uniform sampler2D vel;
uniform sampler2D vel_prev;

uniform vec2 gridSize;

in vec2 uv;

vec2 getPos() {
	return uv * gridSize;
}

vec4 sampleGrid(in sampler2D tex, vec2 pos) {
	return texture(dens, pos / gridSize);
}
`;
