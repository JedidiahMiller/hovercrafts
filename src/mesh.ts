import { Gltf } from "@/lib/static-gltf.js";
import { VertexAttributes } from "@/lib/vertex-attributes.js";
import { ShaderProgram } from "@/lib/shader-program.js";
import { VertexArray } from "@/lib/vertex-array.js";

export class MeshLoader {
  /**
   * Loads a mesh into a Vao
   */
  static async getVao(
    source: string,
    vertexSource: string,
    fragmentSource: string
  ) {
    const gltf = await Gltf.readFromUrl(source);

    const mesh = gltf.meshes[0];

    // Create the vertex attributes
    const attributes = new VertexAttributes();
    attributes.addAttribute(
      "position",
      mesh.positions.count,
      3,
      mesh.positions.buffer
    );
    attributes.addAttribute(
      "normal",
      mesh.normals!.count,
      3,
      mesh.normals!.buffer
    );

    // Add colors if they exist
    if (mesh.colors) {
      attributes.addAttribute(
        "color",
        mesh.colors!.count,
        3,
        mesh.colors!.buffer
      );
    }

    // Indices
    attributes.addIndices(new Uint32Array(mesh.indices!.buffer));

    // Package and return
    const shader = new ShaderProgram(vertexSource, fragmentSource);
    return new VertexArray(shader, attributes);
  }
}
