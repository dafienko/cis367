export default `#version 300 es

in vec2 pos;
in vec2 uv_in;

out vec2 uv; 
out vec2 grid;

uniform sampler2D vel;
uniform ivec2 gridSize;
uniform float aspect;

mat2 rotate(float a) {
	float s = sin(a);
	float c = cos(a);
	return mat2(c, s, -s, c);
}

void main() {
	uv = uv_in;
	
	ivec2 gridPos = ivec2(gl_InstanceID % gridSize.x, gl_InstanceID / gridSize.x);
	grid = vec2(float(gridPos.x) / float(gridSize.x - 1), float(gridPos.y) / float(gridSize.y - 1));
	
	vec2 dir = texture(vel, grid).xy;
	float angle = atan(dir.y / dir.x);
	if (dir.x < 0.0) {
		angle += 3.1415;
	}
	mat2 r = rotate(-angle);
	
	vec2 outPos = pos;
	if (gl_VertexID == 2 || gl_VertexID == 3) {
		outPos += vec2(length(dir) * 50.0, 0);
	}
	outPos = (outPos * r) * vec2(1.0, aspect) * 0.004;
	
	vec2 nPos = grid * 2.0 - vec2(1.0, 1.0);
	gl_Position = vec4(nPos + outPos.xy, 0.0, 1.0); 
}
`;