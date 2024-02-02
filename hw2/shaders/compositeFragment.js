export default `#version 300 es
precision mediump float;

in vec2 uv;

uniform sampler2D tex;
uniform sampler2D bloom;

out vec4 color;
 
void main() {
    color = vec4((texture(tex, uv) + texture(bloom, uv)).xyz, 1.0);
}
`;