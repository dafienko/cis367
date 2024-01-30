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

// https://gist.github.com/983/e170a24ae8eba2cd174f
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

int borderDist(ivec2 pos) {
	return min(min(pos.x, pos.y), min((int(gridSize.x) - 1) - pos.x, (int(gridSize.y) - 1) - pos.y));
}

bool onBoundary(ivec2 pos) {
	return borderDist(pos) == 0;
}

vec4 sampleGrid(in sampler2D tex, ivec2 pos) {
	return texelFetch(tex, pos, 0);
}
`;