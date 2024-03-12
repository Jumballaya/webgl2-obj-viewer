import { vec2 } from "gl-matrix";
import { TextureConfig } from "./types/configs";

let slot = 0;

export class Texture {
  private texture: WebGLTexture;
  private ctx: WebGL2RenderingContext;

  private slot: number;

  constructor(
    ctx: WebGL2RenderingContext,
    image: HTMLImageElement | vec2,
    cfg: TextureConfig = {},
  ) {
    this.slot = slot++;
    this.ctx = ctx;
    const texture = ctx.createTexture();
    const buffer = ctx.createBuffer();
    if (!texture) throw new Error("could not create webgl2 texture");
    if (!buffer) throw new Error("could not create pixel buffer for texture");
    this.texture = texture;
    this.bind();

    if (image instanceof HTMLImageElement) {
      ctx.texImage2D(
        ctx.TEXTURE_2D,
        0,
        ctx.RGBA,
        ctx.RGBA,
        ctx.UNSIGNED_BYTE,
        image,
      );
      ctx.generateMipmap(ctx.TEXTURE_2D);
    } else {
      const internalFormat = cfg.internalFormat || ctx.RGBA;
      const format = cfg.format || ctx.RGBA;
      const type = cfg.type || ctx.UNSIGNED_BYTE;
      ctx.texImage2D(
        ctx.TEXTURE_2D,
        0,
        internalFormat,
        image[0],
        image[1],
        0,
        format,
        type,
        null,
      );
    }
    this.ctx.pixelStorei(this.ctx.UNPACK_FLIP_Y_WEBGL, 1);
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_MIN_FILTER,
      this.ctx.NEAREST,
    );
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_MAG_FILTER,
      this.ctx.NEAREST,
    );
    this.unbind();
  }

  public get id(): number {
    return this.slot;
  }

  public getTexture() {
    return this.texture;
  }

  public bind() {
    this.ctx.activeTexture(this.ctx.TEXTURE0 + this.slot);
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.texture);
  }

  public unbind() {
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, null);
  }
}
