import { Field2 } from "./lib/field.js";
import { ShaderProgram } from "./lib/shader-program.js";
import { Vector3 } from "./lib/vector.js";
import { VertexArray } from "./lib/vertex-array.js";
import { VertexAttributes } from "./lib/vertex-attributes.js";
import { fetchImage } from "./lib/web-utilities.js";

export class Terrain {
  field!: Field2;
  scaler: Vector3;
  vao!: VertexArray;
  shader: ShaderProgram;
  textureScale: number;

  constructor(
    scaler: Vector3,
    shader: ShaderProgram,
    textureScale: number = 1
  ) {
    this.scaler = scaler;
    this.shader = shader;
    this.textureScale = textureScale;
  }

  async loadMap(url: string) {
    const image = await fetchImage(url);
    this.field = Field2.readFromImage(image, this.textureScale);
    const heightmap = this.field.toTrimesh(this.scaler);

    heightmap.computeNormals();

    const attributes = new VertexAttributes();

    attributes.addAttribute(
      "position",
      heightmap.vertexCount,
      3,
      heightmap.positionBuffer()
    );
    attributes.addAttribute(
      "normal",
      heightmap.vertexCount,
      3,
      new Float32Array(heightmap.normalBuffer())
    );
    attributes.addAttribute(
      "texPosition",
      heightmap.texCoordsCount / 2,
      2,
      heightmap.texCoordsBuffer()
    );
    attributes.addIndices(heightmap.faceBuffer());
    this.vao = new VertexArray(this.shader, attributes);
  }

  getGroundHeight(x: number, z: number) {
    return this.field.getHeight(x, z, this.scaler, 0);
  }

  get center() {
    const centerX = (this.field.width - 1) * 0.5 * this.scaler.x;
    const centerZ = (this.field.height - 1) * 0.5 * this.scaler.z;
    const groundY = this.getGroundHeight(centerX, centerZ);
    return new Vector3(centerX, groundY, centerZ);
  }
}
