import { vec3 } from "gl-matrix";

export type ModelMaterialConfig = {
  name: string;
  ambient: vec3;
  diffuse: vec3;
  specular: vec3;
  opacity: number;
  illum: number;

  specular_texture?: string;
  albedo_texture?: string;
  normal_texture?: string;
};