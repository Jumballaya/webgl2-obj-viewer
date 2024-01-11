import { mat4, vec3 } from "gl-matrix";
import { VertexArray } from "../../gl/VertexArray";
import { WebGL } from "../../gl/WebGL";
import { Uniform } from "../../gl/types/uniforms.type";
import { UBO } from "../../gl/UBO";
import { Material } from "../material/Material";
import { ModelMaterial } from "../material/ModelMaterial";
import { DrawMode } from "../../gl/types/configs";

export class Mesh {
  protected vertexArray: VertexArray;
  protected material: Material;
  protected modelMatrix: mat4 = mat4.create();
  protected invTransMatrix: mat4 = mat4.create();
  private _drawMode: DrawMode = 'triangles';

  public children: Mesh[] = [];

  constructor(vao: VertexArray, material: Material) {
    this.vertexArray = vao;
    this.material = material;
  }

  public draw(webgl: WebGL, modelUbo: UBO, materialUBO: UBO) {
    if (this.children.length > 0) {
      for (const child of this.children) {
        child.draw(webgl, modelUbo, materialUBO);
      }
    }
    this.vertexArray.bind();

    if (this.material instanceof ModelMaterial) {
      this.material.bindUbo(materialUBO);
    }
    this.material.bind();
    modelUbo.bind();
    modelUbo.set('matrix', this.modelMatrix);
    modelUbo.set('inv_trans_matrix', this.modelMatrix);
    
    if (this.material.cullFace) {
      webgl.enable('cull_face');
    } else {
      webgl.disable('cull_face');
    }

    webgl.drawArrays(this.vertexArray.vertexCount, this._drawMode);
    this.vertexArray.unbind();
    this.material.unbind();
    modelUbo.unbind();
  }

  public uniform(name: string, uniform: Uniform) {
    this.material.uniform(name, uniform);
  }

  public rotate(axis: vec3, rad: number) {
    mat4.rotate(this.modelMatrix, this.modelMatrix, rad, axis);
  }

  public scale(amount: vec3) {
    mat4.scale(this.modelMatrix, this.modelMatrix, amount);
  }

  public translate(amount: vec3) {
    mat4.translate(this.modelMatrix, this.modelMatrix, amount);
  }

  public set diffuse(c: vec3) {
    if (this.material instanceof ModelMaterial) {
      this.material.diffuse = c;
    }
  }

  public get diffuse(): vec3 {
    if (this.material instanceof ModelMaterial) {
      return this.material.diffuse;
    }
    return [0, 0, 0];
  }

  public set opacity(o: number) {
    if (this.material instanceof ModelMaterial) {
      this.material.opacity = Math.min(1, Math.max(0, o));
    }
  }

  public get opacity(): number {
    if (this.material instanceof ModelMaterial) {
      return this.material.opacity;
    }
    return 1;
  }

  public get drawMode(): DrawMode {
    return this._drawMode;
  }

  public set drawMode(m: DrawMode) {
    this._drawMode = m;
    for (const c of this.children) {
      c.drawMode = m;
    }
  }

}
