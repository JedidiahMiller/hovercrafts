import { Trimesh } from 'lib/trimesh.js';
import { Vector3 } from 'lib/vector.js';
import { fetchText } from './web-utilities.js';

class TrimeshIo {
  static async readFromUrl(url: string): Promise<Trimesh> {
    const objText = await fetchText(url);
    return TrimeshIo.readFromText(objText);
  }

  static readFromText(objText: string): Trimesh {
    const positions = [];
    const faces = [];
    
    for (let line of objText.split(/\r?\n/)) {
      const fields = line.split(' ');
      if (fields.length > 0) {
        if (fields[0] === 'v' && fields.length === 4) {
          positions.push(new Vector3(
            parseFloat(fields[1]),
            parseFloat(fields[2]),
            parseFloat(fields[3])
          ));
        } else if (fields[0] === 'f' && fields.length === 4) {
          faces.push([
            parseInt(fields[1]) - 1,
            parseInt(fields[2]) - 1,
            parseInt(fields[3]) - 1
          ]);
        }
      }
    }

    return new Trimesh(positions, faces);
  }
}
