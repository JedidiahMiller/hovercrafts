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
  private scale = new Vector3(1, 0.6, 1);
  private lastSoundTime;

  constructor(position: Vector3, direction: Vector3, mesh: Mesh) {
    this.direction = direction;

    this.position = position;
    this.linearVelocity = new Vector3(0, 0, 0);
    this.linearAcceleration = new Vector3(0, 0, 0);

    this.rotation = new Vector3(0, 0, 0);
    this.rotationalVelocity = new Vector3(0, 0, 0);
    this.rotationalAcceleration = new Vector3(0, 0, 0);

    this.lastPhysicsUpdate = performance.now() / 1000;
    this.lastSoundTime = performance.now() / 1000;

    this.mesh = mesh;
  }

  updatePhysics(terrainMeshes: TerrainMesh[], barrierMesh?: Mesh) {
    const now = performance.now() / 1000;
    const elapsedSeconds = now - this.lastPhysicsUpdate;

    // Gravity
    this.linearAcceleration.y = -this.gravity;

    // Drag
    this.linearAcceleration = this.linearAcceleration.add(
      this.linearVelocity.scalarMultiply(-this.airResistance)
    );
    this.rotationalVelocity = this.rotationalVelocity.scalarMultiply(
      1 - elapsedSeconds * 0.75
    );
    // TODO: Slow do sideways drift

    // Velocity
    this.linearVelocity = this.linearVelocity.add(
      this.linearAcceleration.scalarMultiply(elapsedSeconds)
    );
    this.rotationalVelocity.y +=
      this.rotationalAcceleration.y * elapsedSeconds * 100;

    // Apply collisions

    // Find the height and the terrain type
    let terrainSpeed = 0;
    let distanceToGround = Infinity;
    for (const terrainMesh of terrainMeshes) {
      const hit = terrainMesh.mesh.raycastMesh(
        this.position,
        new Vector3(0, -1, 0)
      );
      if (hit) {
        terrainSpeed = terrainMesh.speed;
        distanceToGround = hit.distance;

        // Align to the ground if on the ground
        if (distanceToGround < this.groundHoverDistance) {
          // Get the ground normal in world space
          let groundNormal = terrainMesh.mesh.getTriangleNormal(
            hit.triangle,
            true
          )!;

          const degreeConversion = 180 / Math.PI;

          this.rotation.x =
            Math.atan2(groundNormal.z, groundNormal.y) * degreeConversion;

          this.rotation.z =
            Math.atan2(-groundNormal.x, groundNormal.y) * degreeConversion;
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
    if (
      distanceToGround < this.groundCollisionDistance &&
      this.linearVelocity.y < 0
    ) {
      this.linearVelocity.y = Math.abs(this.linearVelocity.y) * 0.3;
    }

    // Apply the movements
    this.position = this.position.add(
      this.linearVelocity.scalarMultiply(elapsedSeconds)
    );

    // Barrier collision detection
    if (barrierMesh) {
      this.checkBarrierCollision(barrierMesh);
    }

    // Rotational movement
    const rotation = this.rotationalVelocity.y * elapsedSeconds * 10;
    this.direction = Matrix4.rotateY(rotation)
      .multiplyVector3(this.direction)
      .normalize();
    this.rotation.y += rotation;

    // Done with physics
    this.lastPhysicsUpdate = now;

    // Update the mesh
    this.mesh.worldFromModel = Matrix4.translate(
      this.position.x,
      this.position.y,
      this.position.z
    )
      .multiplyMatrix(Matrix4.rotateX(this.rotation.x))
      .multiplyMatrix(Matrix4.rotateZ(this.rotation.z))
      .multiplyMatrix(Matrix4.rotateY(this.rotation.y))
      .multiplyMatrix(Matrix4.scale(this.scale.x, this.scale.y, this.scale.z));
  }

  private checkBarrierCollision(barrierMesh: Mesh) {
    const collisionRadius = 0.01; // Collision threshold

    const M = barrierMesh.worldFromModel!;
    const invM = M.inverse();

    // Transform hovercraft position to model space
    const modelPos = invM.multiplyVector3(this.position);

    const pos = barrierMesh.positions.buffer;
    const idx = barrierMesh.indices.buffer;
    const nrm = barrierMesh.normals?.buffer;

    let closestPenetration = 0;
    let closestNormal: Vector3 | null = null;

    // Check all triangles in the barrier mesh
    for (let i = 0; i < idx.length; i += 3) {
      const ia = idx[i] * 3;
      const ib = idx[i + 1] * 3;
      const ic = idx[i + 2] * 3;

      // Get triangle vertices in model space
      const v0 = new Vector3(pos[ia], pos[ia + 1], pos[ia + 2]);
      const v1 = new Vector3(pos[ib], pos[ib + 1], pos[ib + 2]);
      const v2 = new Vector3(pos[ic], pos[ic + 1], pos[ic + 2]);

      // Get triangle normal (average of vertex normals)
      const n0 = new Vector3(nrm[ia], nrm[ia + 1], nrm[ia + 2]);
      const n1 = new Vector3(nrm[ib], nrm[ib + 1], nrm[ib + 2]);
      const n2 = new Vector3(nrm[ic], nrm[ic + 1], nrm[ic + 2]);
      const triangleNormal = n0
        .add(n1)
        .add(n2)
        .scalarMultiply(1 / 3)
        .normalize();

      // Find closest point on triangle to hovercraft position
      const closestPoint = this.closestPointOnTriangle(modelPos, v0, v1, v2);
      const toHovercraft = modelPos.subtract(closestPoint);
      const distanceToTriangle = toHovercraft.magnitude;

      // Check if we're close enough to this triangle
      if (distanceToTriangle < collisionRadius) {
        console.log("Hitting barrier", distanceToTriangle);
        // Check if we're on the wrong side (behind the normal)
        const dot = toHovercraft.normalize().dot(triangleNormal);

        if (dot < 0) {
          // We're on the wrong side! Calculate penetration depth
          const penetration = collisionRadius - distanceToTriangle;

          if (penetration > closestPenetration) {
            closestPenetration = penetration;
            closestNormal = triangleNormal;
          }
        }
      }
    }

    // If we found a collision, push back and adjust velocity
    if (closestNormal && closestPenetration > 0) {
      if (performance.now() / 1000 - this.lastSoundTime > 1) {
        this.lastSoundTime = performance.now() / 1000;
        const audio = new Audio("/sound.mp3");
        audio.volume = 0.5;r
        audio.play();
      }

      // Transform normal to world space
      const worldNormal = M.multiplyVector3(closestNormal).normalize();

      // Push position back onto the correct side
      this.position = this.position.add(
        worldNormal.scalarMultiply(closestPenetration * 1.1)
      );

      // Dampen velocity component that's going into the wall
      const velocityDotNormal = this.linearVelocity.dot(worldNormal);
      if (velocityDotNormal < 0) {
        // Remove the component going into the wall
        this.linearVelocity = this.linearVelocity.subtract(
          worldNormal.scalarMultiply(velocityDotNormal * 1.1)
        );
      }
    }
  }

  private closestPointOnTriangle(
    p: Vector3,
    a: Vector3,
    b: Vector3,
    c: Vector3
  ): Vector3 {
    // Compute vectors
    const ab = b.subtract(a);
    const ac = c.subtract(a);
    const ap = p.subtract(a);

    const d1 = ab.dot(ap);
    const d2 = ac.dot(ap);
    if (d1 <= 0 && d2 <= 0) return a;

    const bp = p.subtract(b);
    const d3 = ab.dot(bp);
    const d4 = ac.dot(bp);
    if (d3 >= 0 && d4 <= d3) return b;

    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
      const v = d1 / (d1 - d3);
      return a.add(ab.scalarMultiply(v));
    }

    const cp = p.subtract(c);
    const d5 = ab.dot(cp);
    const d6 = ac.dot(cp);
    if (d6 >= 0 && d5 <= d6) return c;

    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
      const w = d2 / (d2 - d6);
      return a.add(ac.scalarMultiply(w));
    }

    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
      return b.add(c.subtract(b).scalarMultiply(w));
    }

    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;
    return a.add(ab.scalarMultiply(v)).add(ac.scalarMultiply(w));
  }
}
