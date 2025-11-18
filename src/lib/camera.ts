import { Matrix4 } from "@/lib/matrix.js";
import { Vector3 } from "@/lib/vector.js";

export interface Camera {
  eyeFromWorld: Matrix4;
}

export class ThirdPersonCamera implements Camera {
  target: Vector3;
  position: Vector3;
  offset: Vector3;
  worldUp: Vector3;
  forward!: Vector3;
  right!: Vector3;
  eyeFromWorld!: Matrix4;

  constructor(target: Vector3, offset: Vector3, worldUp: Vector3) {
    this.target = target;
    this.offset = offset;
    this.worldUp = worldUp;

    this.position = target.add(offset);
    this.reorient();
  }

  updateTarget(target: Vector3) {
    this.target = target;
    this.position = target.add(this.offset);
    this.reorient();
  }

  reorient() {
    this.forward = this.target.subtract(this.position).normalize();
    this.eyeFromWorld = Matrix4.look(this.position, this.forward, this.worldUp);
    this.right = new Vector3(
      this.eyeFromWorld.get(0, 0),
      this.eyeFromWorld.get(0, 1),
      this.eyeFromWorld.get(0, 2)
    );
  }
}
