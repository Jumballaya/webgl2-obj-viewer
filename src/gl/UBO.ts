import { mat4, vec4 } from "gl-matrix";
import { Shader } from "./Shader";
import { UBOConfig, UBOLayout } from "./types/configs";


let bindingPoint = 0;
export class UBO {
  private ctx: WebGL2RenderingContext;
  private buffer: WebGLBuffer;
  private layout: Record<string, UBOLayout> = {};
  private bindingPoint = bindingPoint++;

  public name: string;

  constructor(ctx: WebGL2RenderingContext, name: string, config: UBOConfig) {
    this.ctx = ctx;
    this.name = name;
    const buffer = ctx.createBuffer();
    if (!buffer) throw new Error('could not create uniform buffer object');
    this.buffer = buffer;
    this.ctx.bindBufferBase(this.ctx.UNIFORM_BUFFER, this.bindingPoint, this.buffer);

    let size = 0;
    for (const entry of config) {
      this.layout[entry.name] = { type: entry.type, offset: size };
      size += entry.type === 'mat4' ? 16 : 4;
    }
    this.ctx.bufferData(ctx.UNIFORM_BUFFER, new Float32Array(size * 4), ctx.DYNAMIC_DRAW);

    this.unbind();
  }

  public setupShader(shader: Shader) {
    shader.addUBO(this.name, this.bindingPoint);
  }

  public set(name: string, value: mat4 | vec4) {
    const info = this.layout[name];
    if (!info) return;
    
    const offset = info.offset;
    this.ctx.bufferSubData(this.ctx.UNIFORM_BUFFER, offset * 4, new Float32Array(value));
  }

  public bind() {
    this.ctx.bindBuffer(this.ctx.UNIFORM_BUFFER, this.buffer);
  }

  public unbind() {
    this.ctx.bindBuffer(this.ctx.UNIFORM_BUFFER, null);
  }

}