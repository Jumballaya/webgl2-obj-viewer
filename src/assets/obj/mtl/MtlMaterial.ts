import { vec3 } from "gl-matrix";

export class MtlMaterial {
  name: string;
  ambient: vec3 = [0, 0, 0]; // Ka
  diffuse: vec3 = [0, 0, 0]; // Kd
  specular: vec3 = [0, 0, 0]; // Ks
  emissive: vec3 = [0, 0, 0]; // Ke
  opacity: number = 1; // d -> dissolve
  illum = 1; // illuminated
  
  specular_texture?: string; // Ns
  albedo_texture?: string; // map_Kd
  normal_texture?: string; // map_Bump

  constructor(name: string) {
    this.name = name;
  }
}
