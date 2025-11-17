import { Vector3 } from "./vector.js";

export function intersectRaySphere(rayStart: Vector3, rayDirection: Vector3, sphereCenter: Vector3, sphereRadius: number) {
  const centerToStart = rayStart.subtract(sphereCenter);
  const a = rayDirection.dot(rayDirection);
  const b = 2 * centerToStart.dot(rayDirection);
  const c = centerToStart.dot(centerToStart) - sphereRadius * sphereRadius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return [];
  } else {
    const offset = Math.sqrt(discriminant);
    const t0 = (-b - offset) / (2 * a);
    const t1 = (-b + offset) / (2 * a);
    if (discriminant > 0) {
      return [
        rayStart.add(rayDirection.scalarMultiply(t0)),
        rayStart.add(rayDirection.scalarMultiply(t1))
      ];
    } else {
      return [
        rayStart.add(rayDirection.scalarMultiply(t0)),
      ];
    }
  }
}

export function intersectRayBox(rayStart: Vector3, rayDirection: Vector3, boxMin: Vector3, boxMax: Vector3) {
  // Intersect the ray with the left and right planes.
  let t0 = (boxMin.x - rayStart.x) / rayDirection.x;
  let t1 = (boxMax.x - rayStart.x) / rayDirection.x;

  // Swap to keep t0 the smaller of the two.
  if (t0 > t1) {
    const tmp = t0;
    t0 = t1;
    t1 = tmp;
  }

  // Intersect the ray with the bottom and top planes.
  let ty0 = (boxMin.y - rayStart.y) / rayDirection.y;
  let ty1 = (boxMax.y - rayStart.y) / rayDirection.y;

  if (ty0 > ty1) {
    const tmp = ty0;
    ty0 = ty1;
    ty1 = tmp;
  }

  // If we've exited one dimension before starting another, bail.
  if (t0 > ty1 || ty0 > t1) return [];

  // Keep greater t*0 and smaller t*1.
  if (ty0 > t0) t0 = ty0;
  if (ty1 < t1) t1 = ty1;

  // Intersect the ray with the near and far planes.
  let tz0 = (boxMin.z - rayStart.z) / rayDirection.z;
  let tz1 = (boxMax.z - rayStart.z) / rayDirection.z;

  if (tz0 > tz1) {
    const tmp = tz0;
    tz0 = tz1;
    tz1 = tmp;
  }

  // If we've exited one dimension before starting another, bail.
  if (t0 > tz1 || tz0 > t1) return [];

  // Keep greater t*0 and smaller t*1.
  if (tz0 > t0) t0 = tz0;
  if (tz1 < t1) t1 = tz1;

  // Locate two points on ray.
  return [
    rayStart.add(rayDirection.scalarMultiply(t0)),
    rayStart.add(rayDirection.scalarMultiply(t1)),
  ];
}