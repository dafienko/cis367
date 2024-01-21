export default `
precision mediump float;

uniform sampler2D texture;

varying vec2 uvCoord;

void main() {
	gl_FragColor = vec4(texture2D(texture, uvCoord).xyz, 1.0);
	// gl_FragColor = vec4(uvCoord.xy, 0.0, 1.0);
}
`