import { lerp } from "@/lib/math-utilities.js";
import { Trimesh } from "@/lib/trimesh.js";
import { Vector3 } from "@/lib/vector.js";

export class Field2 {
  width: number;
  height: number;
  values: number[]; // in [0, 1] and in row-major order

  constructor(width: number, height: number, values: number[]) {
    this.width = width;
    this.height = height;
    this.values = values;
  }

  get2(x: number, y: number): number {
    return this.values[y * this.width + x];
  }

  static readFromImage(image: HTMLImageElement): Field2 {
    // Go through canvas to get the pixel data.
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    const pixels = context.getImageData(0, 0, image.width, image.height);

    // The canvas is RGBA. Extract only the red channel.
    const grays = new Array(image.width * image.height);
    for (let i = 0; i < image.width * image.height; ++i) {
      grays[i] = pixels.data[i * 4] / 255;
    }

    return new Field2(image.width, image.height, grays);
  }

  toTrimesh(factors: Vector3) {
    const positions: Vector3[] = [];
    const texCoords: number[] = [];

    for (let z = 0; z < this.height; ++z) {
      for (let x = 0; x < this.width; ++x) {
        const y = this.get2(x, z);
        positions.push(new Vector3(x, y, z).multiply(factors));
      }
    }

    const index = (x: number, y: number) => {
      return y * this.width + x;
    };

    const faces: number[][] = [];
    for (let y = 0; y < this.height - 1; ++y) {
      for (let x = 0; x < this.width - 1; ++x) {
        const nextX = x + 1;
        const nextY = y + 1;
        faces.push([index(x, y), index(nextX, y), index(x, nextY)]);
        faces.push([index(nextX, y), index(nextX, nextY), index(x, nextY)]);
      }
    }

    const trimesh = new Trimesh(positions, faces);

    for (let z = 0; z < this.height; ++z) {
      for (let x = 0; x < this.width; ++x) {
        const normalizedX = x / (this.width / 4) - 1;
        const normalizedZ = z / (this.height / 4) - 1;
        texCoords.push(normalizedX, normalizedZ);
      }
    }
    trimesh.setTexture(texCoords);
    return trimesh;
  }

  blerp(x: number, y: number): number {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);
    const fractionX = x - floorX;
    const fractionY = y - floorY;

    const bottomLeft = this.get2(floorX, floorY);
    const bottomRight = this.get2(floorX + 1, floorY);
    const topLeft = this.get2(floorX, floorY + 1);
    const topRight = this.get2(floorX + 1, floorY + 1);

    const bottom = lerp(bottomLeft, bottomRight, fractionX);
    const top = lerp(topLeft, topRight, fractionX);
    const middle = lerp(bottom, top, fractionY);

    return middle;
  }

  /**
   * Gets the height of the terrain at the given coordinates
   */
  getHeight(x: number, z: number, factors: Vector3, yOffset = 0) {
    const adjustedX = x / factors.x;
    const adjustedZ = z / factors.z;

    const height = this.blerp(adjustedX, adjustedZ);

    return height * factors.y + yOffset;
  }
}
