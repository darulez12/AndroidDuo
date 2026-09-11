import { EYE_DISTANCE_POINTS, FOLD_PARAMS } from "./params";
import { FRAG_SRC, VERT_SRC } from "./shader";

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("No se pudo crear el shader");
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? "error de compilación";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

export class FoldRenderer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private buffer: WebGLBuffer;
  private uSize: WebGLUniformLocation;
  private uAngle: WebGLUniformLocation;
  private uEye: WebGLUniformLocation;
  private uBlur: WebGLUniformLocation;
  private uDark: WebGLUniformLocation;
  private angle = 0;
  private cssWidth = 1;
  private cssHeight = 1;
  private hasLayer = false;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL no está disponible en este dispositivo");
    this.gl = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const program = gl.createProgram();
    if (!program) throw new Error("No se pudo crear el programa WebGL");
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? "error de link");
    }
    this.program = program;

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("No se pudo crear el buffer");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    this.buffer = buffer;

    const texture = gl.createTexture();
    if (!texture) throw new Error("No se pudo crear la textura");
    this.texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.useProgram(program);
    const uLayer = gl.getUniformLocation(program, "uLayer");
    const uSize = gl.getUniformLocation(program, "uSize");
    const uAngle = gl.getUniformLocation(program, "uAngle");
    const uEye = gl.getUniformLocation(program, "uEyeDistance");
    const uBlur = gl.getUniformLocation(program, "uBlurSpread");
    const uDark = gl.getUniformLocation(program, "uDarkening");
    if (!uLayer || !uSize || !uAngle || !uEye || !uBlur || !uDark) {
      throw new Error("Uniforms del shader incompletos");
    }
    this.uSize = uSize;
    this.uAngle = uAngle;
    this.uEye = uEye;
    this.uBlur = uBlur;
    this.uDark = uDark;
    gl.uniform1i(uLayer, 0);
    gl.uniform1f(uEye, EYE_DISTANCE_POINTS);
    gl.uniform1f(uBlur, FOLD_PARAMS.blurSpread);
    gl.uniform1f(uDark, FOLD_PARAMS.darkening);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 1);
  }

  setAngle(radians: number) {
    this.angle = radians;
  }

  resize(cssWidth: number, cssHeight: number, dpr: number) {
    this.cssWidth = Math.max(1, cssWidth);
    this.cssHeight = Math.max(1, cssHeight);
    const gl = this.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  setLayer(source: HTMLCanvasElement | HTMLImageElement | ImageBitmap) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    this.hasLayer = true;
  }

  draw() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.hasLayer) return;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(this.uSize, this.cssWidth, this.cssHeight);
    gl.uniform1f(this.uAngle, this.angle);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.buffer);
    gl.deleteTexture(this.texture);
    gl.deleteProgram(this.program);
    const ext = gl.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }
}
