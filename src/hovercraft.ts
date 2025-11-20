import { Matrix4 } from "@/lib/matrix.js";
import { Vector3 } from "@/lib/vector.js";
import { Terrain } from "@/terrain.js";

export class Hovercraft {
  terrain: Terrain;
  position: Vector3;
  previousPosition: Vector3;
  direction: Vector3;
  linearVelocity: Vector3; // Per second
  linearAcceleration: Vector3; // Per second
  rotation: Vector3;
  rotationalVelocity: Vector3;
  rotationalAcceleration: Vector3;

  private lastPhysicsUpdate: number;
  private airResistance = 0.2;
  private gravity = 15;
  private physicPointRadius = 5;

  // Three sampling points for height + slope detection
  private frontPoint: HoverPoint;
  private leftPoint: HoverPoint;
  private rightPoint: HoverPoint;

  constructor(position: Vector3, direction: Vector3, terrain: Terrain) {
    this.terrain = terrain;
    this.position = position;
    this.previousPosition = position;
    this.direction = direction;

    this.linearVelocity = new Vector3(0, 0, 0);
    this.rotationalVelocity = new Vector3(0, 0, 0);
    this.linearAcceleration = new Vector3(0, 0, 0);
    this.rotationalAcceleration = new Vector3(0, 0, 0);

    this.rotation = new Vector3(0, 0, 0);

    // Hover points
    this.frontPoint = new HoverPoint(this.position, this.terrain, this.gravity);
    this.leftPoint = new HoverPoint(this.position, this.terrain, this.gravity);
    this.rightPoint = new HoverPoint(this.position, this.terrain, this.gravity);

    this.lastPhysicsUpdate = performance.now() / 1000;
  }

  updatePhysics() {
    const now = performance.now() / 1000;
    const elapsedSeconds = now - this.lastPhysicsUpdate;

    // Update the hoverpoints
    this.frontPoint.position = this.position.add(
      this.direction.scalarMultiply(this.physicPointRadius)
    );
    this.leftPoint.position = this.position.add(
      Matrix4.rotateY(120).multiplyVector3(
        this.direction.scalarMultiply(this.physicPointRadius)
      )
    );
    this.rightPoint.position = this.position.add(
      Matrix4.rotateY(-120).multiplyVector3(
        this.direction.scalarMultiply(this.physicPointRadius)
      )
    );

    this.frontPoint.updatePhysics();
    this.leftPoint.updatePhysics();
    this.rightPoint.updatePhysics();

    // Update height
    this.position.y =
      (this.frontPoint.position.y +
        this.leftPoint.position.y +
        this.rightPoint.position.y) /
      3;

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

    // Movement
    this.position = this.position.add(
      this.linearVelocity.scalarMultiply(elapsedSeconds)
    );

    // Rotational movement
    const rotation = this.rotationalVelocity.y * elapsedSeconds * 10;
    this.direction = Matrix4.rotateY(rotation).multiplyVector3(this.direction);
    this.rotation.y = this.rotation.y += rotation;

    // Update the orientation
    const a = this.frontPoint.position;
    const b = this.leftPoint.position;
    const c = this.rightPoint.position;

    const ab = b.subtract(a);
    const ac = c.subtract(a);

    const normal = ab.cross(ac).normalize();

    // pitch: tilt forward/back (x-axis)
    this.rotation.x = (Math.atan2(normal.z, normal.y) * 180) / Math.PI;

    // roll: tilt left/right (z-axis)
    this.rotation.z = (-Math.atan2(normal.x, normal.y) * 180) / Math.PI;

    this.lastPhysicsUpdate = now;
  }
}

class HoverPoint {
  terrain: Terrain;
  position: Vector3;
  velocity: number;
  acceleration: number;

  private lastPhysicsUpdate: number;

  private hoverSpring = 3;
  private hoverDamping = 4.0;
  private hoverTargetHeight = 3;
  private groundCollisionHeight = 0.5;
  private maxHeight = 300;
  private gravity;

  constructor(position: Vector3, terrain: Terrain, gravity: number) {
    this.gravity = gravity;
    this.terrain = terrain;
    this.position = position;

    this.velocity = 0;
    this.acceleration = 0;

    this.lastPhysicsUpdate = performance.now() / 1000;
  }

  updatePhysics() {
    const now = performance.now() / 1000;
    const elapsedSeconds = now - this.lastPhysicsUpdate;

    // Gravity
    this.acceleration = -this.gravity;

    // Ground effects
    const groundHeight = this.terrain.getGroundHeight(
      this.position.x,
      this.position.z
    );

    // const distanceToGround = this.position.y - groundHeight;
    // const heightError = this.hoverTargetHeight - distanceToGround;

    // const springForce = heightError * this.hoverSpring;
    // const dampingForce = -this.velocity * this.hoverDamping;

    // this.acceleration += springForce + dampingForce;

    // Apply movement
    this.velocity += this.acceleration * elapsedSeconds;
    this.position.y += this.velocity * elapsedSeconds;

    // Clamp valid range
    if (this.position.y > this.maxHeight) {
      this.position.y = this.maxHeight;
      if (this.velocity > 0) this.velocity = 0;
    }

    if (this.position.y < groundHeight + this.groundCollisionHeight) {
      this.position.y = groundHeight + this.groundCollisionHeight;
      if (this.velocity < 0) this.velocity = 0;
    }

    // Done
    this.lastPhysicsUpdate = now;
  }
}
