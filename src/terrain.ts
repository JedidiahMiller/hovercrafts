import { Mesh } from "./mesh.js";

export class TerrainMesh {
  mesh: Mesh;
  speed: number;

  constructor(mesh: Mesh, speed: number) {
    this.mesh = mesh;
    this.speed = speed;
  }
}
