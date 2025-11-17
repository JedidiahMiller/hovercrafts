import { Matrix4 } from "@/lib/matrix.js";

export class Quaternion {
  xyzw: number[];

  constructor(x: number, y: number, z: number, w: number) {
    this.xyzw = [x, y, z, w];
  }

  get x() {
    return this.xyzw[0];
  }

  get y() {
    return this.xyzw[1];
  }

  get z() {
    return this.xyzw[2];
  }

  get w() {
    return this.xyzw[3];
  }

  set x(value: number) {
    this.xyzw[0] = value;
  }

  set y(value: number) {
    this.xyzw[1] = value;
  }

  set z(value: number) {
    this.xyzw[2] = value;
  }

  set w(value: number) {
    this.xyzw[3] = value;
  }

  negate() {
    return new Quaternion(-this.x, -this.y, -this.z, -this.w);
  }

  slerp(that: Quaternion, t: number) {
    // How aligned are the two quaternions? Find their dot product. Since
    // they're normalized, the dot product is also their cosine.
    let cosine =
      this.x * that.x + this.y * that.y + this.z * that.z + this.w * that.w;

    // Flip that vector if their alignment is negative.
    if (cosine < 0.0) {
      cosine = -cosine;
      that = that.negate();
    }

    // We'll make a weighted blend of the two quaternions. How we compute the
    // weights depends on their alignment.
    let a;
    let b;

    // If cosine is near 1, the quaternions are nearly aligned already, so we
    // blend linearly.
    if (1 - cosine <= 0.0001) {
      a = 1 - t;
      b = t;
    } else {
      let radians = Math.acos(cosine);
      let sine = Math.sin(radians);
      a = Math.sin((1.0 - t) * radians) / sine;
      b = Math.sin(t * radians) / sine;
    }

    return new Quaternion(
      a * this.x + b * that.x,
      a * this.y + b * that.y,
      a * this.z + b * that.z,
      a * this.w + b * that.w
    );
  }

  toMatrix4() {
    let m = Matrix4.identity();

    // Double the axis components.
    let x2 = this.x * 2;
    let y2 = this.y * 2;
    let z2 = this.z * 2;

    let xx = this.x * x2;
    let yx = this.y * x2;
    let yy = this.y * y2;
    let zx = this.z * x2;
    let zy = this.z * y2;
    let zz = this.z * z2;
    let wx = this.w * x2;
    let wy = this.w * y2;
    let wz = this.w * z2;

    m.set(0, 0, 1 - yy - zz);
    m.set(1, 0, yx + wz);
    m.set(2, 0, zx - wy);
    m.set(3, 0, 0);

    m.set(0, 1, yx - wz);
    m.set(1, 1, 1 - xx - zz);
    m.set(2, 1, zy + wx);
    m.set(3, 1, 0);

    m.set(0, 2, zx + wy);
    m.set(1, 2, zy - wx);
    m.set(2, 2, 1 - xx - yy);
    m.set(3, 2, 0);

    m.set(0, 3, 0);
    m.set(1, 3, 0);
    m.set(2, 3, 0);
    m.set(3, 3, 1);

    return m;
  }
}
