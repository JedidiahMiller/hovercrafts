import { Field2 } from "./field.js";
import { Matrix4 } from "./matrix.js";
import { Vector3 } from "./vector.js";

export class FirstPersonCamera {
  from: Vector3;
  worldUp: Vector3;
  forward: Vector3;
  right!: Vector3;
  eyeFromWorld!: Matrix4;

  constructor(from: Vector3, to: Vector3, worldUp: Vector3) {
    this.forward = to.subtract(from).normalize();
    this.from = from;
    this.worldUp = worldUp;
    this.reorient();
  }

  reorient() {
    this.eyeFromWorld = Matrix4.look(this.from, this.forward, this.worldUp);
    this.right = new Vector3(
      this.eyeFromWorld.get(0, 0),
      this.eyeFromWorld.get(0, 1),
      this.eyeFromWorld.get(0, 2)
    );
  }

  strafe(distance: number) {
    this.from = this.from.add(this.right.scalarMultiply(distance));
    this.reorient();
  }

  advance(distance: number) {
    this.from = this.from.add(this.forward.scalarMultiply(distance));
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

export class TerrainCamera {
  from: Vector3;
  worldUp: Vector3;
  forward: Vector3;
  right!: Vector3;
  eyeFromWorld!: Matrix4;
  field: Field2;
  offset: number;
  factors: Vector3;

  constructor(from: Vector3, to: Vector3, field: Field2, offset: number, factors: Vector3) {
    this.forward = to.subtract(from).normalize();
    this.from = from;
    this.worldUp = new Vector3(0, 1, 0);
    this.field = field;
    this.offset = offset;
    this.factors = factors;
    this.adjustY();
    this.reorient();
  }

  reorient() {
    this.eyeFromWorld = Matrix4.look(this.from, this.forward, this.worldUp);
    this.right = new Vector3(
      this.eyeFromWorld.get(0, 0),
      this.eyeFromWorld.get(0, 1),
      this.eyeFromWorld.get(0, 2)
    );
  }

  strafe(distance: number) {
    this.from = this.from.add(this.right.scalarMultiply(distance));
    this.adjustY();
    this.reorient();
  }

  advance(distance: number) {
    this.from = this.from.add(this.forward.scalarMultiply(distance));
    this.adjustY();
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

  adjustY() {
    const x = this.from.x / this.factors.x;
    const z = this.from.z / this.factors.z;
    const height = this.field.blerp(x, z);
    this.from.y = height * this.factors.y + this.offset;
  }

}