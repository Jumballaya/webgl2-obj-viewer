#version 300 es

precision mediump float;


out vec4 outColor;

in vec3 v_id;


void main() {
  outColor = vec4(v_id, 1.0);
}