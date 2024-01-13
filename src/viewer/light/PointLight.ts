import { WebGL } from "../../gl/WebGL";
import { Light } from "./Light";
import { LightManager } from "./LightManager";

export class PointLight extends Light {
    constructor(manager: LightManager, webgl: WebGL) {
        super(manager, 'point', webgl);
    }
}