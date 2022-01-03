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
			wastes.view.add(tile);
		})
	}

	export class Tile extends lod.Obj {
		constructor(wpos: vec2) {
			super(undefined, Numbers.Tiles);
			this.wpos = wpos;
			this.size = [24, 12];
			this.z = objects.heightmap.bit(this.wpos)[0];
		}
		create() {
			let img, clr;
			img = 'tex/dtileup4';
			this.size = [24, 17];
			this.z = 4;
			clr = objects.colormap.bit(this.wpos);
			//clr = [255, 255, 255, 255];
			if ((clr[0] == 0 && clr[1] == 0 && clr[2] == 0)) {
				img = 'tex/dtile';
				clr = [63, 63, 127, 255];
				this.size = [24, 12];
				this.z = 0;
			}
			let shape = new Sprite({
				bind: this,
				img: img,
				color: clr
			})
		}
		//update() {}
		delete() {
		}
		tick() {
			return;
			if (!this.shape)
				return;
			let shape = this.shape as Sprite;
			let mrpos = pts.add(wastes.view.mrpos, [0, -this.z]);
			let mwpos = lod.galaxy.unproject(mrpos);
			if (false)
				shape.mesh.material.color.set('salmon');
			if (pts.equals(this.wpos, pts.floor(mwpos)))
				shape.mesh.material.color.set('green');
			//else
			//shape.material.color.set('white');
		}
	}

}

export default tiles;