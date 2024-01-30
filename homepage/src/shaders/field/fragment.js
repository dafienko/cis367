export default `#version 300 es
precision mediump float;

uniform sampler2D dens;

in vec2 grid;
in vec2 uv;
in vec4 c;

out vec4 color; 
 
void main() {
	color = c;
}
`;