import { vec2 } from "gl-matrix";

export class ObjTextureCoord {
  public u: number;
  public v: number;

  constructor(u = 0, v = 0) {
    this.u = u;
    this.v = v;
  }

  public get values(): vec2 {
    return [this.u, this.v];
  }
}
