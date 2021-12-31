import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wastes from "./wastes";
import lod, { Numbers } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import objectmaps from "./objects";
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
			tile.create();
			wastes.view.add(tile);
			return false;
		})
	}

	export class Tile extends lod.Obj {
		constructor(wpos: vec2) {
			super(undefined, Numbers.Tiles);
			this.wpos = wpos;
			this.size = [24, 12];
		}
		create() {
			let img = 'tex/dtile';
			if (Math.random() > .9)
			{
				img = 'tex/dtileup';
				this.size = [24, 17];
				this.z = 1;
			}
			const clr = objectmaps.colormap.bit(this.wpos);
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
			let shape = this.shape as Sprite;			
			if (pts.equals(this.wpos, pts.floor(wastes.view.mwpos)))
				shape.mesh.material.color.set('green');
			//else
				//shape.material.color.set('white');
		}
	}

}

export default tiles;