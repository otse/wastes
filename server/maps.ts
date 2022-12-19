import fs from 'fs';
import { PNG } from 'pngjs';
import pts from '../src/pts';

namespace maps {

	const sizeOfMap = 100;

	export class spixel {
		constructor(
			public context: scolormap,
			public pos: vec2,
			public vec: vec4) {

		}
		is_color(vec: vec3) {
			return vec[0] == this.vec[0] && vec[1] == this.vec[1] && vec[2] == this.vec[2];
		}
	}
	export class scolormap {
		pixels: vec4[][] = []
		size: vec2 = [sizeOfMap, sizeOfMap]
		constructor(private name: string) {
			//this.read();
		}
		then(resolve, reject) {
			resolve(this);
		}
		normalize(pos: vec2) {
			pos[1] = sizeOfMap - pos[1];
			pos = pts.subtract(pos, [0, 1]);
			return pos;
		}
		private get(pos: vec2): vec4 | undefined {
			//pos = this.normalize(pos);
			if (this.pixels[pos[1]])
				return this.pixels[pos[1]][pos[0]];
		}
		pixel(pos: vec2) {
			// We were attacking the original array, hard to catch bug
			pos = pts.clone(pos);
			pos = this.normalize(pos);
			let vec = this.get(pos);
			if (vec)
				return new spixel(this, pos, vec);
			return new spixel(this, pos, [255, 0, 255, 0]);
		}
		async read() {
			const { name, pixels } = this;
			return new Promise((resolve, reject) => {
				fs.createReadStream(`../${name}.png`)
					.pipe(
						new PNG({
							filterType: 4,
						})
					)
					.on("parsed", function () {
						for (var y = 0; y < this.height; y++) {
							pixels[y] = [];
							for (var x = 0; x < this.width; x++) {
								var idx = (this.width * y + x) << 2;

								// invert color
								/*this.data[idx] = 255 - this.data[idx];
								this.data[idx + 1] = 255 - this.data[idx + 1];
								this.data[idx + 2] = 255 - this.data[idx + 2];*/

								pixels[y][x] = [
									this.data[idx],
									this.data[idx + 1],
									this.data[idx + 2],
									this.data[idx + 3],
								]

								// and reduce opacity
								//this.data[idx + 3] = this.data[idx + 3] >> 1;
							}
						}

						//this.pack().pipe(fs.createWriteStream("out.png"));
						resolve(1);
					});
			})
		}
	}
}

export default maps;