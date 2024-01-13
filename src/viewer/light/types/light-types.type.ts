import type { PointLight } from "../PointLight";
import type { SpotLight } from "../SpotLight";

export type LightTypes = {
  'point': PointLight;
  'spot': SpotLight;
};