import { lerp } from "lib/math-utilities.js";
import { Trimesh } from "lib/trimesh.js";
import { Vector3 } from "lib/vector.js";

export class Prefab {
  static grid(width: number, height: number, longitudeCount: number, latitudeCount: number) {
    const positions: Vector3[] = [];

    for (let lat = 0; lat < latitudeCount; ++lat) {
      const y = lat / (latitudeCount - 1) * height;
      for (let lon = 0; lon < longitudeCount; ++lon) {
        const x = lon / (longitudeCount - 1) * width;
        positions.push(new Vector3(x, y, 0));
      }
    }

    const index = (lon: number, lat: number) => {
        return lat * longitudeCount + lon;
    };

    const faces: number[][] = [];
    for (let lat = 0; lat < latitudeCount - 1; ++lat) {
      for (let lon = 0; lon < longitudeCount - 1; ++lon) {
        const nextLon = lon + 1;
        const nextLat = lat + 1;

        faces.push([
            index(lon, lat),
            index(nextLon, lat),
            index(lon, nextLat)
        ]);
        faces.push([
            index(nextLon, lat),
            index(nextLon, nextLat),
            index(lon, nextLat),
        ]);
      }
    }

    return new Trimesh(positions, faces);
  }

  static cylinder(radius: number, height: number, longitudeCount: number, latitudeCount: number) {
    const positions: Vector3[] = [];

    for (let lat = 0; lat < latitudeCount; ++lat) {
      const y = lat / (latitudeCount - 1) * height;
      for (let lon = 0; lon < longitudeCount; ++lon) {
        const radians = lon / longitudeCount * 2 * Math.PI;
        const x = radius * Math.cos(radians);
        const z = radius * Math.sin(radians);
        positions.push(new Vector3(x, y, z));
      }
    }

    const index = (lon: number, lat: number) => {
        return lat * longitudeCount + lon;
    };

    const faces: number[][] = [];
    for (let lat = 0; lat < latitudeCount - 1; ++lat) {
      for (let lon = 0; lon < longitudeCount; ++lon) {
        let nextLon = (lon + 1) % longitudeCount;
        let nextLat = lat + 1;

        faces.push([
          index(lon, lat),
          index(nextLon, lat),
          index(lon, nextLat),
        ]);

        faces.push([
          index(nextLon, lat),
          index(nextLon, nextLat),
          index(lon, nextLat),
        ]);
      }
    }

    return new Trimesh(positions, faces);
  }

  // static sphere(radius: number, longitudeCount: number, latitudeCount: number) {
  //   const positions: Vector3[] = [];

  //   for (let lat = 0; lat < latitudeCount; ++lat) {
  //     // First find the position on the prime meridian.
  //     const latRadians = lerp(-Math.PI * 0.5, Math.PI * 0.5, lat / (latitudeCount - 1));
  //     let x = radius * Math.cos(latRadians);
  //     let y = radius * Math.sin(latRadians);

  //     for (let lon = 0; lon < longitudeCount; ++lon) {
  //       const lonRadians = lon / longitudeCount * -2 * Math.PI;
  //       positions.push(new Vector3(
  //         x * Math.cos(lonRadians),
  //         y,
  //         x * Math.sin(lonRadians)
  //       ));
  //     }
  //   }

  //   return new Trimesh(positions, faces);
  // }

  static sphere(radius: number, longitudeCount: number, latitudeCount: number) {
    const positions: Vector3[] = [];
    const faces: number[][] = [];

    const index = (lon: number, lat: number) => {
      return (lat * longitudeCount + lon) % (longitudeCount * latitudeCount);
    };

    for (let lat = 0; lat < latitudeCount; ++lat) {
      // First find the position on the prime meridian.
      const latRadians = lerp(-Math.PI * 0.5, Math.PI * 0.5, lat / (latitudeCount - 1));
      let x = radius * Math.cos(latRadians);
      let y = radius * Math.sin(latRadians);

      for (let lon = 0; lon < longitudeCount; ++lon) {
        const lonRadians = lon / longitudeCount * -2 * Math.PI;
        positions.push(new Vector3(
          x * Math.cos(lonRadians),
          y,
          x * Math.sin(lonRadians)
        ));

        const nextLon = lon + 1;
        const nextLat = lat + 1;

        faces.push([
            index(lon, lat),
            index(nextLon, lat),
            index(lon, nextLat)
        ]);
        faces.push([
            index(nextLon, lat),
            index(nextLon, nextLat),
            index(lon, nextLat),
        ]);
      }
    }

    return new Trimesh(positions, faces);
  }

  static torus(innerRadius: number, outerRadius: number, longitudeCount: number, latitudeCount: number) {
    const positions: Vector3[] = [];
    const index = (lon: number, lat: number) => {
      return lat * longitudeCount + lon;
    };
    const faces: number[][] = [];

    const outmostRadius = (innerRadius + outerRadius) / 2;
    const inmostRadius = (outerRadius - innerRadius) / 2;

    for (let lat = 0; lat < latitudeCount; ++lat) {
      // First find the position on the prime meridian.
      const latRadians = lerp(0, Math.PI * 2, lat / (latitudeCount - 1));
      let x = outmostRadius + inmostRadius * Math.cos(latRadians);
      let y = inmostRadius * Math.sin(latRadians);


      for (let lon = 0; lon < longitudeCount; ++lon) {
        const lonRadians = lon / longitudeCount * 2 * Math.PI;
        positions.push(new Vector3(
          x * Math.cos(lonRadians),
          y,
          x * Math.sin(lonRadians)
        ));
        let nextLon = (lon + 1) % longitudeCount;
        let nextLat = (lat + 1) % latitudeCount;

        faces.push([
          index(lon, lat),
          index(nextLon, lat),
          index(lon, nextLat),
        ]);

        faces.push([
          index(nextLon, lat),
          index(nextLon, nextLat),
          index(lon, nextLat),
        ]);
      }
    }
    return new Trimesh(positions, faces);
  }

  static skybox() {
    const positions = [
      new Vector3(-1, -1,  1),
      new Vector3( 1, -1,  1),
      new Vector3(-1,  1,  1),
      new Vector3( 1,  1,  1),
      new Vector3(-1, -1, -1),
      new Vector3( 1, -1, -1),
      new Vector3(-1,  1, -1),
      new Vector3( 1,  1, -1),
    ];

    const faces = [
      [1, 0, 2],
      [1, 2, 3],
      [4, 5, 7],
      [4, 7, 6],
      [5, 1, 3],
      [5, 3, 7],
      [0, 4, 6],
      [0, 6, 2],
      [6, 7, 3],
      [6, 3, 2],
      [0, 1, 5],
      [0, 5, 4],
    ];

    return new Trimesh(positions, faces); 
  }
}
