import { Matrix4 } from "./matrix.js";
import { Vector3 } from "./vector.js";

export class Trackball {
  mouseSphere0!: Vector3;
  dimensions!: Vector3;
  previousRotater: Matrix4;
  rotater: Matrix4;

  constructor() {
    this.previousRotater = Matrix4.identity();
    this.rotater = Matrix4.identity();
  }

  setViewport(width: number, height: number) {
    this.dimensions = new Vector3(width, height, 0);
  }

  pixelsToSphere(mousePixel: Vector3): Vector3 {
    const mouseNormalized = mousePixel
      .divide(this.dimensions)
      .scalarMultiply(2)
      .subtract(new Vector3(1, 1, 1));
    const zSquared =
      1 -
      mouseNormalized.x * mouseNormalized.x -
      mouseNormalized.y * mouseNormalized.y;
    if (zSquared > 0) {
      return new Vector3(
        mouseNormalized.x,
        mouseNormalized.y,
        Math.sqrt(zSquared),
      );
    } else {
      return new Vector3(mouseNormalized.x, mouseNormalized.y, 0).normalize();
    }
  }

  start(mousePixel: Vector3) {
    this.mouseSphere0 = this.pixelsToSphere(mousePixel);
  }

  end() {
    this.previousRotater = this.rotater;
  }

  cancel() {
    this.rotater = this.previousRotater;
  }

  drag(mousePixel: Vector3) {
    const mouseSphereNow = this.pixelsToSphere(mousePixel);
    const dot = this.mouseSphere0.dot(mouseSphereNow);
    if (Math.abs(dot) < 0.999999) {
      const radians = Math.acos(dot);
      const axis = this.mouseSphere0.cross(mouseSphereNow).normalize();
      const rotaterNow = Matrix4.rotateAround(axis, (radians * 180) / Math.PI);
      this.rotater = rotaterNow.multiplyMatrix(this.previousRotater);
    }
  }
}
