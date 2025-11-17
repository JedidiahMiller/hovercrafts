import { VertexAttributes } from "@/lib/vertex-attributes.js";
import { ShaderProgram } from "@/lib/shader-program.js";
import { fetchImage } from "@/lib/web-utilities.js";
import { VertexArray } from "@/lib/vertex-array.js";
import { Vector3 } from "@/lib/vector.js";
import { Matrix4 } from "@/lib/matrix.js";
import { Field2 } from "@/lib/field.js";
import { ThirdPersonCamera } from "@/lib/camera.js";
import { Prefab } from "@/lib/prefab.js";
import vertexSource from "@/shaders/flat-vertex.glsl?raw";
import fragmentSource from "@/shaders/flat-fragment.glsl?raw";
import { TerrainCamera } from "./lib/first-person-camera.js";

let canvas: HTMLCanvasElement;
let terrainShader: ShaderProgram;
let terrainVao: VertexArray;
let racingPodVao: VertexArray;
let racingPodPosition: Matrix4;
let clipFromEye: Matrix4;
let then: DOMHighResTimeStamp | null = null;
let worldLightPosition: Vector3;
let racingPodPos: Vector3;

type PlayerControllers = {
  horizontal: number;
  vertical: number;
  yaw: number;
  pitch: number;
  camera?: TerrainCamera | ThirdPersonCamera;
};

let playerControls: PlayerControllers = {
  horizontal: 0,
  vertical: 0,
  yaw: 0,
  pitch: 0,
  camera: undefined,
};

const scaler = new Vector3(0.3, 5, 0.3);

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", () => resizeCanvas());

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("pointerdown", () => {
    document.body.requestPointerLock();
  });
  window.addEventListener("pointermove", (event) => {
    if (document.pointerLockElement) {
      playerControls.yaw = -event.movementX * 1;
      playerControls.pitch = -event.movementY * 1;
    }
  });

  terrainShader = new ShaderProgram(vertexSource, fragmentSource);
  await initializeMap("/rockingham.png");
  await loadTexture();
  resizeCanvas();
  requestAnimationFrame(animate);
}

function onKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
      playerControls.vertical = 1;
      break;
    case "s":
      playerControls.vertical = -1;
      break;
    case "a":
      playerControls.horizontal = -1;
      break;
    case "d":
      playerControls.horizontal = 1;
      break;
    default:
      return;
  }

  render();
}

function onKeyUp(event: KeyboardEvent) {
  switch (event.key) {
    case "w":
    case "s":
      playerControls.vertical = 0;
      break;
    case "a":
    case "d":
      playerControls.horizontal = 0;
      break;
    default:
      return;
  }
}

async function initializeMap(url: string) {
  const image = await fetchImage(url);
  const readImage = Field2.readFromImage(image);
  const heightmap = readImage.toTrimesh(scaler);

  heightmap.computeNormals();

  // Place the sun at the center of the terrain and raise it
  const centerX = (readImage.width - 1) * 0.5 * scaler.x;
  const centerZ = (readImage.height - 1) * 0.5 * scaler.z;
  const raiseY = scaler.y * 20.0;
  worldLightPosition = new Vector3(centerX, raiseY, centerZ);

  // Position the racing pod in the center of the map slightly above ground.
  racingPodPos = new Vector3(centerX, 25, centerZ);
  racingPodPosition = Matrix4.translate(
    racingPodPos.x,
    racingPodPos.y,
    racingPodPos.z
  );

  playerControls.camera = new TerrainCamera(
    new Vector3(centerX * 0.75, 0, centerZ), // Places the camera around Harrisonburg
    new Vector3(centerX, 0, centerZ), // Look at Massanutten
    readImage,
    2,
    scaler
  );

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

  // Add color attribute - terrain
  const colors = new Float32Array(heightmap.vertexCount * 3);
  for (let i = 0; i < heightmap.vertexCount; i++) {
    colors[i * 3] = 0.3; // Red
    colors[i * 3 + 1] = 0.7; // Green
    colors[i * 3 + 2] = 0.3; // Blue
  }
  attributes.addAttribute("color", heightmap.vertexCount, 3, colors);
  attributes.addIndices(heightmap.faceBuffer());
  terrainVao = new VertexArray(terrainShader, attributes);

  // Add a racing pod (sphere for placeholder)
  const racingPod = Prefab.sphere(2, 8, 8);
  // Shift the pod down a bit.
  racingPod.computeNormals();
  const racingPodAttr = new VertexAttributes();
  racingPodAttr.addAttribute(
    "position",
    racingPod.vertexCount,
    3,
    racingPod.positionBuffer()
  );
  racingPodAttr.addIndices(racingPod.faceBuffer());

  racingPodVao = new VertexArray(terrainShader, racingPodAttr);
}

function render() {
  renderCameraPerspective(
    playerControls.camera!,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  const aspectRatio = canvas.clientWidth / canvas.clientHeight;

  clipFromEye = Matrix4.perspective(80, aspectRatio, 0.5, 500);
  render();
}

function animate() {
  const now = performance.now() / 1000; // Now is in seconds
  const elapsed = then ? now - then : 0;

  // This is just for testing with the mouse.
  playerControls.camera!.advance(playerControls.vertical * elapsed * 25);
  playerControls.camera!.strafe(playerControls.horizontal * elapsed * 25);
  playerControls.camera!.yaw(playerControls.yaw * 0.1);
  playerControls.camera!.pitch(playerControls.pitch * 0.1);
  playerControls.yaw = 0;
  playerControls.pitch = 0;

  render();
  requestAnimationFrame(animate);
  then = now;
}

function renderCameraPerspective(
  camera: TerrainCamera | ThirdPersonCamera,
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number
) {
  // Set up viewport and scissor for this camera
  gl.viewport(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.scissor(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.clearColor(0.392, 0.584, 0.929, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  terrainShader.bind();

  // Upload three standard matrices
  const worldFromModel = Matrix4.translate(0.0, 0.0, 0.0);
  terrainShader.setUniformMatrix4fv("clipFromEye", clipFromEye.elements);
  terrainShader.setUniformMatrix4fv(
    "eyeFromWorld",
    camera.eyeFromWorld.elements
  );
  terrainShader.setUniformMatrix4fv("worldFromModel", worldFromModel.elements);
  terrainShader.setUniform1i("terrainTexture", 0);

  const eyeLightPosition =
    camera.eyeFromWorld.multiplyPosition(worldLightPosition);

  terrainShader.setUniform3f(
    "lightPosition",
    eyeLightPosition.x,
    eyeLightPosition.y,
    eyeLightPosition.z
  );

  // Draw terrain
  terrainVao.bind();
  terrainVao.drawIndexed(gl.TRIANGLES);
  terrainVao.unbind();

  // Draw light sphere at the light position
  const worldFromLight = Matrix4.translate(
    worldLightPosition.x,
    worldLightPosition.y,
    worldLightPosition.z
  );
  terrainShader.setUniformMatrix4fv("worldFromModel", worldFromLight.elements);

  terrainShader.setUniformMatrix4fv(
    "worldFromModel",
    racingPodPosition.elements
  );
  racingPodVao.bind();
  racingPodVao.drawIndexed(gl.TRIANGLES);
  racingPodVao.unbind();

  terrainShader.unbind();
}

function createRgbaTexture2d(
  width: number,
  height: number,
  image: HTMLImageElement | Uint8ClampedArray,
  textureUnit: GLenum = gl.TEXTURE0
) {
  gl.activeTexture(textureUnit);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // If image is an img element, then the width, height and border are inferred and shouldn't be
  // passed to the texImage2D function
  if (image instanceof Uint8ClampedArray) {
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  }

  gl.generateMipmap(gl.TEXTURE_2D);
  return texture;
}

async function loadTexture() {
  const image = await fetchImage("/textures/grass.png");
  createRgbaTexture2d(image.width, image.height, image);
}

window.addEventListener("load", () => initialize());
