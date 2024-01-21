export default `
attribute vec2 pos;
attribute vec2 uv;

varying vec2 uvCoord; 
 
void main() {
	uvCoord = uv;
	gl_Position = vec4(pos.xy, 0.0, 1.0); 
}
`