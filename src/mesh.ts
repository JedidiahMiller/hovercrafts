import { FloatBuffer, IntBuffer, Gltf } from "@/lib/static-gltf.js";
import { VertexAttributes } from "@/lib/vertex-attributes.js";
import { ShaderProgram } from "@/lib/shader-program.js";
import { VertexArray } from "@/lib/vertex-array.js";
import { Matrix4 } from "./lib/matrix.js";
import { Vector3 } from "./lib/vector.js";

type Hit = {
  distance: number;
  triangle: number;
  position: Vector3;
};

export class Mesh {
  name: string;
  positions: FloatBuffer;
  indices: IntBuffer;
  normals: any;
  colors: any;
  textureCoordinates?: Float32Array;
  textureScale?: [number, number] = [1, 1];

  textureNumber?: number;
  shader!: ShaderProgram;

  worldFromModel?: Matrix4;

  private constructor(
    name: string,
    positions: FloatBuffer,
    indices: IntBuffer
  ) {
    this.name = name;
    this.positions = positions;
    this.indices = indices;
  }

  /**
   * Loads a gltf file
   */
  static async load(source: string) {
    const gltf = await Gltf.readFromUrl(source);

    const meshes: Record<string, Mesh> = {};

    for (let i = 0; i < gltf.nodes.length; i++) {
      const meshName = gltf.nodes[i].name;
      const rawMesh = gltf.meshes[i];
      const mesh = new Mesh(meshName, rawMesh.positions, rawMesh.indices!);

      mesh.colors = rawMesh.colors;
      mesh.normals = rawMesh.normals;
      mesh.textureCoordinates = rawMesh.texCoord?.buffer;

      meshes[meshName] = mesh;
    }

    return meshes;
  }

  applyUniformTextureCoordinates() {
    this.textureCoordinates = new Float32Array(this.positions.count * 2);
    let minX = Infinity,
      maxX = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < this.positions.count; i++) {
      const x = this.positions.buffer[i * 3];
      const z = this.positions.buffer[i * 3 + 2];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    for (let i = 0; i < this.positions.count; i++) {
      const x = this.positions.buffer[i * 3];
      const z = this.positions.buffer[i * 3 + 2];
      this.textureCoordinates[i * 2] = (x - minX) / (maxX - minX);
      this.textureCoordinates[i * 2 + 1] = (z - minZ) / (maxZ - minZ);
    }
  }

  getVao() {
    // Create the vertex attributes
    const attributes = new VertexAttributes();
    attributes.addAttribute(
      "position",
      this.positions.count,
      3,
      this.positions.buffer
    );

    // Add normals if they exist
    if (this.normals) {
      attributes.addAttribute(
        "normal",
        this.normals.count,
        3,
        this.normals.buffer
      );
    }

    // Add colors if they exist
    if (this.colors) {
      attributes.addAttribute(
        "color",
        this.colors!.count,
        3,
        this.colors!.buffer
      );
    }

    // Add texture coordinates if they exist
    if (this.textureCoordinates) {
      attributes.addAttribute(
        "texPosition",
        this.textureCoordinates!.length / 2,
        2,
        this.textureCoordinates!
      );
    }

    // Indices
    attributes.addIndices(new Uint32Array(this.indices.buffer));

    // Package and return
    return new VertexArray(this.shader, attributes);
  }

  getTriangleNormal(tri: number, worldSpace = true) {
    if (!this.normals) return null;

    const idx = this.indices.buffer;
    const nrm = this.normals.buffer;

    // vertex indices
    const i0 = idx[tri * 3] * 3;
    const i1 = idx[tri * 3 + 1] * 3;
    const i2 = idx[tri * 3 + 2] * 3;

    // fetch vertex normals
    const n0 = new Vector3(nrm[i0], nrm[i0 + 1], nrm[i0 + 2]);
    const n1 = new Vector3(nrm[i1], nrm[i1 + 1], nrm[i1 + 2]);
    const n2 = new Vector3(nrm[i2], nrm[i2 + 1], nrm[i2 + 2]);

    // average and normalize
    let n = n0.add(n1).add(n2).normalize();

    // transform to world space if needed
    if (worldSpace && this.worldFromModel) {
      const invT = this.worldFromModel.inverse();
      n = invT.multiplyVector3(n).normalize();
    }

    return n;
  }

  /**
   * Casts a ray from world space into the mesh and returns the closest hit.
   * Returns: { t, tri, hit } or null
   */
  raycastMesh(worldRayOrigin: Vector3, worldRayDir: Vector3) {
    const M = this.worldFromModel!;
    const invM = M.inverse();

    // transform origin into model space
    const modelRayOrigin = invM.multiplyVector3(worldRayOrigin).buffer();

    // transform direction into model space (no translation)
    const modelRayDir = invM.multiplyVector3(worldRayDir).buffer();

    const pos = this.positions.buffer;
    const idx = this.indices.buffer;

    let bestT = Infinity;
    let bestTri = -1;

    for (let i = 0; i < idx.length; i += 3) {
      const ia = idx[i] * 3;
      const ib = idx[i + 1] * 3;
      const ic = idx[i + 2] * 3;

      const a = this.vec3(pos[ia], pos[ia + 1], pos[ia + 2]);
      const b = this.vec3(pos[ib], pos[ib + 1], pos[ib + 2]);
      const c = this.vec3(pos[ic], pos[ic + 1], pos[ic + 2]);

      const t = this.rayTri(modelRayOrigin, modelRayDir, a, b, c);
      if (t !== null && t < bestT) {
        bestT = t;
        bestTri = i / 3;
      }
    }

    if (bestT === Infinity) return null;

    // reconstruct model-space hit point: O + tD
    const modelHit = this.vec3(
      modelRayOrigin[0] + modelRayDir[0] * bestT,
      modelRayOrigin[1] + modelRayDir[1] * bestT,
      modelRayOrigin[2] + modelRayDir[2] * bestT
    );

    // convert fully to world space
    const worldHit = M.multiplyVector3(
      new Vector3(modelHit[0], modelHit[1], modelHit[2])
    );

    const hit: Hit = {
      distance: bestT,
      triangle: bestTri,
      position: worldHit,
    };

    return hit;
  }

  /** Möller–Trumbore */
  private rayTri(
    origin: Float32Array,
    direction: Float32Array,
    a: Float32Array,
    b: Float32Array,
    c: Float32Array
  ) {
    const e1 = this.sub(b, a);
    const e2 = this.sub(c, a);
    const p = this.cross(direction, e2);

    const det = this.dot(e1, p);
    if (Math.abs(det) < 1e-6) return null;

    const inv = 1.0 / det;
    const tvec = this.sub(origin, a);

    const u = this.dot(tvec, p) * inv;
    if (u < 0 || u > 1) return null;

    const q = this.cross(tvec, e1);
    const v = this.dot(direction, q) * inv;
    if (v < 0 || u + v > 1) return null;

    const t = this.dot(e2, q) * inv;
    return t > 0 ? t : null;
  }

  private vec3(x: number, y: number, z: number) {
    return new Float32Array([x, y, z]);
  }
  private sub(a: Float32Array, b: Float32Array) {
    return this.vec3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  }
  private dot(a: Float32Array, b: Float32Array) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  private cross(a: Float32Array, b: Float32Array) {
    return this.vec3(
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    );
  }
}
