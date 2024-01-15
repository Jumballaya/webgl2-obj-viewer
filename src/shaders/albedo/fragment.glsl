#version 300 es

precision mediump float;


out vec4 outColor;

in vec2 v_uv;
in vec3 v_normal;
in vec3 v_position;

uniform sampler2D u_texture_albedo;

layout(std140) uniform Material {
  uniform vec3 ambient;
  uniform vec3 diffuse;
  uniform vec3 specular;
  uniform vec3 opacity; // r channel is opacity
  uniform vec4 textures; // 0 -> albedo 1 -> normal 2 -> specular
} material;

void main() {
  vec3 albedo_texture = texture(u_texture_albedo, v_uv).rgb;
  vec3 albedo = (albedo_texture * material.textures.x) + (material.diffuse * (1.0 - material.textures.x));

  outColor = vec4(albedo, 1.0);
}