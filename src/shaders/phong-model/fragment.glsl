#version 300 es

precision mediump float;


out vec4 outColor;

in vec2 v_uv;
in vec3 v_normal;
in vec3 v_position;
in vec3 v_camera_position;

uniform sampler2D u_texture_albedo;
uniform sampler2D u_texture_normal;
uniform sampler2D u_texture_specular;

layout(std140) uniform Material {
  uniform vec3 ambient;
  uniform vec3 diffuse;
  uniform vec3 specular;
  uniform vec3 opacity; // r channel is opacity
  uniform vec4 textures; // 0 -> albedo 1 -> normal 2 -> specular
} material;

const vec3 light_position = vec3(-5.0, 5.0, -10.0);

void main() {
  vec3 albedo = texture(u_texture_albedo, v_uv).rgb;
  vec3 specular = texture(u_texture_specular, v_uv).rgb;
  vec3 normal = texture(u_texture_normal, v_uv).rgb;

  albedo = (albedo * material.textures.x) + (material.diffuse * (1.0 - material.textures.x));
  specular = (specular * material.textures.z) + (material.specular * (1.0 - material.textures.z));

  vec3 norm = normalize(v_normal);
  vec3 lightDir = normalize(light_position - v_position);

  // Ambient
  float ambientStrength = 0.25;
  vec3 ambient = ambientStrength * material.ambient;

  // Diffuse
  float diffuseStrength = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diffuseStrength * material.diffuse;

  // Specular
  float specStrength = (specular.r * material.textures.z) + (0.5 * (1.0 - material.textures.z));
  vec3 viewDir = normalize(v_camera_position - v_position);
  vec3 reflectDir = reflect(-lightDir, norm);
  float specMult = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 spec = specStrength * specMult * specular;
  
  // Final Lighting
  vec3 lighting = vec3(0.0, 0.0, 0.0);
  lighting = vec3(ambient + diffuse + spec) * albedo;
  
  outColor = vec4(lighting, material.opacity.r);
}