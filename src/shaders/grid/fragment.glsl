#version 300 es

precision mediump float;

out vec4 outColor;

in vec2 v_uv;

uniform vec2 u_resolution;
uniform bool u_dark_mode;

float inverseLerp(float v, float minV, float maxV) {
  return (v - minV) / (maxV - minV);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

vec3 draw_grid(vec3 color, vec3 line_color, float cell_spacing, float line_width) {
  vec2 center = v_uv - 0.5;
  vec2 cells = abs(fract(center * u_resolution / cell_spacing) - 0.5);
  float d = (0.5 - max(cells.x, cells.y)) * cell_spacing;
  float lines = step(0.5, smoothstep(0.0, line_width, d));
  color = mix(line_color, color, lines);

  return color;
}

void main() {
  vec2 pixelCoords = (v_uv - 0.5) * u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec3 color = vec3(1.0, 1.0, 1.0);
  color = draw_grid(color, vec3(0.44, 0.44, 0.44), aspect, 0.025);
  color = draw_grid(color, vec3(0.22, 0.22, 0.22), aspect * 5.0, 0.05);
  float alpha = step(color.r, 0.88);
  outColor = vec4(float(u_dark_mode) - color, alpha);
}