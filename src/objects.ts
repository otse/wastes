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
import app from "./app";

namespace objects {

	const mapSpan = 100;

	const color_door: vec3 = [210, 210, 210];
	const color_wooden_door_and_deck: vec3 = [24, 93, 61];
	const color_decidtree: vec3 = [20, 70, 20];
	const color_grass: vec3 = [40, 90, 40];
	const color_wheat: vec3 = [130, 130, 0];
	const color_scrappy_wall: vec3 = [20, 70, 50];
	const color_woody_wall: vec3 = [87, 57, 20];
	const color_church_wall: vec3 = [105, 102, 35];
	const color_medieval_wall: vec3 = [128, 128, 128];
	const color_scrappy_wall_with_deck: vec3 = [20, 78, 54];
	const color_deck_and_roof: vec3 = [114, 128, 124];
	const color_porch: vec3 = [110, 120, 120];
	const color_rails: vec3 = [110, 100, 120];
	const color_rusty_wall_and_deck: vec3 = [20, 84, 87];

	const color_false_front: vec3 = [255, 255, 255];

	const color_acid_barrel: vec3 = [61, 118, 48];
	const color_wall_chest: vec3 = [130, 100, 50];
	const color_shelves: vec3 = [130, 80, 50];

	export function factory<type extends objected>(type: { new(): type }, pixel, pos, hints = {}) {
		let obj = new type;
		obj.hints = hints;
		obj.pixel = pixel;
		obj.wpos = pos;
		lod.add(obj);
		return obj;
	}

	export function register() {

		console.log(' objects register ');

		wastes.heightmap = new colormap('heightmap');
		wastes.objectmap = new colormap('objectmap');
		wastes.buildingmap = new colormap('buildingmap');
		wastes.colormap = new colormap('colormap');
		wastes.roughmap = new colormap('roughmap');
		wastes.roofmap = new colormap('roofmap');

		const treeTreshold = 50;


		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.objectmap.pixel(pos);
				if (pixel.is_color(color_acid_barrel)) {
					// factory(objects.acidbarrel, pixel, pos);
				}
				else if (pixel.is_color(color_wall_chest)) {
					factory(objects.crate, pixel, pos);
				}
				else if (pixel.is_color(color_shelves)) {
					factory(objects.shelves, pixel, pos);
				}
			})
			return false;
		})

		/*hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.roofmap.pixel(pos);
				if (pixel.is_color(color_false_front)) {
					//factory(objects.roof, pixel, pos);
					factory(objects.falsefront, pixel, pos);
				}
			})
			return false;
		})*/

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.buildingmap.pixel(pos);
				if (pixel.is_color(color_scrappy_wall_with_deck)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'scrappy' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_woody_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'woody' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_church_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'church' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_medieval_wall)) {
					factory(objects.wall, pixel, pos, { type: 'medieval' });
				}
				else if (pixel.is_color(color_scrappy_wall)) {
					factory(objects.wall, pixel, pos, { type: 'scrappy' });
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_decidtree)) {
					factory(objects.decidtree, pixel, pos);

				}
				else if (pixel.is_color(color_grass)) {
					//factory(objects.grass, pixel, pos);
				}
				else if (pixel.is_color(color_wheat)) {
					factory(objects.wheat, pixel, pos);
				}
				else if (pixel.is_color(color_rusty_wall_and_deck)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'rusty' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_medieval_wall)) {
					factory(objects.wall, pixel, pos, { type: 'medieval' });
				}
				else if (pixel.is_color(color_deck_and_roof)) {
					factory(objects.deck, pixel, pos);
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_porch)) {
					factory(objects.porch, pixel, pos);
				}
				else if (pixel.is_color(color_rails)) {
					factory(objects.rails, pixel, pos);
				}
				else if (pixel.is_color(color_door)) {
					factory(objects.deck, pixel, pos);
					factory(objects.door, pixel, pos);
					factory(objects.roof, pixel, pos);
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

	export function tick() {

		if (app.key(' ') == 1) {
			wastes.HIDE_ROOFS = !wastes.HIDE_ROOFS;
			console.log('hide roofs', wastes.HIDE_ROOFS);
		}
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
		get(pos: vec2): vec4 | undefined {
			if (this.data[pos[1]])
				return this.data[pos[1]][pos[0]];
		}
		pixel(pos: vec2) {
			return new pixel(this, pos, this.get(pos) || [0, 0, 0, 0]);
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

	export function is_solid(pos: vec2) {
		const passable = ['land', 'deck', 'shelves', 'porch', 'pawn', 'you', 'door', 'leaves', 'roof', 'falsefront'];
		pos = pts.round(pos);
		let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
		let at = sector.stacked(pos);
		for (let obj of at) {
			if (passable.indexOf(obj.type) == -1) {
				return true;
			}
		}
		return false;
	}

	export class objected extends lod.obj {
		solid = true
		pixel?: pixel
		tile?: tiles.tile
		cell: vec2 = [0, 0]
		heightAdd = 0
		hints?: any
		calc = 0 // used for tree leaves
		constructor(counts: numbers.tally) {
			super(counts);

		}
		tiled() {
			this.tile = tiles.get(pts.round(this.wpos));
		}
		//update(): void {
		//	this.tiled();
		//	super.update();
		//}
		stack(fallthru: string[] = []) {
			let calc = 0;
			let stack = this.sector!.stacked(pts.round(this.wpos));
			for (let obj of stack) {
				if (fallthru.indexOf(obj.type) > -1)
					continue;
				if (obj == this)
					break;
				calc += obj.z + obj.height;
			}
			this.calc = calc;
			if (this.shape)
				(this.shape as sprite).rup = calc + this.heightAdd;
		}
	}
	export class wall extends objected {
		constructor() {
			super(numbers.walls);
			this.type = 'wall';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			this.cell = [255 - this.pixel!.array[3], 0];
			let tuple = sprites.dscrappywalls;
			if (this.hints?.type == 'rusty')
				tuple = sprites.drustywalls;
			if (this.hints?.type == 'woody')
				tuple = sprites.dwoodywalls;
			if (this.hints?.type == 'church')
				tuple = sprites.dchurchwalls;
			if (this.hints?.type == 'medieval')
				tuple = sprites.dmedievalwalls;
			else if (this.hints?.type == 'ruddy')
				tuple = sprites.druddywalls;
			else {
				//if (Math.random() > .5)
				//	tuple = sprites.dscrappywalls2;
			}
			let shape = new sprite({
				binded: this,
				tuple: tuple,
				cell: this.cell,
				order: .6,
			});
			this.stack();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		//tick() {
		//}
	}
	export class deck extends objected {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'deck'
			this.height = 3;
		}
		override create() {
			this.tiled();
			//this.tile!.z -= 24;
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
		override tick() {
			let pos = this.wpos;
			let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
			let at = sector.stacked(pos);
			for (let obj of at) {
				if (obj.type == 'you') {
					wastes.HIDE_ROOFS = true;
					break;
				}
			}
		}
	}
	export class porch extends objected {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'porch'
			this.height = 3;
		}
		override create() {
			this.tiled();
			//this.tile!.z -= 24;
			this.size = [24, 17];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dporch,
				cell: this.cell,
				order: .4,
			});
			this.stack();
		}
		override tick() {
		}
	}
	export class rails extends objected {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'porch'
			this.height = 3;
		}
		override create() {
			this.tiled();
			//this.tile!.z -= 24;
			this.size = [24, 17];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.drails,
				cell: this.cell,
				order: .4,
			});
			this.stack();
		}
		override tick() {
		}
	}
	export class decidtree extends objected {
		flowered = false
		constructor() {
			super(numbers.trees);
			this.type = 'decid tree'
			this.height = 29;
		}
		override create() {
			this.tiled();
			this.size = [24, 50];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddecidtreetrunk,
				order: 0.6,
			});
			this.stack();
			const tile = tiles.get(this.wpos)!;
			if (!this.flowered) {
				this.flowered = true;
				for (let y = -1; y <= 1; y++)
					for (let x = -1; x <= 1; x++)
						if (!(x == 0 && y == 0) /*&& Math.random() > .3*/)
							factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [x, y]), { tree: this, color: tile.color });
				factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { color: tile.color });
				factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { color: tile.color });
			}
		}
	}
	export class treeleaves extends objected {
		constructor() {
			super(numbers.leaves);
			this.type = 'leaves'
			this.height = 14;
		}
		override create() {
			this.tiled();
			this.size = [24, 31];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let color = this.hints.color || [255, 255, 255, 255];

			let color2 = wastes.colormap.pixel(this.wpos);

			if (!(255 - color2.array[3])) {
				if (this.hints.color) {
					color = [
						Math.floor(color[0] * 1.4),
						Math.floor(color[1] * 1.4),
						Math.floor(color[2] * 1.6),
						color[3],
					]
				}
				let shape = new sprite({
					binded: this,
					tuple: sprites.dtreeleaves,
					order: 0.7,
					color: color
				});
				if (this.hints.tree)
					this.special_leaves_stack();
				else
					this.stack();
			}
		}
		special_leaves_stack() {
			console.log('special stack');
			const tree = this.hints.tree;
			if (this.shape) {
				this.z = tree.calc + tree.height;
				(this.shape as sprite).rup = this.z;
			}
		}
	}
	export class grass extends objected {
		constructor() {
			super(numbers.roofs);
			this.type = 'grass';
			this.height = 4;
			this.solid = false;
		}
		override create() {
			this.tiled();
			this.size = [24, 30];
			let color = tiles.get(this.wpos)!.color;
			color = [
				Math.floor(color[0] * 1.5),
				Math.floor(color[1] * 1.5),
				Math.floor(color[2] * 2.0),
				color[3],
			]
			this.cell = [255 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dgrass,
				cell: this.cell,
				order: .6,
				color: color
			});
			this.stack();
		}
	}
	export class wheat extends objected {
		constructor() {
			super(numbers.roofs);
			this.type = 'wheat';
			this.height = 4;
		}
		override create() {
			this.tiled();
			this.size = [24, 30];
			//let color =  tiles.get(this.wpos)!.color;
			//this.cell = [Math.floor(Math.random() * 2), 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dwheat,
				cell: this.cell,
				//color: color,
				order: .6
			});
			this.stack();
		}
	}
	type item = [string: string, amount: number]
	export class container {
		tuples: [string: string, amount: number][] = []
		constructor() {
			if (Math.random() > .5)
				this.add('beer');
			if (Math.random() > .5)
				this.add('string');
			if (Math.random() > .5)
				this.add('stone');
		}
		add(item: string) {
			let found = false;
			for (let tuple of this.tuples) {
				if (tuple[0] == item) {
					tuple[1] += 1;
					found = true;
					break;
				}
			}
			if (!found) {
				this.tuples.push([item, 1]);
			}
			this.tuples.sort();
		}
		remove(name: string) {
			for (let i = this.tuples.length - 1; i >= 0; i--) {
				const tuple = this.tuples[i];
				if (tuple[0] == name) {
					tuple[1] -= 1;
					if (tuple[1] <= 0)
						this.tuples.splice(i, 1);
					break;
				}
			}
		}
	}
	export class crate extends objected {
		container: container = new container
		constructor() {
			super(numbers.objs);
			this.type = 'crate'
			this.height = 17;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			//let color =  tiles.get(this.wpos)!.color;
			//this.cell = [Math.floor(Math.random() * 2), 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dcrate,
				cell: this.cell,
				//color: color,
				order: .6
			});
			this.stack(['roof']);
		}
	}
	export class shelves extends objected {
		container: container = new container
		constructor() {
			super(numbers.objs);
			this.type = 'shelves'
			this.height = 0;
		}
		override create() {
			this.tiled();
			this.size = [20, 31];
			//this.cell = [255 - this.pixel!.array[3], 0];
			return
			let shape = new sprite({
				binded: this,
				tuple: sprites.dshelves,
				//cell: this.cell,
				order: 0
			});
			shape.rup2 = 9;
			shape.rleft = 6;
			this.stack(['roof']);
		}
	}
	export class roof extends objected {
		constructor() {
			super(numbers.roofs);
			this.type = 'roof';
			this.height = 2;
		}
		override create() {
			//return;
			this.tiled();
			this.size = [24, 17];
			let shape = new sprite({
				binded: this,
				tuple: sprites.droof,
				order: 1.6,
			});
			shape.rup = 29;
		}
		override tick() {
			const sprite = this.shape as sprite;
			if (!sprite)
				return;
			if (wastes.HIDE_ROOFS)
				sprite.mesh.visible = false;
			else if (!wastes.HIDE_ROOFS)
				sprite.mesh.visible = true;
		}
	}
	export class falsefront extends objected {
		constructor() {
			super(numbers.roofs);
			this.type = 'falsefront'
			this.height = 5;
		}
		override create() {
			this.tiled();
			this.cell = [255 - this.pixel!.array[3], 0];
			this.size = [24, 40];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dfalsefronts,
				cell: this.cell,
				order: .7,
			});
			this.stack();
			//this.z = 29+4;
		}
		override tick() {
			const sprite = this.shape as sprite;
			if (!sprite)
				return;
			if (wastes.HIDE_ROOFS)
				sprite.mesh.visible = false;
			else if (!wastes.HIDE_ROOFS)
				sprite.mesh.visible = true;
		}
	}
	export class acidbarrel extends objected {
		constructor() {
			super(numbers.objs);
			this.type = 'acidbarrel'
			this.height = 4;
		}
		override create() {
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

	export class door extends objected {
		static order = .7;
		open = false
		cell: vec2
		constructor() {
			super(numbers.walls);
			this.type = 'door'
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			this.cell = [255 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddoor,
				cell: this.cell,
				order: door.order,
			});
			this.stack();
		}
		override tick() {
			let pos = this.wpos;
			let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
			let at = sector.stacked(pos);
			let pawning = false;
			for (let obj of at) {
				if (['pawn', 'you'].indexOf(obj.type) != -1) {
					pawning = true;
					let sprite = this.shape as sprite;
					sprite.vars.cell = pts.subtract(this.cell, [1, 0]);
					sprite.vars.order = 1.55;
					sprite.retransform();
					sprite.update();
					this.open = true;
					break;
				}
			}
			if (!pawning) {
				let sprite = this.shape as sprite;
				sprite.vars.cell = this.cell;
				sprite.vars.order = door.order;
				sprite.retransform();
				sprite.update();
				this.open = false;
			}
		}
	}

	export class shrubs extends objected {
		constructor() {
			super(numbers.trees);
			this.type = 'shrubs'
		}
		override create() {
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