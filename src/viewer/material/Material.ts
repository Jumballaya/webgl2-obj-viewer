import { WebGL } from "../../gl/WebGL";
import { Uniform } from "../../gl/types/uniforms.type";

export class Material {
  protected webgl: WebGL;
  protected shader: string;
  protected textures: Array<string> = [];

  public cullFace = true;

  constructor(webgl: WebGL, shader: string) {
    this.webgl = webgl;
    this.shader = shader;
  }

  public bind() {
    this.webgl.shaders[this.shader]?.bind();
    for (let tex of this.textures) {
      this.webgl.textures[tex]?.bind();
    }
  }

  public unbind() {
    this.webgl.shaders[this.shader]?.unbind();
    for (let tex of this.textures) {
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