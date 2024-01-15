import { WebGL } from "../../gl/WebGL";
import { Material } from "../material/Material";
import { Mesh } from "./Mesh";


const buffers = [
  {
    stride: 3,
    name: 'a_position',
    type: WebGL2RenderingContext.FLOAT,
    normalized: false,
    data: new Float32Array([ -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0, ]),
    drawType: WebGL2RenderingContext.STATIC_DRAW,
  },
  {
    stride: 2,
    name: 'a_uv',
    type: WebGL2RenderingContext.FLOAT,
    normalized: false,
    data: new Float32Array([ 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1 ]),
  },
  {
    stride: 3,
    name: 'a_normal',
    type: WebGL2RenderingContext.FLOAT,
    normalized: false,
    data: new Float32Array([ 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1 ]),
  }
];

export class QuadMesh extends Mesh {
  protected webgl: WebGL;

  constructor(webgl: WebGL, material: Material) {
    super(webgl.createVertexArray({
      drawType: WebGL2RenderingContext.STATIC_DRAW,
      buffers,
    }), material);
    this.webgl = webgl;
  }
  
  public clone(): QuadMesh {
    const m = new QuadMesh(this.webgl, this.material.clone());
    m.children = this.children.map(c => c.clone());
    return m;
  }
}