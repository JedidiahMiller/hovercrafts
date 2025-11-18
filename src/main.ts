import { VertexAttributes } from "@/lib/vertex-attributes.js";
import { ShaderProgram } from "@/lib/shader-program.js";
import { fetchImage } from "@/lib/web-utilities.js";
import { VertexArray } from "@/lib/vertex-array.js";
import { Matrix4 } from "@/lib/matrix.js";
import { Field2 } from "@/lib/field.js";
import { Prefab } from "@/lib/prefab.js";
import vertexSource from "@/shaders/flat-vertex.glsl?raw";
import fragmentSource from "@/shaders/flat-fragment.glsl?raw";
import { Vector3 } from "@/lib/vector.js";
import { Renderer } from "@/renderer.js";
import { ThirdPersonCamera } from "./lib/camera.js";
import { MeshLoader } from "./mesh.js";

let canvas: HTMLCanvasElement;
let terrainShader: ShaderProgram;
let hovercraftShader: ShaderProgram;
let terrainVao: VertexArray;
let hovercraftVao: VertexArray;
let clipFromEye: Matrix4;
let then: DOMHighResTimeStamp | null = null;
let worldLightPosition: Vector3;
let terrain: Field2;

type Player = {
  hovercraftPosition: Vector3;
  hovercraftDirection: Vector3;
};

let player: Player = {
  hovercraftPosition: new Vector3(0, 0, 0),
  hovercraftDirection: new Vector3(0, 0, -1),
};

type PlayerControllers = {
  horizontal: number;
  vertical: number;
  yaw: number;
  pitch: number;
  camera?: ThirdPersonCamera;
};

let playerControls: PlayerControllers = {
  horizontal: 0,
  vertical: 0,
  yaw: 0,
  pitch: 0,
  camera: undefined,
};

const scaler = new Vector3(0.75, 5, 0.75);

async function initialize() {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  window.gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  window.addEventListener("resize", () => resizeCanvas());

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  // window.addEventListener("pointerdown", () => {
  //   document.body.requestPointerLock();
  // });
  // window.addEventListener("pointermove", (event) => {
  //   if (document.pointerLockElement) {
  //     playerControls.yaw = -event.movementX * 1;
  //     playerControls.pitch = -event.movementY * 1;
  //   }
  // });

  terrainShader = new ShaderProgram(vertexSource, fragmentSource);
  hovercraftShader = new ShaderProgram(vertexSource, fragmentSource);
  hovercraftVao = await MeshLoader.getVao(
    "/models/hovercraft.gltf",
    vertexSource,
    fragmentSource
  );
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
  terrain = Field2.readFromImage(image);
  const heightmap = terrain.toTrimesh(scaler);

  heightmap.computeNormals();

  // Place the sun at the center of the terrain and raise it
  const centerX = (terrain.width - 1) * 0.5 * scaler.x;
  const centerZ = (terrain.height - 1) * 0.5 * scaler.z;
  const raiseY = scaler.y * 20.0;
  worldLightPosition = new Vector3(centerX, raiseY, centerZ);

  player.hovercraftPosition = new Vector3(centerX, 25, centerZ);

  playerControls.camera = new ThirdPersonCamera(
    player.hovercraftPosition,
    new Vector3(0, 3, -5),
    new Vector3(0, 1, 0)
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
    colors[i * 3] = 0.9; // Red
    colors[i * 3 + 1] = 0.1; // Green
    colors[i * 3 + 2] = 0.07; // Blue
  }
  attributes.addAttribute("color", heightmap.vertexCount, 3, colors);
  attributes.addIndices(heightmap.faceBuffer());
  terrainVao = new VertexArray(terrainShader, attributes);
}

function render() {
  playerControls.camera!.updateTarget(player.hovercraftPosition);
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

  player.hovercraftPosition = player.hovercraftPosition.add(
    player.hovercraftDirection.scalarMultiply(
      playerControls.vertical * elapsed * -5
    )
  );

  // playerControls.camera!.advance(playerControls.vertical * elapsed * 25);
  // playerControls.camera!.strafe(playerControls.horizontal * elapsed * 25);
  // playerControls.camera!.yaw(playerControls.yaw * 0.1);
  // playerControls.camera!.pitch(playerControls.pitch * 0.1);
  // playerControls.yaw = 0;
  // playerControls.pitch = 0;

  render();
  requestAnimationFrame(animate);
  then = now;
}

function renderCameraPerspective(
  camera: ThirdPersonCamera,
  viewportX: number,
  viewportY: number,
  viewportWidth: number,
  viewportHeight: number
) {
  // Set up viewport and scissor for this camera
  gl.viewport(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.scissor(viewportX, viewportY, viewportWidth, viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // Create the renderer
  const renderer = new Renderer(worldLightPosition, clipFromEye);

  // Terrain
  renderer.render(terrainShader, terrainVao, camera);

  // Draw the hovercraft
  player.hovercraftPosition.y = terrain.getHeight(
    player.hovercraftPosition.x,
    player.hovercraftPosition.z,
    scaler,
    5
  );

  const worldFromHovercraftModel = Matrix4.translate(
    player.hovercraftPosition.x,
    player.hovercraftPosition.y,
    player.hovercraftPosition.z
  );

  renderer.render(
    hovercraftShader,
    hovercraftVao,
    camera,
    worldFromHovercraftModel
  );
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
