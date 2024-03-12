import { UBO } from "../../gl/UBO";
import { WebGL } from "../../gl/WebGL";
import { Uniform } from "../../gl/types/uniforms.type";

export class Material {
  protected webgl: WebGL;
  protected shader: string;
  protected textures: Array<string> = [];
  public opacity: number = 1;

  public cullFace = true;

  constructor(webgl: WebGL, shader: string) {
    this.webgl = webgl;
    this.shader = shader;
  }

  public clone() {
    return new Material(this.webgl, this.shader);
  }

  public bind() {
    this.webgl.shaders[this.shader]?.bind();
    for (const tex of this.textures) {
      this.webgl.textures[tex]?.bind();
    }
  }

  public bindUbo(_: UBO) {}

  public unbind() {
    this.webgl.shaders[this.shader]?.unbind();
    for (const tex of this.textures) {
      this.webgl.textures[tex]?.unbind();
    }
  }

  public uniform(name: string, uniform: Uniform) {
    this.webgl.shaders[this.shader].uniform(name, uniform);
  }

  public texture(name: string) {
    this.textures.push(name);
  }
}
