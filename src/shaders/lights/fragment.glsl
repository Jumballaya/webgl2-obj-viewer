#version 300 es

precision mediump float;


out vec4 outColor;

in vec2 v_uv;
in vec3 v_normal;
in vec3 v_position;

uniform sampler2D u_texture_albedo;

struct Spotlight {
    vec4 position;
    vec4 direction;
    vec4 angles; // x = inner, y = outer, z = is_active
};

struct Pointlight {
    vec4 position; // [x,y,z] -> position, w -> is_active
};

layout(std140) uniform Material {
  uniform vec3 ambient;
  uniform vec3 diffuse;
  uniform vec3 specular;
  uniform vec3 opacity; // r channel is opacity
  uniform vec4 textures; // 0 -> albedo 1 -> normal 2 -> specular
} material;

layout(std140) uniform Lighting {
    Spotlight spotlights[10];
    Pointlight pointlights[10];
};

float point_light(vec3 position) {
    vec3 offset = position - v_position;
    vec3 direction = normalize(offset);
    float distance = length(offset);

    float diffuse = max(0.0, dot(direction, v_normal));
    float attenuation = 2.0 / distance;
    return (diffuse * attenuation);
}

float spot_light(vec3 position, vec3 direction, float inner, float outer) {
    vec3 offset = position - v_position;
    vec3 surfToLight = normalize(offset);

    float diffuse = max(0.0, dot(surfToLight, normalize(v_normal)));
    float angleToSurf = dot(direction, -surfToLight);
    float spot = smoothstep(inner, outer, angleToSurf);
    float attenuation = 2.0 / length(offset);
    return diffuse * spot * attenuation;
}

void main() {
  vec3 albedo_texture = texture(u_texture_albedo, v_uv).rgb;
  vec3 albedo = (albedo_texture * material.textures.x) + (material.diffuse * (1.0 - material.textures.x));
  vec3 ambient = (albedo_texture * material.textures.x) + (material.ambient * (1.0 - material.textures.x));
  
  float brightness = 0.0;
  for (int i = 0; i < 10; i++) {
      brightness += spot_light(
          spotlights[i].position.xyz,
          spotlights[i].direction.xyz,
          spotlights[i].angles.x,
          spotlights[i].angles.y) * spotlights[i].angles.z;
      brightness += point_light(pointlights[i].position.xyz) * pointlights[i].position.w;
  }

  brightness *= 3.0;

  vec3 ambient_color = ambient * 0.05;
  vec3 diffuse_color = albedo * brightness;
  vec3 color = ambient_color + diffuse_color;

  outColor = vec4(color, material.opacity.r);
}