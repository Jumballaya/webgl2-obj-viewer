import { ObjNormal } from "./ObjNormal";
import { ObjPosition } from "./ObjPosition";
import { ObjTextureCoord } from "./ObjTextureCoord";

export class ObjVertex {
  public position: ObjPosition;
  public normal?: ObjNormal;
  public texCoord?: ObjTextureCoord;

  constructor(position: ObjPosition) {
    this.position = position;
  }
}