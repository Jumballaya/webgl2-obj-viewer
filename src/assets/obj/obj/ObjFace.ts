import { ObjNormal } from "./ObjNormal";
import { ObjPosition } from "./ObjPosition";
import { ObjTextureCoord } from "./ObjTextureCoord";
import { ObjTriangle } from "./ObjTriangle";
import { ObjVertex } from "./ObjVertex";

export class ObjFace {
  public vertices: ObjVertex[] = [];
  public triangles: ObjTriangle[] = [];

  constructor(line: string, positions: ObjPosition[], texCoords: ObjTextureCoord[], normals: ObjNormal[]) {
    const verts = line.trim().split(' ').map(t => this.parseVertex(t, positions, texCoords, normals));
    this.vertices.push(...verts);
    const numberOfTriangles = verts.length - 2;
    for (let i = 0; i < numberOfTriangles; i++) {
      const tri = new ObjTriangle([verts[0], verts[i+1], verts[i+2]]);
      this.triangles.push(tri);
    }
  }

  private parseVertex(tri: string, positions: ObjPosition[], texCoords: ObjTextureCoord[], normals: ObjNormal[]) {
    const data = tri.split('/').map(n => parseFloat(n));
    const [p, t, n] = data;

    if (p === undefined || isNaN(p)) throw new Error(`Error with face vertex: "${tri}", incorrect position`);

    const vertex = new ObjVertex(positions[p-1]); // OBJ file is 1-indexed
    if (t !== undefined && !isNaN(t)) {
      vertex.texCoord = texCoords[t-1]; // OBJ file is 1-indexed
    }
    if (n !== undefined && !isNaN(n)) {
      vertex.normal = normals[n-1]; // OBJ file is 1-indexed
    }

    return vertex;
  }
}