import { Circle, interpolateColors, randomInt, vector2 } from "simulationjsv2";
import {
  minStartNutrients,
  minBaseRadius,
  plantColor,
  wiltColor,
  maxStartNutrients,
} from "./constants";

export class Plant {
  private graphic: Circle;
  private nutrients: number;
  private id: number;

  constructor(width: number, height: number, id: number) {
    this.nutrients = randomInt(minStartNutrients, maxStartNutrients);
    this.id = id;

    const scale = this.nutrients / minStartNutrients;
    const radius = minBaseRadius * scale;
    this.graphic = new Circle(
      vector2(randomInt(width), -randomInt(height)),
      radius,
      plantColor
    );
  }

  getPos() {
    return this.graphic.getPos();
  }

  step() {
    const dec = 0.003;
    this.nutrients = Math.max(0, this.nutrients - dec);
    this.updateCircle();
  }

  getNutrients() {
    return this.nutrients;
  }

  addNutrients(nutrients: number) {
    this.nutrients += nutrients;
  }

  removeNutrients(nutrients: number) {
    this.nutrients -= nutrients;
  }

  private updateCircle() {
    const wiltStart = 3;
    if (this.nutrients < wiltStart) {
      const wiltRatio = 1 - this.nutrients / wiltStart;
      const circleColor = interpolateColors(
        [plantColor.clone(), wiltColor.clone()],
        wiltRatio
      );
      this.graphic.fill(circleColor);
    }

    const scale = this.nutrients / minStartNutrients;
    this.graphic.setRadius(minBaseRadius * scale);
  }

  getGraphic() {
    return this.graphic;
  }

  getId() {
    return this.id;
  }
}
