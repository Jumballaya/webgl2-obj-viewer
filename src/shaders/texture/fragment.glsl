#version 300 es

precision mediump float;

out vec4 outColor;

in vec2 v_uv;
uniform sampler2D u_texture;

void main() {
  vec4 color = texture(u_texture, v_uv * 2.0 - 1.0);
  outColor = color;
}