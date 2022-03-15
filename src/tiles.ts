import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wastes from "./wastes";
import lod, { numbers } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";

export namespace tiles {

	const mapSize = 100

	export var started = false;

	var arrays: tiles.tile[][] = []

	export function get(pos: vec2) {
		if (arrays[pos[1]])
			return arrays[pos[1]][pos[0]];
	}

	export function register() {

		console.log(' tiles register ');

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let x = pos[0];
				let y = pos[1];
				if (arrays[y] == undefined)
					arrays[y] = [];
				let tile = new tiles.tile([x, y]);
				arrays[y][x] = tile;
				lod.add(tile);
			});
			return false;
		});

	}

	export function start() {

		started = true;

		console.log(' tiles start ');

		lod.ggalaxy.at(lod.ggalaxy.big(wastes.gview.wpos));
	}

	export function tick() {

		if (!started)
			return;

		for (let i = 40; i >= 0; i--) {
			let pos = lod.unproject(pts.add(wastes.gview.mrpos, [0, -i]));
			pos = pts.floor(pos);
			const tile = get(pos);
			if (tile && tile.z + tile.height + tile.heightAdd == i) {
				tile?.hover();
				break;
			}
		}

	}

	const color_purple_water: vec4 = [66, 66, 110, 255];

	export class tile extends lod.obj {
		tuple: sprites.tuple
		cell: vec2
		// objs: lod.obj[] = []
		color: vec4
		constructor(wpos: vec2) {
			super(numbers.tiles);
			this.wpos = wpos;
			this.size = [24, 12];
			this.tuple = sprites.dtile;
			this.color = color_purple_water;
			let colormapPixel = wastes.colormap.pixel(this.wpos);
			let heightmapPixel = wastes.heightmap.pixel(this.wpos);
			if (!colormapPixel.is_black()) {
				this.height = 6;
				this.tuple = sprites.dswamptiles;
				this.cell = [1, 0];
				this.size = [24, 30];
				this.color = wastes.colormap.pixel(this.wpos).array;
				
				const divisor = 1.5;
				let height = wastes.heightmap.pixel(this.wpos);
				this.z = Math.floor(height.array[0] / divisor);
				this.z -= 3;
			}
		}
		get_stack() {
			const objs = this.sector?.objsro();
		}
		/*stack(obj: lod.obj) {
			let i = this.objs.indexOf(obj);
			if (i == -1)
				this.objs.push(obj);
		}
		unstack(obj: lod.obj) {
			let i = this.objs.indexOf(obj);
			if (i > -1)
				return this.objs.splice(i, 1).length;
		}*/
		create() {
			let shape = new sprite({
				binded: this,
				tuple: this.tuple,
				cell: this.cell,
				color: this.color,
				order: .3
			});
			// if we have a deck, add it to heightAdd
			let sector = lod.ggalaxy.at(lod.ggalaxy.big(this.wpos));
			let at = sector.allat(this.wpos);
			for (let obj of at) {
				if (obj.type == 'deck')
					this.heightAdd = obj.height;
			}
			shape.rup = this.z;

		}
		//update() {}
		delete() {
		}
		hover() {
			let sprite = this.shape as sprite;
			if (!sprite?.mesh)
				return;
			sprite.mesh.material.color.set('green');
		}
		tick() {
		}
	}

}

export default tiles;