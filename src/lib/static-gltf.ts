export type AssociationType =
  | "SCALAR"
  | "VEC2"
  | "VEC3"
  | "VEC4"
  | "MAT2"
  | "MAT3"
  | "MAT4";

namespace meta {
  export type Index = number;

  /**
   * Indices of those attributes that deviate from their initialization value.
   */
  export interface AccessorSparseIndices {
    /**
     * The index of the bufferView with sparse indices. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
     */
    bufferView: Index;
    /**
     * The offset relative to the start of the bufferView in bytes. Must be aligned.
     */
    byteOffset?: number;
    /**
     * The indices data type.
     */
    componentType: 5121 | 5123 | 5125 | number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * Array of size `accessor.sparse.count` times number of components storing the displaced accessor attributes pointed by `accessor.sparse.indices`.
   */
  export interface AccessorSparseValues {
    /**
     * The index of the bufferView with sparse values. Referenced bufferView can't have ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER target.
     */
    bufferView: Index;
    /**
     * The offset relative to the start of the bufferView in bytes. Must be aligned.
     */
    byteOffset?: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * Sparse storage of attributes that deviate from their initialization value.
   */
  export interface AccessorSparse {
    /**
     * Number of entries stored in the sparse array.
     */
    count: number;
    /**
     * Index array of size `count` that points to those accessor attributes that deviate from their initialization value. Indices must strictly increase.
     */
    indices: AccessorSparseIndices;
    /**
     * Array of size `count` times number of components, storing the displaced accessor attributes pointed by `indices`. Substituted values must have the same `componentType` and number of components as the base accessor.
     */
    values: AccessorSparseValues;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * A typed view into a bufferView.  A bufferView contains raw binary data.  An accessor provides a typed view into a bufferView or a subset of a bufferView similar to how WebGL's `vertexAttribPointer()` defines an attribute in a buffer.
   */

  export interface Accessor {
    /**
     * The index of the bufferView.
     */
    bufferView?: Index;
    /**
     * The offset relative to the start of the bufferView in bytes.
     */
    byteOffset?: number;
    /**
     * The datatype of components in the attribute.
     */
    componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
    /**
     * Specifies whether integer data values should be normalized.
     */
    normalized?: boolean;
    /**
     * The number of attributes referenced by this accessor.
     */
    count: number;
    type: AssociationType;
    /**
     * Maximum value of each component in this attribute.
     */
    max?: number[];
    /**
     * Minimum value of each component in this attribute.
     */
    min?: number[];
    /**
     * Sparse storage of attributes that deviate from their initialization value.
     */
    sparse?: AccessorSparse;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  /**
   * Metadata about the glTF asset.
   */
  export interface Asset {
    /**
     * A copyright message suitable for display to credit the content creator.
     */
    copyright?: string;
    /**
     * Tool that generated this glTF model.  Useful for debugging.
     */
    generator?: string;
    /**
     * The glTF version that this asset targets.
     */
    version: string;
    /**
     * The minimum glTF version that this asset targets.
     */
    minVersion?: string;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * A buffer points to binary geometry, animation, or skins.
   */
  export interface Buffer {
    /**
     * The uri of the buffer.
     */
    uri?: string;
    /**
     * The length of the buffer in bytes.
     */
    byteLength: number;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * A view into a buffer generally representing a subset of the buffer.
   */
  export interface BufferView {
    /**
     * The index of the buffer.
     */
    buffer: Index;
    /**
     * The offset into the buffer in bytes.
     */
    byteOffset?: number;
    /**
     * The total byte length of the buffer view.
     */
    byteLength: number;
    /**
     * The stride, in bytes.
     */
    byteStride?: number;
    /**
     * The target that the GPU buffer should be bound to.
     */
    target?: 34962 | 34963 | number;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  /**
   * Geometry to be rendered with the given material.
   */
  export interface MeshPrimitive {
    /**
     * A dictionary object, where each key corresponds to mesh attribute semantic and each value is the index of the accessor containing attribute's data.
     */
    attributes: {
      [k: string]: Index;
    };
    /**
     * The index of the accessor that contains the indices.
     */
    indices?: Index;
    /**
     * The index of the material to apply to this primitive when rendering.
     */
    material?: Index;
    /**
     * The type of primitives to render.
     */
    mode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
    /**
     * An array of Morph Targets, each  Morph Target is a dictionary mapping attributes (only `POSITION`, `NORMAL`, and `TANGENT` supported) to their deviations in the Morph Target.
     */
    targets?: {
      [k: string]: Index;
    }[];
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * A set of primitives to be rendered.  A node can contain one mesh.  A node's transform places the mesh in the scene.
   */
  export interface Mesh {
    /**
     * An array of primitives, each defining geometry to be rendered with a material.
     */
    primitives: MeshPrimitive[];
    /**
     * Array of weights to be applied to the Morph Targets.
     */
    weights?: number[];
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
  /**
   * A node in the node hierarchy.  When the node contains `skin`, all `mesh.primitives` must contain `JOINTS_0` and `WEIGHTS_0` attributes.  A node can have either a `matrix` or any combination of `translation`/`rotation`/`scale` (TRS) properties. TRS properties are converted to matrices and postmultiplied in the `T * R * S` order to compose the transformation matrix; first the scale is applied to the vertices, then the rotation, and then the translation. If none are provided, the transform is the identity. When a node is targeted for animation (referenced by an animation.channel.target), only TRS properties may be present; `matrix` will not be present.
   */
  export interface Node {
    /**
     * The indices of this node's children.
     */
    children?: Index[];
    name?: string;
    /**
     * The index of the mesh in this node.
     */
    mesh?: Index;
  }

  export interface Scene {
    nodes: Index[];
  }

  export interface Root {
    /**
     * Names of glTF extensions used somewhere in this asset.
     */
    extensionsUsed?: string[];
    /**
     * Names of glTF extensions required to properly load this asset.
     */
    extensionsRequired?: string[];
    accessors: Accessor[];
    /**
     * An array of keyframe animations.
     */
    animations?: Animation[];
    /**
     * Metadata about the glTF asset.
     */
    asset: Asset;
    buffers: Buffer[];
    bufferViews: BufferView[];
    meshes: Mesh[];
    nodes: Node[];
    scene: Index;
    scenes: Scene[];
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
}

export interface Node {
  id: number;
  name: string;
  children: number[];
}

export enum BufferType {
  UnsignedByte = 5121,
  Short = 5123,
  Int = 5125,
  Float = 5126,
}

export interface Buffer {
  count: number;
  associationType: AssociationType;
  componentType: BufferType;
  componentCount: number;
}

export interface IntBuffer extends Buffer {
  buffer: Uint16Array | Uint32Array | Uint8Array;
}

export interface FloatBuffer extends Buffer {
  buffer: Float32Array;
}

export interface Mesh {
  elementCount: number;
  indices: IntBuffer | null;
  positions: FloatBuffer;
  normals: FloatBuffer | null;
  colors: FloatBuffer | null;
  tangents: FloatBuffer | null;
  texCoord: FloatBuffer | null;
  joints: FloatBuffer | null;
  weights: FloatBuffer | null;
}

interface StringToNumber {
  [key: string]: number;
}

const componentCounts: StringToNumber = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

async function readExternalBuffer(path: string, buffer: string) {
  // The external buffers are in the same directory as the model file.
  // We extract the parent directory from the path.
  const directory = path.split("/").slice(0, -1).join("/");
  const response = await fetch(`${directory}/${buffer}`);
  return await response.arrayBuffer();
}

function extractBuffer(
  gltf: meta.Root,
  buffers: ArrayBuffer[],
  accessor: meta.Accessor,
): FloatBuffer | IntBuffer {
  const bufferView = gltf.bufferViews![accessor.bufferView as number];
  // How many numbers is each sample?
  const componentCount = componentCounts[accessor.type];
  const componentType = accessor.componentType as BufferType;
  const associationType = accessor.type;
  const offset = (accessor.byteOffset || 0) + (bufferView.byteOffset || 0);
  const count = accessor.count;

  let buffer;
  if (componentType == BufferType.Float) {
    buffer = new Float32Array(
      buffers[bufferView.buffer],
      offset,
      accessor.count * componentCount,
    );
    return {
      componentCount,
      buffer,
      associationType,
      componentType,
      count,
    } as FloatBuffer;
  } else if (componentType == BufferType.Int) {
    buffer = new Uint32Array(
      buffers[bufferView.buffer],
      offset,
      accessor.count * componentCount,
    );
    return {
      componentCount,
      buffer,
      associationType,
      componentType,
      count,
    } as IntBuffer;
  } else if (componentType == BufferType.Short) {
    buffer = new Uint16Array(
      buffers[bufferView.buffer],
      offset,
      accessor.count * componentCount,
    );
    return {
      componentCount,
      buffer,
      associationType,
      componentType,
      count,
    } as IntBuffer;
  } else if (componentType == BufferType.UnsignedByte) {
    buffer = new Uint8Array(
      buffers[bufferView.buffer],
      offset,
      accessor.count * componentCount,
    );
    return {
      componentCount,
      buffer,
      associationType,
      componentType,
      count,
    } as IntBuffer;
  } else {
    throw `unknown component type ${componentType}`;
  }
}

function getAccessor(gltf: meta.Root, mesh: meta.Mesh, attributeName: string) {
  const attribute = mesh.primitives[0].attributes[attributeName];
  return gltf.accessors[attribute];
}

function extractNamedBuffer(
  gltf: meta.Root,
  buffers: ArrayBuffer[],
  mesh: meta.Mesh,
  name: string,
) {
  if (mesh.primitives[0].attributes[name] === undefined) {
    return null;
  }

  const accessor = getAccessor(gltf, mesh, name);
  return extractBuffer(gltf, buffers, accessor);
}

function extractNodes(index: number, node: meta.Node): Node {
  return {
    id: index,
    name: node.name,
    children: node.children || [],
    mesh: node.mesh,
  } as Node;
}

function extractMesh(gltf: meta.Root, mesh: meta.Mesh, buffers: ArrayBuffer[]) {
  let indices: {
    buffer: Uint8Array | Uint16Array | Uint32Array;
    count: number;
  } | null = null;

  // TODO: this only loads the first part of the mesh.
  if (mesh.primitives[0].indices) {
    const indexAccessor = gltf.accessors[mesh.primitives[0].indices];
    const indexBuffer = extractBuffer(
      gltf,
      buffers,
      indexAccessor,
    ) as IntBuffer;
    indices = {
      buffer: indexBuffer.buffer,
      count: indexBuffer.buffer.length,
    };
  }

  return {
    indices,
    positions: extractNamedBuffer(gltf, buffers, mesh, "POSITION"),
    colors: extractNamedBuffer(gltf, buffers, mesh, "COLOR_0"),
    normals: extractNamedBuffer(gltf, buffers, mesh, "NORMAL"),
    tangents: extractNamedBuffer(gltf, buffers, mesh, "TANGENT"),
  } as Mesh;
}

export class Gltf {
  name: string;
  meshes: Mesh[];
  nodes: Node[];

  constructor(name: string, meshes: Mesh[], nodes: Node[]) {
    this.name = name;
    this.meshes = meshes;
    this.nodes = nodes;
  }

  static async readFromUrl(url: string) {
    const response = await fetch(url);
    const gltf = (await response.json()) as meta.Root;

    // TODO: assign defaults.

    // Read in all external buffers, like textures.
    const bufferPromises = gltf.buffers.map((buffer) =>
      readExternalBuffer(url, buffer.uri!),
    );
    const buffers = await Promise.all(bufferPromises);

    // glTF files may have multiple scenes. A scene has a list of nodes. Nodes
    // individually specify transformations, meshes, and children, forming a
    // scene graph. The scene's nodes are the roots of separate graphs.
    const scene = gltf.scenes[gltf.scene];

    // Extract the meshes.
    const meshes = gltf.meshes.map((mesh) => extractMesh(gltf, mesh, buffers));

    const rootNode = scene.nodes[0];
    const nodes = gltf.nodes.map((node, i) => extractNodes(i, node));

    // Use last component as name.
    const pathComponents = url.split("/");
    const name = pathComponents[pathComponents.length - 1];

    return new Gltf(name, meshes, nodes);
  }
}
