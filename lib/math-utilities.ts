export function lerp(a: number, b: number, t: number) {
  // t is a proportion in [0, 1]. It it's 0.2, we
  // take 80% of a and 20% of b.
  return a * (1 - t) + b * t;
}