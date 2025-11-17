export class ShaderProgram {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  uniforms: { [name: string]: WebGLUniformLocation };
  isBound: boolean;

  constructor(
    vertexSource: string,
    fragmentSource: string,
    version: number = 300,
    precision = "mediump",
  ) {
    this.isBound = false;

    // Compile.
    this.vertexShader = this.compileSource(
      gl.VERTEX_SHADER,
      `#version ${version} es\n${vertexSource}`,
    );
    this.fragmentShader = this.compileSource(
      gl.FRAGMENT_SHADER,
      `#version ${version} es\nprecision ${precision} float;\n${fragmentSource}`,
    );

    // Link.
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    gl.linkProgram(this.program);

    let isOkay = gl.getProgramParameter(this.program, gl.LINK_STATUS);
    if (!isOkay) {
      let message = gl.getProgramInfoLog(this.program);
      gl.deleteProgram(this.program);
      throw message;
    }

    // Query uniforms.
    this.uniforms = {};
    let nuniforms = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < nuniforms; ++i) {
      let uniform = gl.getActiveUniform(this.program, i)!;
      let location = gl.getUniformLocation(this.program, uniform.name)!;
      this.uniforms[uniform.name] = location;

      // If uniform is an array, find locations of other elements.
      for (let elementIndex = 1; elementIndex < uniform.size; ++elementIndex) {
        const elementName = uniform.name.replace(/\[0\]$/, `[${elementIndex}]`);
        location = gl.getUniformLocation(this.program, elementName)!;
        if (location) {
          this.uniforms[elementName] = location;
        }
      }
    }

    this.unbind();
  }

  destroy() {
    gl.deleteShader(this.vertexShader);
    gl.deleteShader(this.fragmentShader);
    gl.deleteProgram(this.program);
  }

  compileErrorReport(message: string, type: GLenum, source: string) {
    let report = `I found errors in a ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader.\n`;

    let matches = message.matchAll(/^ERROR: (\d+):(\d+): (.*)$/gm);
    for (let match of matches) {
      let line = parseInt(match[2]) - 1;
      let NEIGHBOR_COUNT = 2;
      let lines = source.split(/\r?\n/);
      let startLine = Math.max(0, line - NEIGHBOR_COUNT);
      let endLine = Math.min(lines.length - 1, line + NEIGHBOR_COUNT);
      let lineIndexWidth = (endLine + 1).toString().length;
      report += `\nError on line ${line + 1}: ${match[3]}\n\n`;
      for (let i = startLine; i <= endLine; ++i) {
        if (i === line) {
          report += `! ${(i + 1).toString().padStart(lineIndexWidth, " ")}   ${lines[i]}\n`;
        } else {
          report += `  ${(i + 1).toString().padStart(lineIndexWidth, " ")}   ${lines[i]}\n`;
        }
      }
    }

    return report;
  }

  compileSource(type: GLenum, source: string) {
    let shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    let isOkay = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!isOkay) {
      let message = gl.getShaderInfoLog(shader)!;
      gl.deleteShader(shader);
      throw new ShaderCompilationError(
        this.compileErrorReport(message, type, source),
      );
    }

    return shader;
  }

  getAttributeLocation(name: string) {
    return gl.getAttribLocation(this.program, name);
  }

  bind() {
    gl.useProgram(this.program);
    this.isBound = true;
  }

  unbind() {
    gl.useProgram(null);
    this.isBound = false;
  }

  assertUniform(name: string) {
    if (!this.uniforms.hasOwnProperty(name)) {
      console.warn(`${name} isn't a valid uniform.`);
    }
  }

  setUniform1i(name: string, value: number) {
    this.assertUniform(name);
    gl.uniform1i(this.uniforms[name], value);
  }

  setUniform1f(name: string, value: number) {
    this.assertUniform(name);
    gl.uniform1f(this.uniforms[name], value);
  }

  setUniform2f(name: string, a: number, b: number) {
    this.assertUniform(name);
    gl.uniform2f(this.uniforms[name], a, b);
  }

  setUniform3f(name: string, a: number, b: number, c: number) {
    this.assertUniform(name);
    gl.uniform3f(this.uniforms[name], a, b, c);
  }

  setUniformMatrix4fv(name: string, elements: Float32Array) {
    this.assertUniform(name);
    gl.uniformMatrix4fv(this.uniforms[name], false, elements);
  }
}

class ShaderCompilationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
