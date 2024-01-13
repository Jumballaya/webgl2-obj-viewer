import { vec2 } from "gl-matrix";
import { WebGL } from "../../gl/WebGL";
import { Material } from "../material/Material";
import { QuadMesh } from "./QuadMesh";

export class GridMesh extends QuadMesh {

  private _darkMode: boolean = false;

  constructor(webgl: WebGL, size: vec2) {
    super(webgl, new Material(webgl, 'grid'));
    this.material.cullFace = false;
    this.rotation =[-Math.PI / 2, 0, 0];
    this.scale = [size[0], size[1], 1];
    this.material.uniform('u_resolution', { type: 'vec2', value: size });
    this.material.uniform('u_dark_mode', { type: 'boolean', value: this._darkMode });
  }

  public set darkMode(d: boolean) {
    this._darkMode = d;
    this.material.uniform('u_dark_mode', { type: 'boolean', value: this._darkMode });
  }

  public get darkMode(): boolean {
    return this._darkMode;
  }
}