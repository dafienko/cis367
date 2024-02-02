export default `#version 300 es
precision mediump float;

in vec2 pos_in;
in vec2 uv_in;

out vec2 uv;

void main() {
	uv = uv_in;

	gl_Position = vec4(pos_in.xy, 0.0, 1.0);
}
`;