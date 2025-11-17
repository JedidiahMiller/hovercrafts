import { ShaderProgram } from './shader-program.js';
import { VertexAttributes } from './vertex-attributes.js';

export class VertexArray {
  attributes: VertexAttributes;
  vertexArray: WebGLVertexArrayObject;
  isBound: boolean;

  constructor(program: ShaderProgram, attributes: VertexAttributes) {
    this.isBound = false;
    this.vertexArray = gl.createVertexArray()!;
    this.attributes = attributes;

    gl.bindVertexArray(this.vertexArray);
    for (let attribute of attributes) {
      let location = program.getAttributeLocation(attribute.name);
      if (location < 0) {
        console.debug(`${attribute.name} is not used in the shader.`);
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
        gl.vertexAttribPointer(location, attribute.ncomponents, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(location);
      }
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.indexBuffer);

    this.unbind();
  }

  bind() {
    gl.bindVertexArray(this.vertexArray);
    this.isBound = true;
  }

  destroy() {
    gl.deleteVertexArray(this.vertexArray);
  }

  unbind() {
    gl.bindVertexArray(null);
    this.isBound = false;
  }

  drawSequence(mode: GLenum) {
    gl.drawArrays(mode, 0, this.attributes.vertexCount);
  }

  drawIndexed(mode: GLenum) {
    gl.drawElements(mode, this.attributes.indexCount, gl.UNSIGNED_INT, 0);
  }
}
