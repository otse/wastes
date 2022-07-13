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

	const color_gravel: vec3 = [110, 122, 115];

	export var hovering: tile | undefined = undefined

	export function get(pos: vec2) {
		if (arrays[pos[1]])
			return arrays[pos[1]][pos[0]];
	}

	export function register() {

		console.log(' tiles register ');

		// this runs before the objects hooks

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
			// pretention grid
			let pos = lod.unproject(pts.add(wastes.gview.mrpos, [0, -i]));
			pos = pts.floor(pos);
			const tile = get(pos);
			if (tile && tile.z + tile.height + tile.heightAdd == i) {
				if (tile.sector!.isActive()) {
					tile.hover();
					hovering = tile;
					break;
				}
			}
		}

	}

	const color_purple_water: vec4 = [40, 120, 130, 255];

	export class tile extends lod.obj {
		static lastHover?: tile
		tuple: sprites.tuple
		cell: vec2
		// objs: lod.obj[] = []
		color: vec4
		opacity = 1
		colorPrev
		constructor(wpos: vec2) {
			super(numbers.tiles);

			this.wpos = wpos;

			let colour = wastes.colormap.pixel(this.wpos);

			if (colour.is_black()) {
				this.type = 'water';
				this.size = [24, 12];
				this.tuple = sprites.dtile;
				this.opacity = .5;
				this.color = color_purple_water;
			}
			if (!colour.is_black()) {
				this.type = 'land';
				this.size = [24, 30];
				this.tuple = sprites.dgraveltiles;
				this.height = 6;
				this.cell = [1, 0];
				this.color = wastes.colormap.pixel(this.wpos).array;

				const useRoughMap = false;

				if (useRoughMap) {
					let biome = wastes.roughmap.pixel(this.wpos);
					if (biome.array[0] > 70) {
						this.tuple = sprites.dswamptiles;
						//this.z -= 1;
					}
				}

				const divisor = 5;
				let height = wastes.heightmap.pixel(this.wpos);
				this.z += Math.floor(height.array[0] / divisor);
				this.z -= 3; // so we dip the water
				//this.z += Math.random() * 24;
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
		override create() {
			let shape = new sprite({
				binded: this,
				tuple: this.tuple,
				cell: this.cell,
				color: this.color,
				opacity: this.opacity,
				order: -.6
			});
			// if we have a deck, add it to heightAdd
			let sector = lod.ggalaxy.at(lod.ggalaxy.big(this.wpos));
			let at = sector.stacked(this.wpos);
			for (let obj of at) {
				if (obj.type == 'deck' || obj.type == 'porch')
					this.heightAdd = obj.height;
			}
			shape.rup = this.z;

		}
		//update() {}
		delete() {
		}
		hover() {
			const sprite = this.shape as sprite;
			if (!sprite?.mesh)
				return;
			const last = tile.lastHover
			if (last && last != this && last.sector!.isActive()) {
				last.hide();
				last.show();
			}
			sprite.mesh.material.color.set('green');
			tile.lastHover = this;
		}
		paint() {
			const sprite = this.shape as sprite;
			if (!sprite?.mesh)
				return;
			[Math.floor(Math.random() * 4)];
			sprite.mesh.material.color.set('pink');
		}
		tick() {
		}
	}

}

export default tiles;