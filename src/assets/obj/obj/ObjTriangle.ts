import { ObjVertex } from "./ObjVertex";

export class ObjTriangle {
  public vertices: [ObjVertex, ObjVertex, ObjVertex];

  constructor(
    vertices: [ObjVertex, ObjVertex, ObjVertex],
    smoothShaded = false,
  ) {
    this.vertices = vertices;
    if (smoothShaded) this.applySmoothShading();
  }

  public positions(): Array<number> {
    const data = new Array(9).fill(0);
    let offset = 0;
    for (let v of this.vertices) {
      if (v.position) {
        data[offset * 3 + 0] = v.position.values[0];
        data[offset * 3 + 1] = v.position.values[1];
        data[offset * 3 + 2] = v.position.values[2];
      }
      offset++;
    }
    return data;
  }

  public normals(): Array<number> {
    const data = new Array(9).fill(0);
    let offset = 0;
    for (let v of this.vertices) {
      if (v.normal) {
        data[offset * 3 + 0] = v.normal.values[0];
        data[offset * 3 + 1] = v.normal.values[1];
        data[offset * 3 + 2] = v.normal.values[2];
      }
      offset++;
    }
    return data;
  }

  public texCoords(): Array<number> {
    const data = new Array(6).fill(0);
    let offset = 0;
    for (let v of this.vertices) {
      if (v.texCoord) {
        data[offset * 2 + 0] = v.texCoord.values[0];
        data[offset * 2 + 1] = v.texCoord.values[1];
      }
      offset++;
    }
    return data;
  }

  private applySmoothShading(): void {
    const normal1 = this.vertices[0].normal?.values || [0, 0, 0];
    const normal2 = this.vertices[0].normal?.values || [0, 0, 0];
    const normal3 = this.vertices[0].normal?.values || [0, 0, 0];
    const avgX = (normal1[0] + normal2[0] + normal3[0]) / 3;
    const avgY = (normal1[1] + normal2[1] + normal3[1]) / 3;
    const avgZ = (normal1[2] + normal2[2] + normal3[2]) / 3;
    if (this.vertices[0].normal) this.vertices[0].normal.x = avgX;
    if (this.vertices[0].normal) this.vertices[0].normal.y = avgY;
    if (this.vertices[0].normal) this.vertices[0].normal.z = avgZ;

    if (this.vertices[1].normal) this.vertices[1].normal.x = avgX;
    if (this.vertices[1].normal) this.vertices[1].normal.y = avgY;
    if (this.vertices[1].normal) this.vertices[1].normal.z = avgZ;

    if (this.vertices[2].normal) this.vertices[2].normal.x = avgX;
    if (this.vertices[2].normal) this.vertices[2].normal.y = avgY;
    if (this.vertices[2].normal) this.vertices[2].normal.z = avgZ;
  }
}
