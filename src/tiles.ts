import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wastes from "./wastes";
import lod, { Numbers } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import objects from "./objects";
import aabb2 from "./aabb2";
import hooks from "./hooks";
import Sprite from "./sprite";

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
		z = 0
		constructor(wpos: vec2) {
			super(undefined, Numbers.Tiles);
			this.wpos = wpos;
			this.size = [24, 12];
			let clr = objects.colormap.bit(this.wpos);
			this.z = 4;
			if (clr[0] == 0 && clr[1] == 0 && clr[2] == 0)
				this.z = 0;
			//this.z = objects.heightmap.bit(this.wpos)[0];
		}
		create() {
			let img, clr;
			img = 'tex/dtileup4';
			this.size = [24, 17];
			clr = objects.colormap.bit(this.wpos);
			//clr = [255, 255, 255, 255];
			if (this.z == 0) {
				img = 'tex/dtile';
				clr = [63, 63, 127, 255];
				this.size = [24, 12];
			}
			let shape = new Sprite({
				bindObj: this,
				img: img,
				color: clr
			})
		}
		//update() {}
		delete() {
		}
		hover() {
			let sprite = this.shape as Sprite;
			if (!sprite?.mesh)
				return;
			sprite.mesh.material.color.set('green');
		}
		tick() {
		}
	}

}

export default tiles;