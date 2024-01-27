export default `#version 300 es

in vec2 pos;
in vec2 uv_in;

out vec2 uv; 
 
void main() {
	uv = uv_in;
	gl_Position = vec4(pos.xy, 0.0, 1.0); 
}
`