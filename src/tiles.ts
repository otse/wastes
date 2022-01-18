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

	export var mpos4: vec2

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
			
		let mpos0 = lod.unproject(pts.add(wastes.gview.mrpos, [0, 0]));
		mpos0 = pts.floor(mpos0);
		mpos4 = lod.unproject(pts.add(wastes.gview.mrpos, [0, -4]));
		mpos4 = pts.floor(mpos4);

		const tile4 = get(mpos4);
		if (tile4 && tile4.z == 4)
			tile4?.hover();

		const tile0 = get(mpos0);
		if (tile0 && tile0.z == 0)
			tile0?.hover();
	}

	const color_purple_water: vec4 = [66, 66, 110, 255];

	export class tile extends lod.obj {
		z: number = 0
		tuple: sprites.tuple
		objs: lod.obj[] = []
		color: vec4
		constructor(wpos: vec2) {
			super(numbers.tiles);
			this.tuple = sprites.dtile;
			this.wpos = wpos;
			this.size = [24, 12];
			this.color = color_purple_water;
			let pixel = wastes.colormap.pixel(this.wpos);			
			if (!pixel.is_black()) {
				this.z = this.height = 4;
				this.tuple = sprites.dtilesand;
				this.size = [24, 17];
				this.color = wastes.colormap.pixel(this.wpos).array;
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
				color: this.color
			});
		}
		//update() {}
		delete() {
		}
		hover() {
			let sprite = this.shape as sprite;
			if (!sprite?.mesh)
				return;
			// sprite.mesh.material.color.set('green');
		}
		tick() {
		}
	}

}

export default tiles;