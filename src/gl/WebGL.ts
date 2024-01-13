import { vec2, vec3 } from "gl-matrix";
import { Shader } from "./Shader";
import { Texture } from "./Texture";
import { VertexArray } from "./VertexArray";
import { VertexBuffer } from "./VertexBuffer";
import { DrawMode, TextureConfig, UBOConfig, VertexArrayConfig, VertexBufferConfig } from "./types/configs";
import { Controller } from "../controls/Controller";
import { UBO } from "./UBO";
import { loadImage } from "../assets/image-loader";
import { Surface } from "./Surface";

type EnableOption = 'cull_face' | 'depth' | 'blend';
type ClearOption = 'color' | 'depth';

function getDrawMode(m: DrawMode): number {
  const gl = WebGL2RenderingContext;
  switch(m) {
    case 'lines': return gl.LINES;
    case 'points': return gl.POINTS;
    case 'triangles': return gl.TRIANGLES;
  }
}

export class WebGL {
  private canvas: HTMLCanvasElement;
  private size: [number, number] = [0, 0];
  private context: WebGL2RenderingContext;
  private isFullScreen: boolean = false;

  public shaders: Record<string, Shader> = {};
  public textures: Record<string, Texture> = {};


  constructor(size: [number, number]) {
    this.canvas = document.getElementById('screen')! as HTMLCanvasElement;
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    this.size = [size[0], size[1]];

    const context = this.canvas.getContext('webgl2');
    if (!context) throw new Error('Could not get webgl2 context');
    this.context = context;

    window.addEventListener('resize', () => {
      if (this.fullScreen) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
    });
  }

  public set fullScreen(fs: boolean) {
    this.isFullScreen = fs;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public get fullScreen(): boolean {
    return this.isFullScreen;
  }

  public registerController(controller: Controller) {
    controller.registerForCanvas(this.canvas);
  }

  public clear(...opts: ClearOption[]) {
    let mask = 0;
    for (const opt of opts) {
      switch (opt) {
        case 'color': {
          mask |= this.context.COLOR_BUFFER_BIT;
          break;
        }
        case 'depth': {
          mask |= this.context.DEPTH_BUFFER_BIT;
          break;
        }
      }
    }
    if (mask !== 0) {
      this.context.clear(mask);
    }
  }

  public enable(...opts: EnableOption[]) {
    for (const opt of opts) {
      switch (opt) {
        case 'cull_face': {
          this.context.enable(this.context.CULL_FACE);
          break;
        }
        case 'depth': {
          this.context.enable(this.context.DEPTH_TEST);
          break;
        }
        case 'blend': {
          this.context.enable(this.context.BLEND);
          break;
        }
      }
    }
  }

  public disable(...opts: EnableOption[]) {
    for (const opt of opts) {
      switch (opt) {
        case 'cull_face': {
          this.context.disable(this.context.CULL_FACE);
          break;
        }
        case 'depth': {
          this.context.disable(this.context.DEPTH_TEST);
          break;
        }
        case 'blend': {
          this.context.disable(this.context.BLEND);
          break;
        }
      }
    }
  }

  public clearColor(c: vec3) {
    this.context.clearColor(c[0], c[1], c[2], 1);
  }

  public viewport(x: number, y: number, size: vec2) {
    this.context.viewport(x, y, size[0], size[1]);
  }

  public blendFunc(sfactor: number, dfactor: number) {
    this.context.blendFunc(sfactor, dfactor);
  }

  public drawArrays(count: number, drawMode: DrawMode) {
    const mode = getDrawMode(drawMode);
    this.context.drawArrays(mode, 0, count)
  }

  public createShader(name: string, vertex: string, fragment: string): Shader {
    const shader = new Shader(this.context, name, vertex, fragment);
    this.shaders[name] = shader;
    return shader;
  }

  public createVertexBuffer(config: VertexBufferConfig): VertexBuffer {
    return new VertexBuffer(this.context, config);
  }

  public createVertexArray(config: VertexArrayConfig): VertexArray {
    return new VertexArray(this.context, config);
  }

  public createTexture(name: string, image: HTMLImageElement | vec2, cfg?: TextureConfig): Texture {
    const tex = new Texture(this.context, image, cfg);
    this.textures[name] = tex;
    return tex;
  }

  public createSurface(shader: string, size: vec2, hasDepth = false) {
    return new Surface(this.context, size, this.shaders[shader], hasDepth);
  }

  public async loadTexture(name: string, path: string): Promise<Texture> {
    const img = await loadImage(path);
    return this.createTexture(name, img);
  }

  public createUBO(name: string, config: UBOConfig | Float32Array): UBO {
    return new UBO(this.context, name, config);
  }
}