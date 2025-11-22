import { Prefab } from "./lib/prefab.js";
import { Trimesh } from "./lib/trimesh.js";
import { VertexAttributes } from "./lib/vertex-attributes.js";
import debugVertexSource from "./shaders/debug-vertex.glsl?raw";
import debugFragmentSource from "./shaders/debug-fragment.glsl?raw";
import { VertexArray } from "./lib/vertex-array.js";
import { ShaderProgram } from "./lib/shader-program.js";

export class OrbVisualizer {
  orb: Trimesh;
  shader: ShaderProgram;
  vao: VertexArray;

  constructor(radius: number) {
    this.orb = Prefab.sphere(radius, 5, 5);
    this.shader = new ShaderProgram(debugVertexSource, debugFragmentSource);

    const attributes = new VertexAttributes();
    const positions = this.orb.positionBuffer();
    attributes.addAttribute("position", positions.length, 3, positions);
    attributes.addIndices(this.orb.faceBuffer());

    this.vao = new VertexArray(this.shader, attributes);
  }
}
