import { ObjFace } from "./ObjFace";

export class ObjObject {
  public name: string;
  public material = '';
  public faces: ObjFace[] = [];

  constructor(name: string) {
    this.name = name;
  }

  public buffers() {
    const triangles = this.faces.map(f => f.triangles).flatMap(x => x);
    const positions = new Float32Array(triangles.map(tri => tri.positions()).flatMap(x => x));
    const texCoords = new Float32Array(triangles.map(tri => tri.texCoords()).flatMap(x => x));
    const normals = new Float32Array(triangles.map(tri => tri.normals()).flatMap(x => x));

    return [
      {
        name: 'a_position',
        type: WebGL2RenderingContext.FLOAT,
        stride: 3,
        normalized: false,
        data: positions,
        drawType: WebGL2RenderingContext.STATIC_DRAW,
      },
      {
        name: 'a_uv',
        type: WebGL2RenderingContext.FLOAT,
        stride: 2,
        normalized: false,
        data: texCoords,
        drawType: WebGL2RenderingContext.STATIC_DRAW,
      },
      {
        name: 'a_normals',
        type: WebGL2RenderingContext.FLOAT,
        stride: 3,
        normalized: false,
        data: normals,
        drawType: WebGL2RenderingContext.STATIC_DRAW,
      },
    ];
  }
}