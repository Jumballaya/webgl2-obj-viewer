import { vec3, vec4 } from "gl-matrix";
import { WebGL } from "../../gl/WebGL";
import { UBO } from "../../gl/UBO";
import { Material } from "./Material";
import { PhongMaterialConfig } from "./types/phong-material-config.type";

export class LitMaterial extends Material {
  public albedo: string;
  public normal_map: string;
  public specular_map: string;

  public ambient: vec3;
  public specular: vec3;
  public diffuse: vec3;

  private config?: PhongMaterialConfig;

  constructor(webgl: WebGL, shader: string, config?: PhongMaterialConfig) {
    super(webgl, shader);
    this.config = config;
    this.albedo = config?.albedo_texture || "";
    this.normal_map = config?.normal_texture || "";
    this.specular_map = config?.specular_texture || "";
    this.ambient = config?.ambient || [1, 1, 1];
    this.specular = config?.specular || [1, 1, 1];
    this.diffuse = config?.diffuse || [1, 1, 1];
    this.opacity = config?.opacity ?? 1;
  }

  public clone() {
    return new LitMaterial(this.webgl, this.shader, this.config);
  }

  public bindUbo(ubo: UBO) {
    ubo.bind();
    this.webgl.shaders[this.shader]?.bind();
    const albedoTexId = this.webgl.textures[this.albedo]?.id ?? 16;
    // const normalTexId = this.webgl.textures[this.normal_map]?.id ?? 16;
    // const specularTexId = this.webgl.textures[this.specular_map]?.id ?? 16;

    const a = this.ambient;
    const s = this.specular;
    const d = this.diffuse;
    const o = this.opacity;
    ubo.set("ambient", [a[0], a[1], a[2], 0]);
    ubo.set("specular", [s[0], s[1], s[2], 0]);
    ubo.set("diffuse", [d[0], d[1], d[2], 0]);
    ubo.set("opacity", [o, 0, 0, 0]);
    ubo.set("textures", this.textureList());

    this.webgl.shaders[this.shader]?.uniform("u_texture_albedo", {
      type: "texture",
      value: albedoTexId,
    });
    //this.webgl.shaders[this.shader]?.uniform('u_texture_normal', { type: 'texture', value: normalTexId });
    //this.webgl.shaders[this.shader]?.uniform('u_texture_specular', { type: 'texture', value: specularTexId });
    this.webgl.shaders[this.shader]?.unbind();
    ubo.unbind();
  }

  public bind() {
    this.webgl.shaders[this.shader]?.bind();
    this.webgl.textures[this.albedo]?.bind();
    this.webgl.textures[this.normal_map]?.bind();
    this.webgl.textures[this.specular_map]?.bind();
  }

  public unbind() {
    this.webgl.textures[this.albedo]?.unbind();
    this.webgl.textures[this.normal_map]?.unbind();
    this.webgl.textures[this.specular_map]?.unbind();
    this.webgl.shaders[this.shader]?.unbind();
  }

  private textureList(): vec4 {
    return [
      this.albedo !== "" ? 1 : 0,
      //this.normal_map !== '' ? 1 : 0,
      //this.specular_map !== '' ? 1 : 0,
      0,
      0,
      0,
    ];
  }
}
