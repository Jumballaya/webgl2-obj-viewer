import { vec3 } from "gl-matrix";
import { VertexArray } from "../../gl/VertexArray";
import { WebGL } from "../../gl/WebGL";
import { Uniform } from "../../gl/types/uniforms.type";
import { UBO } from "../../gl/UBO";
import { Material } from "../material/Material";
import { PhongMaterial } from "../material/PhongMaterial";
import { DrawMode } from "../../gl/types/configs";
import { Transform } from "../../math/Transform";
import { LitMaterial } from "../material/LitMaterial";


const materialUboMaterials= [
  PhongMaterial,
  LitMaterial,
];


let count = 0;
function next_id(): vec3 {
  const r = (count >> 16) & 0xff;
  const g = (count >> 8) & 0xff;
  const b = count & 0xff;
  count += 1;
  return [r / 256, g / 256, b / 256];
}

export class Mesh {
  private transform: Transform;
  private _drawMode: DrawMode = 'triangles';
  
  protected vertexArray: VertexArray;
  protected id: vec3;
  
  public material: Material;
  public children: Mesh[] = [];

  constructor(vao: VertexArray, material: Material) {
    this.vertexArray = vao;
    this.material = material;
    this.transform = new Transform();
    this.id = next_id();
  }

  public clone(): Mesh {
    const m = new Mesh(this.vertexArray, this.material.clone());
    m.children = this.children.map(c => c.clone());
    return m;
  }

  public draw(webgl: WebGL, modelUbo: UBO, materialUBO: UBO) {
    if (this.children.length > 0) {
      for (const child of this.children) {
        child.draw(webgl, modelUbo, materialUBO);
      }
    }
    this.vertexArray.bind();

    if (this.needsToBindMaterialUbo()) {
      (this.material as any).bindUbo(materialUBO);
    }

    this.material.bind();
    modelUbo.bind();
    modelUbo.set('matrix', this.transform.matrix);
    modelUbo.set('inv_trans_matrix', this.transform.invTrans);
    modelUbo.set('id', [this.id[0], this.id[1], this.id[2], 0]);
    
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

  private needsToBindMaterialUbo(): boolean {
    return materialUboMaterials.some(c => this.material instanceof c);
  }

  public isId(id: vec3): boolean {
    const self = numbers_equal(this.id[0], id[0])
      && numbers_equal(this.id[1], id[1])
      && numbers_equal(this.id[2], id[2]);

    return self || this.children.some(c => c.isId(id));
  }

}

const epsilon = 0.00001;
function numbers_equal(a: number, b: number): boolean {
  return Math.abs(a - b) < epsilon;
}