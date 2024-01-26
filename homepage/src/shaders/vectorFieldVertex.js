export default `
attribute vec2 test;
 
void main() {
	gl_Position = vec4(test.xy, 0.0, 1.0); 
}
`