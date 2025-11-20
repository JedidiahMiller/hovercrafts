import { Matrix4 } from "@/lib/matrix.js";
import { Vector3 } from "@/lib/vector.js";

export interface Camera {
  eyeFromWorld: Matrix4;
}

export class ThirdPersonCamera implements Camera {
  target: Vector3;
  targetForward: Vector3;
  worldUp: Vector3;
  offset: Vector3;
  cameraRotation: Vector3;
  position!: Vector3;
  forward!: Vector3;
  right!: Vector3;
  up!: Vector3;
  eyeFromWorld!: Matrix4;

  constructor(
    target: Vector3,
    targetForward: Vector3,
    worldUp: Vector3,
    offset: Vector3,
    cameraRotation: Vector3 = new Vector3(0, 0, 0)
  ) {
    this.target = target;
    this.targetForward = targetForward.normalize();
    this.worldUp = worldUp;
    this.offset = offset;
    this.cameraRotation = cameraRotation;
    this.rebuild();
  }

  updateTarget(target: Vector3, targetForward: Vector3) {
    this.target = target;
    this.targetForward = targetForward.normalize();
    this.rebuild();
  }

  rebuild() {
    // eye position
    const eye = this.target
      .subtract(this.targetForward.scalarMultiply(this.offset.z))
      .add(this.worldUp.scalarMultiply(this.offset.y));

    this.position = eye;

    // base direction toward target
    let direction = this.target.subtract(eye).normalize();

    // Apply rotation offsets
    direction = Matrix4.rotateAround(
      this.worldUp.cross(direction),
      this.cameraRotation.x
    ).multiplyVector3(direction);
    direction = Matrix4.rotateY(this.cameraRotation.y).multiplyVector3(
      direction
    );
    direction = Matrix4.rotateAround(
      direction,
      this.cameraRotation.z
    ).multiplyVector3(direction);

    this.forward = direction.normalize();

    // basis
    this.right = this.forward.cross(this.worldUp).normalize();
    this.up = this.right.cross(this.forward);

    this.eyeFromWorld = Matrix4.look(eye, this.forward, this.worldUp);
  }
}
