import { Matrix4 } from "@/lib/matrix.js";
import { Quaternion } from "@/lib/quaternion.js";
import { Vector3 } from "@/lib/vector.js";

// https://github.com/KhronosGroup/glTF-Tutorials/tree/main/gltfTutorial
// https://github.com/larsjarlvik/webgl-gltf/tree/master/src/webgl-gltf

export type AssociationType =
  | "SCALAR"
  | "VEC2"
  | "VEC3"
  | "VEC4"
  | "MAT2"
  | "MAT3"
  | "MAT4";

namespace json {
  export type Index = number;

  export interface AccessorSparseIndices {
    bufferView: Index;
    byteOffset?: number;
    componentType: 5121 | 5123 | 5125 | number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface AccessorSparseValues {
    bufferView: Index;
    byteOffset?: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface AccessorSparse {
    count: number;
    indices: AccessorSparseIndices;
    values: AccessorSparseValues;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Accessor {
    bufferView?: Index;
    byteOffset?: number;
    componentType: 5120 | 5121 | 5122 | 5123 | 5125 | 5126 | number;
    normalized?: boolean;
    count: number;
    type: AssociationType;
    max?: number[];
    min?: number[];
    sparse?: AccessorSparse;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface AnimationChannelTarget {
    node?: Index;
    path: "translation" | "rotation" | "scale" | "weights" | string;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface AnimationChannel {
    sampler: Index;
    target: AnimationChannelTarget;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface AnimationSampler {
    input: Index;
    interpolation?: "LINEAR" | "STEP" | "CUBICSPLINE" | string;
    output: Index;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Animation {
    channels: AnimationChannel[];
    samplers: AnimationSampler[];
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Asset {
    copyright?: string;
    generator?: string;
    version: string;
    minVersion?: string;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Buffer {
    uri?: string;
    byteLength: number;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface BufferView {
    buffer: Index;
    byteOffset?: number;
    byteLength: number;
    byteStride?: number;
    target?: 34962 | 34963 | number;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface CameraOrthographic {
    xmag: number;
    ymag: number;
    zfar: number;
    znear: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface CameraPerspective {
    aspectRatio?: number;
    yfov: number;
    zfar?: number;
    znear: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Camera {
    orthographic?: CameraOrthographic;
    perspective?: CameraPerspective;
    type: "perspective" | "orthographic" | string;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Image {
    uri?: string;
    mimeType?: "image/jpeg" | "image/png" | string;
    bufferView?: Index;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface TextureInfo {
    index: Index;
    texCoord?: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface MaterialPbrMetallicRoughness {
    baseColorFactor?: number[];
    baseColorTexture?: TextureInfo;
    metallicFactor?: number;
    roughnessFactor?: number;
    metallicRoughnessTexture?: TextureInfo;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface MaterialNormalTextureInfo {
    index?: any;
    texCoord?: any;
    scale?: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface MaterialOcclusionTextureInfo {
    index?: any;
    texCoord?: any;
    strength?: number;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Material {
    name?: any;
    extensions?: any;
    extras?: any;
    pbrMetallicRoughness?: MaterialPbrMetallicRoughness;
    normalTexture?: MaterialNormalTextureInfo;
    occlusionTexture?: MaterialOcclusionTextureInfo;
    emissiveTexture?: TextureInfo;
    emissiveFactor?: number[];
    alphaMode?: "OPAQUE" | "MASK" | "BLEND" | string;
    alphaCutoff?: number;
    doubleSided?: boolean;
    [k: string]: any;
  }

  export interface MeshPrimitive {
    attributes: {
      [k: string]: Index;
    };
    indices?: Index;
    material?: Index;
    mode?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | number;
    targets?: {
      [k: string]: Index;
    }[];
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Mesh {
    primitives: MeshPrimitive[];
    weights?: number[];
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Node {
    camera?: Index;
    children?: Index[];
    skin?: Index;
    matrix?: number[];
    mesh?: Index;
    rotation?: number[];
    scale?: number[];
    translation?: number[];
    weights?: number[];
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Sampler {
    magFilter?: 9728 | 9729 | number;
    minFilter?: 9728 | 9729 | 9984 | 9985 | 9986 | 9987 | number;
    wrapS?: 33071 | 33648 | 10497 | number;
    wrapT?: 33071 | 33648 | 10497 | number;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Scene {
    nodes: Index[];
    // name: any;
    // extensions?: any;
    // extras?: any;
    // [k: string]: any;
  }

  export interface Skin {
    inverseBindMatrices?: Index;
    skeleton?: Index;
    joints: Index[];
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Texture {
    sampler: Index;
    source?: Index;
    name?: any;
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }

  export interface Root {
    extensionsUsed?: string[];
    extensionsRequired?: string[];
    accessors: Accessor[];
    animations?: Animation[];
    asset: Asset;
    buffers: Buffer[];
    bufferViews: BufferView[];
    cameras: Camera[];
    images: Image[];
    materials: Material[];
    meshes: Mesh[];
    nodes: Node[];
    samplers: Sampler[];
    scene: Index;
    scenes: Scene[];
    skins: Skin[];
    textures: Texture[];
    extensions?: any;
    extras?: any;
    [k: string]: any;
  }
}

export interface Node {
  id: number;
  name: string;
  children: number[];
  localBindTransform: Matrix4;
  skin?: number;
  mesh?: number;
}

export interface Skin {
  joints: number[];
  inverseBindTransforms: Matrix4[];
}

export interface Animations {
  [name: string]: Channel;
}

export interface Channel {
  [key: number]: Transform;
}

export interface Transform {
  [key: string]: KeyFrame[];

  translation: KeyFrame[];
  rotation: KeyFrame[];
  scale: KeyFrame[];
}

export interface KeyFrame {
  time: number;
  transform: Vector3 | Quaternion;
  type: "translation" | "rotation" | "scale";
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
  colors: FloatBuffer | null;
  normals: FloatBuffer | null;
  tangents: FloatBuffer | null;
  texCoord: FloatBuffer | null;
  joints: FloatBuffer | null;
  weights: FloatBuffer | null;
}

interface ActiveAnimation {
  key: string;
  elapsed: number;
}

const getPreviousAndNextKeyFrame = (
  keyFrames: KeyFrame[],
  animationTime: number,
) => {
  let next = keyFrames[0];
  let previous = keyFrames[0];

  for (let i = 1; i < keyFrames.length; i++) {
    next = keyFrames[i];
    if (next.time > animationTime) break;

    previous = keyFrames[i];
  }

  return { previous, next };
};

const getTransform = (keyFrames: KeyFrame[], duration: number) => {
  if (keyFrames.length === 1) {
    switch (keyFrames[0].type) {
      case "translation":
      case "scale":
        return keyFrames[0].transform as Vector3;
      case "rotation": {
        return keyFrames[0].transform as Quaternion;
      }
    }
  }

  const animationTime =
    (duration / 1000.0) % keyFrames[keyFrames.length - 1].time;
  const frames = getPreviousAndNextKeyFrame(keyFrames, animationTime);
  const progression =
    (animationTime - frames.previous.time) /
    (frames.next.time - frames.previous.time);

  switch (frames.previous.type) {
    case "translation":
    case "scale": {
      const result = (frames.previous.transform as Vector3).lerp(
        frames.next.transform as Vector3,
        progression,
      );
      return result;
    }
    case "rotation": {
      const result = (frames.previous.transform as Quaternion).slerp(
        frames.next.transform as Quaternion,
        progression,
      );
      return result;
    }
  }
};

interface TransformMatrices {
  [key: number]: Matrix4;
}

const get = (c: Transform, elapsed: number) => {
  const t =
    c && c.translation.length > 0
      ? (getTransform(c.translation, elapsed) as Vector3)
      : new Vector3(0, 0, 0);
  const r =
    c && c.rotation.length > 0
      ? (getTransform(c.rotation, elapsed) as Quaternion)
      : new Quaternion(0, 0, 0, 1);
  const s =
    c && c.scale.length > 0
      ? (getTransform(c.scale, elapsed) as Vector3)
      : new Vector3(1, 1, 1);
  return { t, r, s };
};

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

async function getTexture(gl: WebGL2RenderingContext, uri: string) {
  return new Promise<WebGLTexture>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      const ext = gl.getExtension("EXT_texture_filter_anisotropic");
      if (ext) {
        const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      }

      gl.generateMipmap(gl.TEXTURE_2D);
      resolve(texture!);
    };
    img.src = uri;
    img.crossOrigin = "undefined";
  });
}

function extractBuffer(
  gltf: json.Root,
  buffers: ArrayBuffer[],
  accessor: json.Accessor,
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

function getAccessor(gltf: json.Root, mesh: json.Mesh, attributeName: string) {
  const attribute = mesh.primitives[0].attributes[attributeName];
  return gltf.accessors[attribute];
}

function extractNamedBuffer(
  gltf: json.Root,
  buffers: ArrayBuffer[],
  mesh: json.Mesh,
  name: string,
) {
  if (mesh.primitives[0].attributes[name] === undefined) {
    return null;
  }

  const accessor = getAccessor(gltf, mesh, name);
  return extractBuffer(gltf, buffers, accessor);
}

function extractNodes(index: number, node: json.Node): Node {
  let transform;

  if (node.matrix) {
    transform = new Matrix4();
    transform.elements = new Float32Array(node.matrix);
  } else {
    transform = Matrix4.identity();

    // TODO: what if there's more than one transformation? Is the order right?

    if (node.scale) {
      transform = Matrix4.scale(
        node.scale[0],
        node.scale[1],
        node.scale[2],
      ).multiplyMatrix(transform);
    }

    if (node.rotation) {
      transform = new Quaternion(
        node.rotation[0],
        node.rotation[1],
        node.rotation[2],
        node.rotation[3],
      )
        .toMatrix4()
        .multiplyMatrix(transform);
    }

    if (node.translation) {
      transform = Matrix4.translate(
        node.translation[0],
        node.translation[1],
        node.translation[2],
      ).multiplyMatrix(transform);
    }
  }

  return {
    id: index,
    name: node.name,
    children: node.children || [],
    localBindTransform: transform,
    animatedTransform: Matrix4.identity(),
    skin: node.skin,
    mesh: node.mesh,
  } as Node;
}

function extractAnimation(
  gltf: json.Root,
  animation: json.Animation,
  buffers: ArrayBuffer[],
) {
  const channels = animation.channels.map((c) => {
    const sampler = animation.samplers[c.sampler];
    const time = extractBuffer(gltf, buffers, gltf.accessors![sampler.input]);
    const buffer = extractBuffer(
      gltf,
      buffers,
      gltf.accessors![sampler.output],
    );

    return {
      node: c.target.node,
      type: c.target.path,
      time,
      buffer,
      interpolation: sampler.interpolation ? sampler.interpolation : "LINEAR",
    };
  });

  const c: Channel = {};
  channels.forEach((channel) => {
    if (c[channel.node!] === undefined) {
      c[channel.node!] = {
        translation: [],
        rotation: [],
        scale: [],
      };
    }

    for (let i = 0; i < channel.time.buffer.length; i++) {
      const size =
        channel.interpolation === "CUBICSPLINE"
          ? channel.buffer.componentCount * 3
          : channel.buffer.componentCount;
      const offset =
        channel.interpolation === "CUBICSPLINE"
          ? channel.buffer.componentCount
          : 0;

      const transform =
        channel.type === "rotation"
          ? new Quaternion(
              channel.buffer.buffer[i * size + offset],
              channel.buffer.buffer[i * size + offset + 1],
              channel.buffer.buffer[i * size + offset + 2],
              channel.buffer.buffer[i * size + offset + 3],
            )
          : new Vector3(
              channel.buffer.buffer[i * size + offset],
              channel.buffer.buffer[i * size + offset + 1],
              channel.buffer.buffer[i * size + offset + 2],
            );

      c[channel.node!][channel.type].push({
        time: channel.time.buffer[i],
        transform: transform,
        type: channel.type,
      } as KeyFrame);
    }
  });

  return c;
}

function extractMesh(gltf: json.Root, mesh: json.Mesh, buffers: ArrayBuffer[]) {
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
    normals: extractNamedBuffer(gltf, buffers, mesh, "NORMAL"),
    colors: extractNamedBuffer(gltf, buffers, mesh, "COLOR_0"),
    tangents: extractNamedBuffer(gltf, buffers, mesh, "TANGENT"),
    texCoord: extractNamedBuffer(gltf, buffers, mesh, "TEXCOORD_0"),
    joints: extractNamedBuffer(gltf, buffers, mesh, "JOINTS_0"),
    weights: extractNamedBuffer(gltf, buffers, mesh, "WEIGHTS_0"),
  } as Mesh;
}

export class Model {
  name: string;
  meshes: Mesh[];
  nodes: Node[];
  rootNode: number;
  animations: Animations;
  skins: Skin[];
  activeAnimations: ActiveAnimation[];

  constructor() {
    this.name = "";
    this.rootNode = -1;
    this.meshes = [];
    this.nodes = [];
    this.skins = [];
    this.activeAnimations = [];
    this.animations = {};
  }

  static async readFromUrl(url: string) {
    const model = new Model();

    const response = await fetch(url);
    const gltf = (await response.json()) as json.Root;

    // Use last component as name.
    const pathComponents = url.split("/");
    model.name = pathComponents[pathComponents.length - 1];

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
    model.meshes = gltf.meshes.map((mesh) => extractMesh(gltf, mesh, buffers));

    model.rootNode = scene.nodes[0];
    model.nodes = gltf.nodes.map((node, i) => extractNodes(i, node));

    if (gltf.animations) {
      for (let animation of gltf.animations) {
        model.animations[animation.name] = extractAnimation(
          gltf,
          animation,
          buffers,
        );
      }
    }

    if (gltf.skins) {
      model.skins = gltf.skins.map((skin) => {
        const bindTransforms = extractBuffer(
          gltf,
          buffers,
          gltf.accessors![skin.inverseBindMatrices!],
        ) as FloatBuffer;
        const inverseBindTransforms = skin.joints.map((_, i) => {
          const matrix = new Matrix4();
          matrix.elements = new Float32Array(
            bindTransforms.buffer.slice(i * 16, i * 16 + 16),
          );
          return matrix;
        });
        return {
          joints: skin.joints,
          inverseBindTransforms,
        };
      });
    }

    return model;
  }

  play(clip: string) {
    // Only queue if not most recently queued.
    if (
      this.activeAnimations.length === 0 ||
      this.activeAnimations[this.activeAnimations.length - 1].key !== clip
    ) {
      this.activeAnimations.push({ key: clip, elapsed: 0 });
      // Only keep most recent two animations.
      this.activeAnimations.splice(0, this.activeAnimations.length - 2);
    }
  }

  tick(elapsed: number) {
    for (let animation of this.activeAnimations) {
      animation.elapsed += elapsed;
    }
  }

  animationTransforms(blendTime = 0) {
    const transforms: { [key: number]: Matrix4 } = {};

    for (let rootAnimation of this.activeAnimations) {
      const blend = -((rootAnimation.elapsed - blendTime) / blendTime);

      for (let key of Object.keys(this.animations[rootAnimation.key])) {
        let c = parseInt(key);
        const transform = get(
          this.animations[rootAnimation.key][c],
          rootAnimation.elapsed,
        );

        for (let animation of this.activeAnimations) {
          if (rootAnimation.key == animation.key || blend <= 0) continue;

          const cTransform = get(
            this.animations[animation.key][c],
            animation.elapsed,
          );
          transform.t = transform.t.lerp(cTransform.t, blend);
          transform.r = transform.r.slerp(cTransform.r, blend);
          transform.s = transform.s.lerp(cTransform.s, blend);
        }

        let localTransform = Matrix4.identity();
        const rotTransform = (transform.r as Quaternion).toMatrix4();

        localTransform = localTransform
          .multiplyMatrix(
            Matrix4.translate(transform.t.x, transform.t.y, transform.t.z),
          )
          .multiplyMatrix(rotTransform)
          .multiplyMatrix(
            Matrix4.scale(transform.s.x, transform.s.y, transform.s.z),
          );

        transforms[c] = localTransform;
      }
    }

    return transforms;
  }

  skinTransforms(blendTime: number, inverse = true) {
    const transforms = this.animationTransforms(blendTime);
    const appliedTransforms: Matrix4[] = [];

    for (let skin of this.skins) {
      this.applyTransform(
        appliedTransforms,
        transforms,
        Matrix4.identity(),
        skin,
        this.rootNode,
        inverse,
      );
    }
    return appliedTransforms;
  }

  applyTransform(
    appliedTransforms: Matrix4[],
    transforms: TransformMatrices,
    parentTransform: Matrix4,
    skin: Skin,
    nodeIndex: number,
    inverse: boolean,
  ) {
    const node = this.nodes[nodeIndex];
    const transformIndex = skin.joints.indexOf(node.id);

    let childTransform = parentTransform;

    if (transforms[node.id]) {
      childTransform = parentTransform.multiplyMatrix(transforms[node.id]);
    }

    if (inverse) {
      const ibt = skin.inverseBindTransforms[transformIndex];
      if (ibt) {
        appliedTransforms[transformIndex] = childTransform.multiplyMatrix(ibt);
      }
    } else {
      appliedTransforms[transformIndex] = childTransform;
    }

    node.children.forEach((childNode) => {
      this.applyTransform(
        appliedTransforms,
        transforms,
        childTransform,
        skin,
        childNode,
        inverse,
      );
    });
  }
}
