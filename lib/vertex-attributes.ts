export class VertexAttribute {
  name: string;
  nvertices: number;
  ncomponents: number;
  buffer: WebGLBuffer;
 
  constructor(name: string, nvertices: number, ncomponents: number, floats: Float32Array, usage: number = gl.STATIC_DRAW) {
    this.name = name;
    this.nvertices = nvertices;
    this.ncomponents = ncomponents;

    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, floats, usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  update(floats: Float32Array) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, floats);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  destroy() {
    gl.deleteBuffer(this.buffer);
  }
}

export class VertexAttributes {
  nvertices: number;
  indexBuffer: WebGLBuffer | null;
  attributes: VertexAttribute[];
  indexCount: number;

  constructor() {
    this.nvertices = -1;
    this.indexBuffer = null;
    this.indexCount = 0;
    this.attributes = [];
  }

  addAttribute(name: string, nvertices: number, ncomponents: number, floats: Float32Array, usage: number = gl.STATIC_DRAW) {
    if (this.nvertices >= 0 && nvertices != this.nvertices) {
      throw "Attributes must have same number of vertices.";
    }

    this.nvertices = nvertices;
    let attribute = new VertexAttribute(name, nvertices, ncomponents, floats, usage);
    this.attributes.push(attribute);

    return attribute;
  }

  addIndices(ints: Uint32Array, usage: number = gl.STATIC_DRAW) {
    this.indexCount = ints.length;
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ints, usage);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  destroy() {
    for (let attribute of this.attributes) {
      attribute.destroy();
    }

    if (this.indexBuffer) {
      gl.deleteBuffer(this.indexBuffer);
    }
  }

  [Symbol.iterator]() {
    return this.attributes.values();
  }

  get vertexCount(): number {
    return this.nvertices;
  }
}
