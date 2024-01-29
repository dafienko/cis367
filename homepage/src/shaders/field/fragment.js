export default `#version 300 es
precision mediump float;

uniform sampler2D dens;

in vec2 grid;
in vec2 uv;

out vec4 color; 
 
void main() {
	vec4 d = texture(dens, grid);
	color = vec4(d.xyz, length(d.xyz));
	// color = vec4(1, 0, 0, .2);
}
`;