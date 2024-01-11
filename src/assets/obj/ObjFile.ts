import { ObjLineTokenizer } from "./obj/ObjTokenizer";
import { ObjFace } from "./obj/ObjFace";
import { ObjNormal } from "./obj/ObjNormal";
import { ObjObject } from "./obj/ObjObject";
import { ObjPosition } from "./obj/ObjPosition";
import { ObjTextureCoord } from "./obj/ObjTextureCoord";
import { ObjObjToken } from "./obj/types/obj-token.type";
import { MtlFile } from "./MtlFile";

export class ObjFile {
  public positions: ObjPosition[] = [];
  public texCoords: ObjTextureCoord[] = [];
  public normals: ObjNormal[] = [];
  public faces: ObjFace[] = [];

  private file: string;
  private baseDir: string;

  private objects: Record<string, ObjObject> = {};
  private currentObject: string = '';

  constructor(dir: string, file: string) {
    this.baseDir = dir;
    this.file = file;
  }

  public static async FromFile(file: string, base: string) {
    const res = await fetch(`${base}/${file}`);
    const contents = await res.text();
    return new ObjFile(base, contents);
  }

  public async parse() {
    const lines = this.file.split('\n');
    const tokenizer = new ObjLineTokenizer();
    const materialsToLoad: string[] = [];

    for (let line of lines) {
      const tokens = tokenizer.tokenize(line);
      if (!tokens || tokens.length === 0) continue;
      switch (tokens[0].type) {
        case 'vertex': {
          const x = tokens[1].type === 'number' ? tokens[1].value : 0;
          const y = tokens[2].type === 'number' ? tokens[2].value : 0;
          const z = tokens[3].type === 'number' ? tokens[3].value : 0;
          const vertex = new ObjPosition(x, y, z);
          this.positions.push(vertex);
          break;
        }
        case 'normal': {
          const x = tokens[1].type === 'number' ? tokens[1].value : 0;
          const y = tokens[2].type === 'number' ? tokens[2].value : 0;
          const z = tokens[3].type === 'number' ? tokens[3].value : 0;
          const normal = new ObjNormal(x, y, z);
          this.normals.push(normal);
          break;
        }
        case 'texCoord': {
          const u = tokens[1].type === 'number' ? tokens[1].value : 0;
          const v = tokens[2].type === 'number' ? tokens[2].value : 0;
          const texCoord = new ObjTextureCoord(u, v);
          this.texCoords.push(texCoord);
          break;
        }
        case 'face': {
          let tris = '';
          for (let i = 1; i < tokens.length; i++) {
            tris += ` ${tokens[i].value}`;
          }
          const face = new ObjFace(tris.trim(), this.positions, this.texCoords, this.normals);
          const obj = this.objects[this.currentObject];
          if (obj) obj.faces.push(face);
          break;
        }
        case 'object': {
          const name = (tokens[1] as ObjObjToken).value;
          this.currentObject = name;
          this.objects[name] = new ObjObject(name);
          break;
        }
        case 'material': {
          materialsToLoad.push(`${this.baseDir}${tokens[1].value}`);
          break;
        }
        case 'use-material': {
          if (tokens[1].type === 'string') {
            this.objects[this.currentObject].material = tokens[1].value;
          }
          break;
        }
      }
    }

    const objectNames = Object.keys(this.objects);
    const materials = await Promise.all(materialsToLoad.map(path => MtlFile.FromFile(path, this.baseDir)));
    for (const matFile of materials) {
      matFile.parse();
    }

    const meshes = [];
    for (const name of objectNames) {
      const triangles = this.objects[name].faces.map(f => f.triangles).flatMap(x => x);
      const positions = new Float32Array(triangles.map(tri => tri.positions()).flatMap(x => x));
      const texCoords = new Float32Array(triangles.map(tri => tri.texCoords()).flatMap(x => x));
      const normals = new Float32Array(triangles.map(tri => tri.normals()).flatMap(x => x));
      const material = this.objects[name].material;
      meshes.push({
        name,
        material,
        buffers: [
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
        ]
      });
    }
    return {
      meshes,
      materials,
    }
  }
}