import { Matrix4 } from "@/lib/matrix.js";
import { Vector3 } from "@/lib/vector.js";
import { TerrainMesh } from "./terrain.js";
import { Mesh } from "./mesh.js";

export class Hovercraft {
  mesh: Mesh;

  direction: Vector3;

  position: Vector3;
  linearVelocity: Vector3; // Per second
  linearAcceleration: Vector3; // Per second

  rotation: Vector3;
  rotationalVelocity: Vector3;
  rotationalAcceleration: Vector3;

  private lastPhysicsUpdate: number;
  private airResistance = 0.2;
  private gravity = 50;
  private groundCollisionDistance = 0.75;
  private groundHoverDistance = 5;
  private scale = new Vector3(1, 0.75, 1);

  constructor(position: Vector3, direction: Vector3, mesh: Mesh) {
    this.direction = direction;

    this.position = position;
    this.linearVelocity = new Vector3(0, 0, 0);
    this.linearAcceleration = new Vector3(0, 0, 0);

    this.rotation = new Vector3(0, 0, 0);
    this.rotationalVelocity = new Vector3(0, 0, 0);
    this.rotationalAcceleration = new Vector3(0, 0, 0);

    this.lastPhysicsUpdate = performance.now() / 1000;

    this.mesh = mesh;
  }

  updatePhysics(terrainMeshes: TerrainMesh[]) {
    const now = performance.now() / 1000;
    const elapsedSeconds = now - this.lastPhysicsUpdate;

    // Gravity
    this.linearAcceleration.y = -this.gravity;

    // Drag
    this.linearAcceleration = this.linearAcceleration.add(
      this.linearVelocity.scalarMultiply(-this.airResistance)
    );
    this.rotationalVelocity = this.rotationalVelocity.scalarMultiply(1 - elapsedSeconds * 0.75);
    // TODO: Slow do sideways drift

    // Velocity
    this.linearVelocity = this.linearVelocity.add(
      this.linearAcceleration.scalarMultiply(elapsedSeconds)
    );
    this.rotationalVelocity.y += this.rotationalAcceleration.y * elapsedSeconds * 100;

    // Apply collisions

    // Find the height and the terrain type
    let terrainSpeed = 0;
    let distanceToGround = Infinity;
    for (const terrainMesh of terrainMeshes) {
      const hit = terrainMesh.mesh.raycastMesh(this.position, new Vector3(0, -1, 0));
      if (hit) {
        terrainSpeed = terrainMesh.speed;
        distanceToGround = hit.distance;

        // Align to the ground if on the ground
        if (distanceToGround < this.groundHoverDistance) {
          // Get the ground normal in world space
          let groundNormal = terrainMesh.mesh.getTriangleNormal(hit.triangle, true)!;

          const degreeConversion = 180 / Math.PI;

          this.rotation.x = Math.atan2(groundNormal.z, groundNormal.y) * degreeConversion;

          this.rotation.z = Math.atan2(-groundNormal.x, groundNormal.y) * degreeConversion;
        }

        break;
      } else {
        this.rotation.x = this.rotation.x * (1 - 0.6 * elapsedSeconds);
        this.rotation.z = this.rotation.z * (1 - 0.6 * elapsedSeconds);
      }
    }

    // Ground spring force
    const k = 200; // Sprint constant
    const c = 10; // Damping constant
    const compression = this.groundHoverDistance - distanceToGround;

    if (compression > 0) {
      const spring = k * compression * compression;
      const damping = c * this.linearVelocity.y;
      const force = Math.max(0, spring - damping);

      this.linearVelocity.y += force * elapsedSeconds;
    }

    // Hard ground collision limit
    if (distanceToGround < this.groundCollisionDistance && this.linearVelocity.y < 0) {
      this.linearVelocity.y = Math.abs(this.linearVelocity.y) * 0.3;
    }

    // Apply the movements
    this.position = this.position.add(this.linearVelocity.scalarMultiply(elapsedSeconds));

    // Rotational movement
    const rotation = this.rotationalVelocity.y * elapsedSeconds * 10;
    this.direction = Matrix4.rotateY(rotation).multiplyVector3(this.direction).normalize();
    this.rotation.y += rotation;

    // Done with physics
    this.lastPhysicsUpdate = now;

    // Update the mesh
    this.mesh.worldFromModel = Matrix4.translate(this.position.x, this.position.y, this.position.z)
      .multiplyMatrix(Matrix4.scale(this.scale.x, this.scale.y, this.scale.z))
      .multiplyMatrix(Matrix4.rotateX(this.rotation.x))
      .multiplyMatrix(Matrix4.rotateZ(this.rotation.z))
      .multiplyMatrix(Matrix4.rotateY(this.rotation.y));
  }
}
