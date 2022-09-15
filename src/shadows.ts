import lod from "./lod";
import wastes from "./wastes";
import ren from "./renderer";
import sprite from "./sprite";
import sprites from "./sprites";
import colormap from "./colormap";
import tiles from "./tiles";
import pts from "./pts";


export namespace shadows {

	// takes care of shadows cast by tree-leaves and walls

	const default_shade = 1.0;

	export var data: number[][] = []

	export function shade(pos: vec2, amount: number, set = false) {
		if (!set)
			data[pos[1]][pos[0]] -= amount;
		else if (set && amount)
			data[pos[1]][pos[0]] = amount;

		if (data[pos[1]][pos[0]] < 0)
			data[pos[1]][pos[0]] = 0;

		const tile = tiles.get(pos);
		if (tile)
			tile.refresh = true;
	}

	export function shade_matrix(pos: vec2, matrix: number[][], set = false) {
		for (let y = 0; y < matrix.length; y++) {
			for (let x = 0; x < matrix[y].length; x++) {
				let negx = -Math.floor(matrix[y].length / 2) + x;
				let negy = -Math.floor(matrix[y].length / 2) + y;
				//console.log([negx, negy]);

				let pos2 = pts.add(pos, [negx, negy]);
				shade(pos2, matrix[y][x], set);
				//shade
			}
		}

		tiles.get(pos)!.refresh = true;
	}

	export function get_amount(pos: vec2): number {
		if (data[pos[1]])
			return data[pos[1]][pos[0]] || 0;
		else
			return default_shade;
	}

	// shades the color by multplication
	export function mix(a: vec3, pos: vec2): vec3 {
		const n = get_amount(pos);
		let dupe = [a[0], a[1], a[2]] as vec3;
		dupe[0] = a[0] * n;
		dupe[1] = a[1] * n;
		dupe[2] = a[2] * n;
		return dupe;
	}

	export function start() {
		for (let y = 0; y < colormap.mapSpan; y++) {
			this.data[y] = [];
			for (let x = 0; x < colormap.mapSpan; x++) {
				this.data[y][x] = default_shade;
			}
		}
	}

	export function tick() {
	}

}

export default shadows;