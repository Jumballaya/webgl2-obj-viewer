#version 300 es

layout(location=0) in vec4 a_position;
layout(location=1) in vec2 a_uv;
layout(location=2) in vec3 a_normal;

out vec2 v_uv;

layout(std140) uniform Camera {
  mat4 projection;
  mat4 view;
  vec4 position;
} camera;

layout(std140) uniform Model {
  mat4 matrix;
  mat4 inv_trans_matrix;
} model;

void main() {
  gl_Position = camera.projection * camera.view * model.matrix * a_position;
  v_uv = a_uv;
}