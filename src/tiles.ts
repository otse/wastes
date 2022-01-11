import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wastes from "./wastes";
import lod, { Numbers } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import objects from "./objects";
import aabb2 from "./aabb2";
import hooks from "./hooks";
import Sprite from "./sprite";
import sprites from "./sprites";

export namespace tiles {

	const mapSize = 100

	var tiles: Tile[][] = []

	export var raisedmpos: vec2

	export function get(pos: vec2) {
		if (tiles[pos[1]])
			return tiles[pos[1]][pos[0]];
	}

	export function register() {

		console.log(' tiles register ');

	}

	export function start() {

		console.log(' tiles start ');

		pts.func(new aabb2([0, 0], [mapSize - 1, mapSize - 1]), (pos: vec2) => {
			let x = pos[0];
			let y = pos[1];
			if (tiles[y] == undefined)
				tiles[y] = [];
			let tile = new Tile([x, y]);
			tiles[y][x] = tile;
			lod.add(tile);
		})
	}

	export function tick() {
		raisedmpos = lod.unproject(pts.add(wastes.view.mrpos, [0, -4]));
		raisedmpos = pts.floor(raisedmpos);

		const tile = get(raisedmpos);
		if (tile && tile.z == 4)
			tile?.hover();
	}

	export class Tile extends lod.Obj {
		z: number
		tuple: sprites.tuple
		color: vec4
		constructor(wpos: vec2) {
			super(undefined, Numbers.Tiles);
			this.tuple = sprites.dtile;
			this.wpos = wpos;
			this.size = [24, 12];
			this.z = 0;
			this.color = objects.Pixel.water_color();
			let pixel = wastes.colormap.pixel(this.wpos);
			if (!pixel.is_black()) {
				this.z = 4;
				this.tuple = sprites.dtile4;
				this.size = [24, 17];
				this.color = wastes.colormap.pixel(this.wpos).array;
			}
		}
		create() {
			let shape = new Sprite({
				binded: this,
				tuple: this.tuple,
				color: this.color
			});
		}
		//update() {}
		delete() {
		}
		hover() {
			let sprite = this.shape as Sprite;
			if (!sprite?.mesh)
				return;
			//sprite.mesh.material.color.set('green');
		}
		tick() {
		}
	}

}

export default tiles;