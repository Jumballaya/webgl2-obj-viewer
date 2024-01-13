import { vec3 } from "gl-matrix";
import { VertexArray } from "../../gl/VertexArray";
import { WebGL } from "../../gl/WebGL";
import { Uniform } from "../../gl/types/uniforms.type";
import { UBO } from "../../gl/UBO";
import { Material } from "../material/Material";
import { PhongMaterial } from "../material/PhongMaterial";
import { DrawMode } from "../../gl/types/configs";
import { Transform } from "../../math/Transform";

export class Mesh {
  private transform: Transform = new Transform();
  private _drawMode: DrawMode = 'triangles';
  
  protected vertexArray: VertexArray;
  
  public material: Material;
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

    if (this.material instanceof PhongMaterial) {
      this.material.bindUbo(materialUBO);
    }
    this.material.bind();
    modelUbo.bind();
    modelUbo.set('matrix', this.transform.matrix);
    modelUbo.set('inv_trans_matrix', this.transform.invTrans);
    
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

  public get drawMode(): DrawMode {
    return this._drawMode;
  }

  public set drawMode(m: DrawMode) {
    this._drawMode = m;
    for (const c of this.children) {
      c.drawMode = m;
    }
  }

  public set translation(t: vec3) {
    this.transform.translation = t;
    for (const child of this.children) {
      child.translation = t;
    }
  }

  public set rotation(r: vec3) {
    this.transform.rotation = r;
    for (const child of this.children) {
      child.rotation = r;
    }
  }

  public set scale(s: vec3) {
    this.transform.scale = s;
    for (const child of this.children) {
      child.scale = s;
    }
  }

}
