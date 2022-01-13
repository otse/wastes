import { THREE, Group, Mesh, Shader, BoxGeometry, ConeGeometry, CylinderGeometry, Matrix3, Matrix4, MeshLambertMaterial, MeshBasicMaterial, MeshBasicMaterialParameters, Color } from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";

import lod, { numbers } from "./lod";
import wastes from "./wastes";
import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import tiles from "./tiles";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";

namespace objects {

	const mapSpan = 100;

	const color_wooden_door: vec3 = [210, 210, 210];
	const color_wooden_door_and_deck: vec3 = [24, 93, 61];
	const color_slimy_wall: vec3 = [20, 78, 54];
	const color_deck: vec3 = [114, 128, 124];
	const color_slimy_wall_and_deck: vec3 = [20, 78, 51];
	const color_acid_barrel: vec3 = [61, 118, 48];

	const color_false_front: vec3 = [255, 255, 255];

	export function register() {

		console.log(' objects register ');

		wastes.heightmap = new colormap('heightmap');
		wastes.objectmap = new colormap('objectmap');
		wastes.buildingmap = new colormap('buildingmap');
		wastes.roofmap = new colormap('roofmap');
		wastes.treemap = new colormap('treemap');
		wastes.colormap = new colormap('colormap');

		const treeTreshold = 50;

		function factory<type extends objected>(type: { new(): type }, pixel, pos) {
			let obj = new type;
			obj.pixel = pixel;
			obj.wpos = pos;
			lod.add(obj);
			return obj;
		}

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.objectmap.pixel(pos);
				if (pixel.is_color(color_acid_barrel)) {
					// factory(objects.acidbarrel, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.roofmap.pixel(pos);
				if (pixel.is_color(color_false_front)) {
					factory(objects.roof, pixel, pos);
					factory(objects.falsefront, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.buildingmap.pixel(pos);
				if (pixel.is_color(color_slimy_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos);
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_deck)) {
					factory(objects.deck, pixel, pos);
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_slimy_wall_and_deck)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos);
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_wooden_door)) {
					factory(objects.deck, pixel, pos);
					factory(objects.door, pixel, pos);
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_wooden_door_and_deck)) {
					factory(objects.deck, pixel, pos);
					factory(objects.door, pixel, pos);
					//factory(objects.roof, pixel, pos);
				}
			})
			return false;
		})
	}

	export function start() {

		console.log(' objects start ');

	}

	const zeroes: vec4 = [0, 0, 0, 0]

	export class pixel {
		constructor(
			public context: colormap,
			public pos: vec2,
			public array: vec4) {
		}
		left() {
			return this.context.pixel(pts.add(this.pos, [-1, 0]));
		}
		right() {
			return this.context.pixel(pts.add(this.pos, [1, 0]));
		}
		up() {
			return this.context.pixel(pts.add(this.pos, [0, 1]));
		}
		down() {
			return this.context.pixel(pts.add(this.pos, [0, -1]));
		}
		same(pixel: pixel) {
			return this.is_color(<vec3><unknown>pixel.array);
		}
		is_color(vec: vec3) {
			return vec[0] == this.array[0] && vec[1] == this.array[1] && vec[2] == this.array[2];
		}
		is_color_range(a: vec3, b: vec3) {
			return this.array[0] >= a[0] && this.array[0] <= b[0] &&
				this.array[1] >= a[1] && this.array[1] <= b[1] &&
				this.array[2] >= a[2] && this.array[2] <= b[2]
		}
		is_black() {
			return this.is_color([0, 0, 0]);
		}
		is_white() {
			return this.is_color([255, 255, 255]);
		}
	}

	export class colormap {
		readonly data: vec4[][] = []
		canvas
		ctx
		constructor(id: string) {
			var img = document.getElementById(id) as any;
			this.canvas = document.createElement('canvas')!;
			this.canvas.width = mapSpan;
			this.canvas.height = mapSpan;
			this.ctx = this.canvas.getContext('2d')!;
			//this.ctx.scale(1, 1);
			this.ctx.drawImage(img, 0, 0, img.width, img.height);
			this.process();
		}
		get(pos: vec2) {
			if (this.data[pos[1]])
				return this.data[pos[1]][pos[0]];
			return zeroes;
		}
		pixel(pos: vec2) {
			return new pixel(this, pos, this.get(pos));
		}
		process() {
			for (let y = 0; y < mapSpan; y++) {
				this.data[y] = [];
				for (let x = 0; x < mapSpan; x++) {
					const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
					if (this.data[y] == undefined)
						this.data[y] = [];
					this.data[y][x] = data;
				}
			}
		}
	}

	export class objected extends lod.obj {
		pixel?: pixel
		tile: tiles.tile
		cell: vec2 = [0, 0]
		constructor(hints, counts: numbers.tally) {
			super(hints, counts);
		}
		tiled() {
			this.tile = tiles.get(this.wpos)!;
		}
		//update(): void {
		//	this.tiled();
		//	super.update();
		//}
		stack() {
			this.z = 0;
			let stack = this.sector!.allat(this.wpos);
			for (let obj of stack) {
				if (obj == this)
					break;
				this.z += obj.height;
			}
			(this.shape as sprite).z = this.z;
		}
	}
	export class roof extends objected {
		constructor() {
			super(undefined, numbers.roofs);
			this.height = 3;
		}
		create() {
			this.tiled();
			this.size = [24, 17];
			let shape = new sprite({
				binded: this,
				tuple: sprites.droof,
				order: .6,
			});
			this.z = shape.z = 3 + 30;
		}
	}
	export class deck extends objected {
		constructor() {
			super(undefined, numbers.floors);
			this.height = 3;
		}
		create() {
			this.tiled();
			this.size = [24, 17];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddeck,
				cell: this.cell,
				order: .4,
			});
			this.stack();
		}
	}
	export class acidbarrel extends objected {
		constructor() {
			super(undefined, numbers.floors);
			this.height = 4;
		}
		create() {
			this.tiled();
			this.size = [24, 35];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dacidbarrel,
				order: .4,
			});
			this.stack();
		}
	}
	export class falsefront extends objected {
		constructor() {
			super(undefined, numbers.roofs);
			this.height = 10;
		}
		create() {
			this.tiled();
			this.cell = [255 - this.pixel!.array[3], 0];
			this.size = [24, 40];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dfalsefronts,
				cell: this.cell,
				order: .6,
			});
			this.stack();
		}
	}
	export class wall extends objected {
		constructor() {
			super(undefined, numbers.walls);
			this.height = 26;
		}
		create() {
			this.tiled();
			this.size = [24, 40];
			this.cell = [255 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dwallsslimy,
				cell: this.cell,
				order: .5,
			});
			this.stack();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		//tick() {
		//}
	}

	export class door extends objected {
		cell: vec2
		constructor() {
			super(undefined, numbers.walls);
			this.height = 26;
		}
		create() {
			this.tiled();
			this.size = [24, 40];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddoorwood,
				cell: this.cell,
				order: .5,
			});
			this.stack();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		//tick() {
		//}
	}

	export class shrubs extends objected {
		constructor() {
			super(undefined, numbers.trees);
		}
		create() {
			this.size = [24, 15];
			let shape = new sprite({
				binded: this,
				tuple: sprites.shrubs,
				order: .5
			});
		}

		//tick() {
		//}
	}
}

export default objects;