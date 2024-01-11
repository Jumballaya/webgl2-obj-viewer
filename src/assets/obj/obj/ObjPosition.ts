import { vec3 } from "gl-matrix";

export class ObjPosition {
  public x: number;
  public y: number;
  public z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public get values(): vec3 {
    return [this.x, this.y, this.z];
  }
}