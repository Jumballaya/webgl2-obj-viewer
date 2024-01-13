import { loadObj } from "../assets/obj-loader";
import { WebGL } from "../gl/WebGL";
import { Mesh } from "./mesh/Mesh";

type LoaderEntry = TextureNetworkEntry | ShaderSrcEntry | ObjNetworkEntry;

type TextureNetworkEntry = {
  type: 'texture:network';
  name: string;
  path: string;
};

type ShaderSrcEntry = {
  type: 'shader:src';
  name: string;
  vertex: string;
  fragment: string;
}

type ObjNetworkEntry = {
  type: 'obj:network';
  dir: string;
  file: string;
  shader: string;
}

export class Loader {
  private webgl: WebGL;

  public meshes: Mesh[] = [];

  constructor(webgl: WebGL) {
    this.webgl = webgl;
  }

  public async load(items: LoaderEntry[]) {
    for (const item of items) {
      switch (item.type) {
        case 'obj:network': {
          if (!item.dir.endsWith('/')) item.dir = item.dir + '/';
          await this.loadObjNetwork(item.dir, item.file, item.shader);
          break;
        }
        case 'shader:src': {
          this.loadShaderSource(item.name, item.vertex, item.fragment);
          break;
        }
        case 'texture:network': {
          this.loadTextureNetwork(item.name, item.path);
          break;
        }
      }
    }
  }

  private async loadTextureNetwork(name: string, path: string) {
    return await this.webgl.loadTexture(name, path);
  }

  private loadShaderSource(name: string, vertex: string, fragment: string) {
    this.webgl.createShader(name, vertex, fragment);
  }

  private async loadObjNetwork(dir: string, file: string, shader: string) {
    const mesh = await loadObj(dir, file, this.webgl, shader);
    this.meshes.push(mesh);
  }
}