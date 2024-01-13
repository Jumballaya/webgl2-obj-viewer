import { vec3 } from "gl-matrix";
import { Light } from "./Light";
import { LightManager } from "./LightManager";
import { WebGL } from "../../gl/WebGL";

export class SpotLight extends Light {
    public direction: vec3 = [0, 0, 0];

    public innerAngle: number = Math.PI / 4;
    public outerAngle: number = Math.PI / 3;

    constructor(manager: LightManager, webgl: WebGL) {
        super(manager, 'spot', webgl);
    }
}