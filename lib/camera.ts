import { Matrix4 } from "./matrix.js";
import { Vector3 } from "./vector.js";

export class ThirdPersonCamera {
  anchor: Vector3;
  offset: Vector3;
  worldUp: Vector3;
  forward: Vector3;
  focalDistance: number;
  right!: Vector3;
  eyeFromWorld!: Matrix4;
  worldFromModel!: Matrix4;

  constructor(anchor: Vector3, to: Vector3, offset: Vector3) {
    this.anchor = anchor;
    const eyeToFocus = to.subtract(anchor);
    this.focalDistance = eyeToFocus.magnitude;
    this.forward = eyeToFocus.normalize();
    this.offset = offset;
    this.worldUp = new Vector3(0, 1, 0);
    this.reorient();
  }

  reorient() {
    this.right = this.forward.cross(this.worldUp).normalize();
    const up = this.right.cross(this.forward);
    let avatarRotater = Matrix4.identity();

    avatarRotater.set(0, 0, this.right.x);
    avatarRotater.set(1, 0, this.right.y);
    avatarRotater.set(2, 0, this.right.z);

    avatarRotater.set(0, 1, up.x);
    avatarRotater.set(1, 1, up.y);
    avatarRotater.set(2, 1, up.z);

    avatarRotater.set(0, 2, -this.forward.x);
    avatarRotater.set(1, 2, -this.forward.y);
    avatarRotater.set(2, 2, -this.forward.z);

    let avatarTranslater = Matrix4.translate(
      this.anchor.x,
      this.anchor.y,
      this.anchor.z
    );
    this.worldFromModel = avatarTranslater.multiplyMatrix(avatarRotater);

    const cameraFrom = this.worldFromModel.multiplyPosition(this.offset);
    const focalPoint = this.anchor
      .add(this.forward.scalarMultiply(this.focalDistance));
    const cameraForward = focalPoint.subtract(cameraFrom).normalize();
    this.eyeFromWorld = Matrix4.look(cameraFrom, cameraForward, this.worldUp);

  }

  strafe(distance: number) {
    this.anchor = this.anchor.add(this.right.scalarMultiply(distance));
    this.reorient();
  }

  advance(distance: number) {
    this.anchor = this.anchor.add(this.forward.scalarMultiply(distance));
    this.reorient();
  }

  yaw(degrees: number) {
    const rotation = Matrix4.rotateAround(this.worldUp, degrees);
    this.forward = rotation.multiplyPosition(this.forward);
    this.reorient();
  }

  pitch(degrees: number) {
    const rotation = Matrix4.rotateAround(this.right, degrees);
    this.forward = rotation.multiplyPosition(this.forward);
    this.reorient();
  }
}
