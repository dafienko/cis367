export default `#version 300 es
precision mediump float;

in vec2 uv;

uniform sampler2D tex;
uniform vec2 size;
uniform vec2 dir;

out vec4 color;

float weight[10] = float[](
	0.19741257145444083,
	0.17466647146354097,
	0.12097746070390959,
	0.06559073722230267,
	0.027834685329492057,
	0.009244616587506386,
	0.0024027325605485827,
	0.0004886419989245074,
	0.0000777489201475167,
	0.000009677359081674635
);
 
void main() {
    color = texture(tex, uv) * weight[0];
    for (int i = 1; i < 10; i++) {
		float j = float(i);
        color += texture(tex, uv + (j * dir) / size) * weight[i];
		color += texture(tex, uv - (j * dir) / size) * weight[i];
    }
}
`;