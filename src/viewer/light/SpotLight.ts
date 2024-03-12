import { vec3 } from "gl-matrix";
import { Light } from "./Light";
import { LightManager } from "./LightManager";
import { WebGL } from "../../gl/WebGL";

export class SpotLight extends Light {
  private _direction: vec3 = [0, 0, 0];

  private _innerAngle: number = Math.PI / 4;
  private _outerAngle: number = Math.PI / 3;

  constructor(manager: LightManager, webgl: WebGL) {
    super(manager, "spot", webgl);
  }

  public get direction(): vec3 {
    return [this._direction[0], this._direction[1], this._direction[2]];
  }

  public set direction(d: vec3) {
    this._direction = [d[0], d[1], d[2]];
    this.manager.updateLight(this);
  }

  public get outerAngle(): number {
    return this._outerAngle;
  }

  public set outerAngle(a: number) {
    this._outerAngle = a;
    this.manager.updateLight(this);
  }

  public get innerAngle(): number {
    return this._innerAngle;
  }

  public set innerAngle(a: number) {
    this._innerAngle = a;
    this.manager.updateLight(this);
  }
}
