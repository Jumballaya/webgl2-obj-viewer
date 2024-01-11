#version 300 es

layout(location=0) in vec4 a_position;
layout(location=1) in vec2 a_uv;

layout(std140) uniform Camera {
  mat4 projection;
  mat4 view;
  vec4 position;
} camera;

out vec2 v_uv;

void main() {
  gl_Position = camera.projection * camera.view * a_position;
  v_uv = a_uv;
}