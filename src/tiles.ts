import { Vector2, Mesh, Shader, Texture, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Matrix3, Matrix4 } from "three";

import wests from "./wastes";
import lod, { Counts } from "./lod";
import ren from "./renderer";
import pts from "./pts";
import objectmaps from "./objects";
import aabb2 from "./aabb2";
import hooks from "./hooks";
import Sprite from "./sprite";

export namespace tiles {

	const mapSize = 10

	var tiles: Tile[][] = []

	export function register() {
		
		console.log(' tiles register ');

	}

	export function start() {

		console.log(' tiles start ');

		pts.func(new aabb2([0, 0], [mapSize - 1, mapSize - 1]), (pos: vec2) => {
			let x = pos[0]
			let y = pos[1]
			if (tiles[y] == undefined)
				tiles[y] = []
			let tile = new Tile([x, y])
			tiles[y][x] = tile
			tile.create()
			wests.view.add(tile)
			return false
		})
	}

	export class Tile extends lod.Obj {
		constructor(pos: vec2) {
			super(undefined, Counts.Tiles)
			this.wpos = pos
			this.size = [16, 14]
			
		}
		create() {
			console.log('tile create');
			const clr = objectmaps.colormap.bit(this.wpos);
			let shape = new Sprite({
				bind: this,
				img: 'tex/grass',
				color: clr
			})
		}
		delete() {
		}
		tick() {
			super.update();
			this.sector?.swap(this);
		}
	}

}

export default tiles;