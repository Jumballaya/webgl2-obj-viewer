import { vec2 } from "gl-matrix";
import { Texture } from "./Texture";

type AttachmentType = "color" | "depth" | "stencil";
type Attachment = {
  type: AttachmentType;
  size: vec2;
};

interface FrameBufferTextures {
  color: Texture | undefined;
  depth: Texture | undefined;
  stencil: Texture | undefined;
}

export class FrameBuffer {
  private buffer: WebGLFramebuffer;
  private ctx: WebGL2RenderingContext;

  private textures: FrameBufferTextures = {
    color: undefined,
    depth: undefined,
    stencil: undefined,
  };

  constructor(ctx: WebGL2RenderingContext) {
    const buffer = ctx.createFramebuffer();
    if (!buffer) throw new Error("could not create frame buffer");
    this.buffer = buffer;

    if (
      ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) !== ctx.FRAMEBUFFER_COMPLETE
    ) {
      throw new Error("frame buffer attachments error");
    }
    this.ctx = ctx;
  }

  public attachment(attachment: Attachment) {
    if (attachment.type === "color" && this.textures.color === undefined) {
      this.createColorAttachment(attachment.size);
      return;
    }
    if (attachment.type === "depth" && this.textures.depth === undefined) {
      this.createDepthAttachment(attachment.size);
      return;
    }
    if (attachment.type === "stencil" && this.textures.stencil === undefined) {
      return;
    }
  }

  public bind() {
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.buffer);
  }

  public unbind() {
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);
  }

  public getColorTexture() {
    return this.textures.color;
  }

  public getDepthTexture() {
    return this.textures.depth;
  }

  public getStencilTexture() {
    return this.textures.stencil;
  }

  private createColorAttachment(size: vec2) {
    const ctx = this.ctx;
    const texture = new Texture(ctx, size);
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, this.buffer);
    ctx.framebufferTexture2D(
      ctx.FRAMEBUFFER,
      ctx.COLOR_ATTACHMENT0,
      ctx.TEXTURE_2D,
      texture.getTexture(),
      0,
    );

    this.textures.color = texture;
  }

  private createDepthAttachment(size: vec2) {
    const ctx = this.ctx;
    const texture = new Texture(ctx, size, {
      internalFormat: ctx.DEPTH_COMPONENT24,
      format: ctx.DEPTH_COMPONENT,
      type: ctx.UNSIGNED_INT,
    });
    ctx.bindFramebuffer(ctx.FRAMEBUFFER, this.buffer);
    ctx.framebufferTexture2D(
      ctx.FRAMEBUFFER,
      ctx.DEPTH_ATTACHMENT,
      ctx.TEXTURE_2D,
      texture.getTexture(),
      0,
    );

    this.textures.depth = texture;
  }
}
