import { Vector3 } from "./vector.js";
import { Vector4 } from "./vector.js";

export class Matrix4 {
  elements: Float32Array;

  constructor() {
    this.elements = new Float32Array(16);
  }

  get(r: number, c: number) {
    return this.elements[c * 4 + r];
  }

  set(r: number, c: number, value: number) {
    this.elements[c * 4 + r] = value;
  }

  static identity() {
    const m = new Matrix4();
    m.set(0, 0, 1);
    m.set(1, 1, 1);
    m.set(2, 2, 1);
    m.set(3, 3, 1);
    return m;
  }

  static scale(factorX: number, factorY: number, factorZ: number) {
    const m = Matrix4.identity();
    m.set(0, 0, factorX);
    m.set(1, 1, factorY);
    m.set(2, 2, factorZ);
    return m;
  }

  static translate(offsetX: number, offsetY: number, offsetZ: number) {
    const m = Matrix4.identity();
    m.set(0, 3, offsetX);
    m.set(1, 3, offsetY);
    m.set(2, 3, offsetZ);
    return m;
  }

  static rotateZ(degrees: number) {
    const radians = degrees * Math.PI / 180;
    const m = Matrix4.identity();
    m.set(0, 0, Math.cos(radians));
    m.set(0, 1, -Math.sin(radians));
    m.set(1, 0, Math.sin(radians));
    m.set(1, 1, Math.cos(radians));
    return m;
  }

  static rotateX(degrees: number) {
    const radians = degrees * Math.PI / 180;
    const m = Matrix4.identity();
    m.set(1, 1, Math.cos(radians));
    m.set(1, 2, -Math.sin(radians));
    m.set(2, 1, Math.sin(radians));
    m.set(2, 2, Math.cos(radians));
    return m;
  }

  static rotateY(degrees: number) {
    const radians = degrees * Math.PI / 180;
    const m = Matrix4.identity();
    m.set(0, 0, Math.cos(radians));
    m.set(0, 2, -Math.sin(radians));
    m.set(2, 0, Math.sin(radians));
    m.set(2, 2, Math.cos(radians));
    return m;
  }

  multiplyMatrix(that: Matrix4) {
    const m = new Matrix4();

    for (let r = 0; r < 4; ++r) {
      for (let c = 0; c < 4; ++c) {
        const dot = 
          this.get(r, 0) * that.get(0, c) +
          this.get(r, 1) * that.get(1, c) +
          this.get(r, 2) * that.get(2, c) +
          this.get(r, 3) * that.get(3, c);
        m.set(r, c, dot);
      }
    }
    return m;
  }

  static ortho(left: number, right: number,
             bottom: number, top: number,
             near: number, far: number) {
    const m = Matrix4.identity();
    const width = right - left;
    const height = top - bottom;
    const depth = far - near;
    m.set(0, 0, 2 / width);
    m.set(0, 3, -(right + left) / width);
    m.set(1, 1, 2 / height);
    m.set(1, 3, -(top + bottom) / height);
    m.set(2, 2, 2 / -depth);
    m.set(2, 3, -(near + far) / depth);
    return m;
  }

  static perspective(fovY: number, aspectRatio: number,
                   near: number, far: number) {
    const m = Matrix4.identity();
    const radians = fovY * Math.PI / 180 * 0.5;
    const top = Math.tan(radians) * near;
    const right = aspectRatio * top;
    m.set(0, 0, near / right);
    m.set(1, 1, near / top);
    m.set(2, 2, (near + far) / (near - far));
    m.set(2, 3, (2 * near * far) / (near - far));
    m.set(3, 2, -1);
    m.set(3, 3, 0);
    return m;
  }

  static look(from: Vector3, forward: Vector3, worldUp: Vector3) {
    const right = forward.cross(worldUp).normalize();
    const realUp = right.cross(forward).normalize(); // Think of looking down from a hill

    const rotater = Matrix4.identity();

    rotater.set(0, 0, right.x);
    rotater.set(0, 1, right.y);
    rotater.set(0, 2, right.z);

    rotater.set(1, 0, realUp.x);
    rotater.set(1, 1, realUp.y);
    rotater.set(1, 2, realUp.z);

    rotater.set(2, 0, -forward.x);
    rotater.set(2, 1, -forward.y);
    rotater.set(2, 2, -forward.z);

    const translater = Matrix4.translate(-from.x, -from.y, -from.z);
    const eyeFromWorld = rotater.multiplyMatrix(translater);

    return eyeFromWorld;
  }

  static rotateAround(axis: Vector3, degrees: number) {
    const m = Matrix4.identity();

    const radians = degrees * Math.PI / 180;
    const s = Math.sin(radians);
    const c = Math.cos(radians);
    const d = 1 - c;

    m.set(0, 0, d * axis.x * axis.x + c);
    m.set(0, 1, d * axis.x * axis.y - s * axis.z);
    m.set(0, 2, d * axis.x * axis.z + s * axis.y);

    m.set(1, 0, d * axis.y * axis.x + s * axis.z);
    m.set(1, 1, d * axis.y * axis.y + c);
    m.set(1, 2, d * axis.y * axis.z - s * axis.x);

    m.set(2, 0, d * axis.z * axis.x - s * axis.y);
    m.set(2, 1, d * axis.z * axis.y + s * axis.x);
    m.set(2, 2, d * axis.z * axis.z + c);

    return m;
  }

  multiplyPosition(v: Vector3) {
    const x = this.get(0, 0) * v.x + this.get(0, 1) * v.y + this.get(0, 2) * v.z + this.get(0, 3);
    const y = this.get(1, 0) * v.x + this.get(1, 1) * v.y + this.get(1, 2) * v.z + this.get(1, 3);
    const z = this.get(2, 0) * v.x + this.get(2, 1) * v.y + this.get(2, 2) * v.z + this.get(2, 3);

    return new Vector3(x, y, z);
  }


  multiplyVector4(v: Vector4) {
    return new Vector4(
      this.get(0, 0) * v.x + this.get(0, 1) * v.y + this.get(0, 2) * v.z + this.get(0, 3) * v.w,
      this.get(1, 0) * v.x + this.get(1, 1) * v.y + this.get(1,2) * v.z + this.get(1,3) * v.w,
      this.get(2, 0) * v.x + this.get(2, 1) * v.y + this.get(2, 2) * v.z + this.get(2, 3) * v.w,
      this.get(3, 0) * v.x + this.get(3, 1) * v.y + this.get(3, 2) * v.z + this.get(3, 3) * v.w
    );
  }

  inverse() {
    let m = new Matrix4();

    let a0 = this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);
    let a1 = this.get(0, 0) * this.get(1, 2) - this.get(0, 2) * this.get(1, 0);
    let a2 = this.get(0, 0) * this.get(1, 3) - this.get(0, 3) * this.get(1, 0);

    let a3 = this.get(0, 1) * this.get(1, 2) - this.get(0, 2) * this.get(1, 1);
    let a4 = this.get(0, 1) * this.get(1, 3) - this.get(0, 3) * this.get(1, 1);
    let a5 = this.get(0, 2) * this.get(1, 3) - this.get(0, 3) * this.get(1, 2);

    let b0 = this.get(2, 0) * this.get(3, 1) - this.get(2, 1) * this.get(3, 0);
    let b1 = this.get(2, 0) * this.get(3, 2) - this.get(2, 2) * this.get(3, 0);
    let b2 = this.get(2, 0) * this.get(3, 3) - this.get(2, 3) * this.get(3, 0);

    let b3 = this.get(2, 1) * this.get(3, 2) - this.get(2, 2) * this.get(3, 1);
    let b4 = this.get(2, 1) * this.get(3, 3) - this.get(2, 3) * this.get(3, 1);
    let b5 = this.get(2, 2) * this.get(3, 3) - this.get(2, 3) * this.get(3, 2);

    let determinant = a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;

    if (determinant != 0) {
      let inverseDeterminant = 1 / determinant;
      m.set(0, 0, (+this.get(1, 1) * b5 - this.get(1, 2) * b4 + this.get(1, 3) * b3) * inverseDeterminant);
      m.set(0, 1, (-this.get(0, 1) * b5 + this.get(0, 2) * b4 - this.get(0, 3) * b3) * inverseDeterminant);
      m.set(0, 2, (+this.get(3, 1) * a5 - this.get(3, 2) * a4 + this.get(3, 3) * a3) * inverseDeterminant);
      m.set(0, 3, (-this.get(2, 1) * a5 + this.get(2, 2) * a4 - this.get(2, 3) * a3) * inverseDeterminant);
      m.set(1, 0, (-this.get(1, 0) * b5 + this.get(1, 2) * b2 - this.get(1, 3) * b1) * inverseDeterminant);
      m.set(1, 1, (+this.get(0, 0) * b5 - this.get(0, 2) * b2 + this.get(0, 3) * b1) * inverseDeterminant);
      m.set(1, 2, (-this.get(3, 0) * a5 + this.get(3, 2) * a2 - this.get(3, 3) * a1) * inverseDeterminant);
      m.set(1, 3, (+this.get(2, 0) * a5 - this.get(2, 2) * a2 + this.get(2, 3) * a1) * inverseDeterminant);
      m.set(2, 0, (+this.get(1, 0) * b4 - this.get(1, 1) * b2 + this.get(1, 3) * b0) * inverseDeterminant);
      m.set(2, 1, (-this.get(0, 0) * b4 + this.get(0, 1) * b2 - this.get(0, 3) * b0) * inverseDeterminant);
      m.set(2, 2, (+this.get(3, 0) * a4 - this.get(3, 1) * a2 + this.get(3, 3) * a0) * inverseDeterminant);
      m.set(2, 3, (-this.get(2, 0) * a4 + this.get(2, 1) * a2 - this.get(2, 3) * a0) * inverseDeterminant);
      m.set(3, 0, (-this.get(1, 0) * b3 + this.get(1, 1) * b1 - this.get(1, 2) * b0) * inverseDeterminant);
      m.set(3, 1, (+this.get(0, 0) * b3 - this.get(0, 1) * b1 + this.get(0, 2) * b0) * inverseDeterminant);
      m.set(3, 2, (-this.get(3, 0) * a3 + this.get(3, 1) * a1 - this.get(3, 2) * a0) * inverseDeterminant);
      m.set(3, 3, (+this.get(2, 0) * a3 - this.get(2, 1) * a1 + this.get(2, 2) * a0) * inverseDeterminant);
    } else {
      throw Error('Matrix is singular.');
    }

    return m;
  }

  clone() {
    const m = new Matrix4();
    for (let i = 0; i < 16; i++) {
      m.elements[i] = this.elements[i];
    }
    return m;
  }
}