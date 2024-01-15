#version 300 es

precision mediump float;


out vec4 outColor;
in vec3 v_position;

void main() {
  outColor = vec4(v_position, 1.0);
}