import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wastes from "./wastes";
import lod, { numbers } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import objects from "./objects";
import aabb2 from "./aabb2";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";

export namespace tiles {

	const mapSize = 100

	var arrays: tiles.tile[][] = []

	export var raisedmpos: vec2

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

		console.log(' tiles start ');

		lod.ggalaxy.at(lod.ggalaxy.big(wastes.gview.wpos));
	}

	export function tick() {
		raisedmpos = lod.unproject(pts.add(wastes.gview.mrpos, [0, -4]));
		raisedmpos = pts.floor(raisedmpos);

		const tile = get(raisedmpos);
		if (tile && tile.z == 4)
			tile?.hover();
	}

	export class tile extends lod.obj {
		last?: objects.objected
		z: number = 0
		tuple: sprites.tuple
		objs: lod.obj[] = []
		color: vec4
		constructor(wpos: vec2) {
			super(undefined, numbers.tiles);
			this.tuple = sprites.dtile;
			this.wpos = wpos;
			this.size = [24, 12];
			this.color = objects.pixel.water_color();
			let pixel = wastes.colormap.pixel(this.wpos);
			if (!pixel.is_black()) {
				this.z = this.height = 4;
				this.tuple = sprites.dtile4;
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
			//sprite.mesh.material.color.set('green');
		}
		tick() {
		}
	}

}

export default tiles;