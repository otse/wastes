import { THREE, Group, Mesh, Shader, BoxGeometry, ConeGeometry, CylinderGeometry, Matrix3, Matrix4, MeshLambertMaterial, MeshBasicMaterial, MeshBasicMaterialParameters, Color } from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";

import lod, { numbers } from "./lod";
import wastes, { win, pawns } from "./wastes";
import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import tiles from "./tiles";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";
import app from "./app";
import colormap from "./colormap";
import shadows from "./shadows";

namespace objects {

	const color_door: vec3 = [210, 210, 210];
	const color_wooden_door_and_deck: vec3 = [24, 93, 61];
	const color_decidtree: vec3 = [20, 70, 20];
	const color_deadtree: vec3 = [60, 70, 60];
	const color_grass: vec3 = [40, 90, 40];
	const color_wheat: vec3 = [130, 130, 0];
	const color_scrappy_wall: vec3 = [20, 70, 50];
	const color_woody_wall: vec3 = [87, 57, 20];

	const color_plywood_wall: vec3 = [20, 84, 87];
	const color_overgrown_wall: vec3 = [35, 105, 63];
	const color_deringer_wall: vec3 = [80, 44, 27];

	const color_medieval_wall: vec3 = [128, 128, 128];
	const color_scrappy_wall_with_deck: vec3 = [20, 78, 54];
	const color_deck_and_roof: vec3 = [114, 128, 124];
	const color_porch: vec3 = [110, 120, 120];
	const color_rails: vec3 = [110, 100, 120];

	const color_false_front: vec3 = [255, 255, 255];

	const color_acid_barrel: vec3 = [61, 118, 48];
	const color_wall_chest: vec3 = [130, 100, 50];
	const color_shelves: vec3 = [130, 80, 50];
	const color_panel: vec3 = [78, 98, 98];

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

		wastes.heightmap = new colormap.colormap('heightmap');
		wastes.objectmap = new colormap.colormap('objectmap');
		wastes.buildingmap = new colormap.colormap('buildingmap');
		wastes.colormap = new colormap.colormap('colormap');
		wastes.roughmap = new colormap.colormap('roughmap');
		wastes.roofmap = new colormap.colormap('roofmap');

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
				else if (pixel.is_color(color_panel)) {
					factory(objects.panel, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.roofmap.pixel(pos);
				if (pixel.is_color(color_false_front)) {
					//factory(objects.roof, pixel, pos);
					//factory(objects.falsefront, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.buildingmap.pixel(pos);
				if (pixel.is_color(color_plywood_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'plywood' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_overgrown_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'overgrown' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_deringer_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'sideroom' });
					factory(objects.roof, pixel, pos);
				}
				//else if (pixel.is_color(color_medieval_wall)) {
				//	factory(objects.wall, pixel, pos, { type: 'medieval' });
				//}
				else if (pixel.is_color(color_scrappy_wall)) {
					factory(objects.wall, pixel, pos, { type: 'scrappy' });
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(color_decidtree)) {
					factory(objects.decidtree, pixel, pos, { type: 'decid' });

				}
				else if (pixel.is_color(color_deadtree)) {
					factory(objects.deadtree, pixel, pos);

				}
				else if (pixel.is_color(color_grass)) {
					//factory(objects.grass, pixel, pos);
				}
				else if (pixel.is_color(color_wheat)) {
					factory(objects.wheat, pixel, pos);
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

	export function is_solid(pos: vec2) {
		const passable = ['land', 'deck', 'shelves', 'porch', 'pawn', 'you', 'door', 'leaves', 'roof', 'falsefront', 'panel'];
		pos = pts.round(pos);
		let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
		let at = sector.stacked(pos);
		for (let obj of at) {
			if (!obj.is_type(passable)) {
				return true;
			}
		}
		return false;
	}

	export class objected extends lod.obj {
		static focus: objected
		isObjected = true
		paintTimer = 0
		paintedRed = false
		solid = true
		pixel?: colormap.pixel
		tile?: tiles.tile
		tileBound: aabb2
		cell: vec2 = [0, 0]
		heightAdd = 0
		hints?: any
		calc = 0 // used for tree leaves
		constructor(counts: numbers.tally) {
			super(counts);

		}
		tiled() {
			this.tile = tiles.get(pts.round(this.wpos));
			this.tileBound = new aabb2([-.5, -.5], [.5, .5]);
			this.tileBound.translate(this.wpos);
		}
		onhit() {
			const sprite = this.shape as sprite;
			if (sprite) {
				sprite.material.color.set('red');
				this.paintedRed = true;
			}
		}
		tick() {
			if (this.paintedRed) {
				this.paintTimer += ren.delta;
				if (this.paintTimer > 1)
				{
					const sprite = this.shape as sprite;
					sprite.material.color.set('white');
					console.log('beo');
					
					this.paintedRed = false;
					this.paintTimer = 0;
				}
			}
			//console.log('oo');
				
		}
		//update(): void {
		//	this.tiled();
		//	super.update();
		//}
		stack(fallthru: string[] = []) {
			let calc = 0;
			let stack = this.sector!.stacked(pts.round(this.wpos));
			for (let obj of stack) {
				if (obj.is_type(fallthru))
					continue;
				if (obj == this)
					break;
				calc += obj.z + obj.height;
			}
			this.calc = calc;
			if (this.shape)
				(this.shape as sprite).rup = calc + this.heightAdd;
		}
		setup_context() { // override me
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
			if (this.hints?.type == 'plywood')
				tuple = sprites.dderingerwalls;
			if (this.hints?.type == 'overgrown')
				tuple = sprites.dovergrownwalls;
			if (this.hints?.type == 'deringer')
				tuple = sprites.dderingerwalls;
			if (this.hints?.type == 'woody')
				tuple = sprites.dwoodywalls;
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
				orderBias: .6,
			});

			this.stack();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		/*tick() {
			if (this.mousedSquare(wastes.gview.mrpos2)) {
				const sprite = this.shape as sprite;
				sprite.material.color.set('#c1ffcd');
			}
		}*/
		/*onhit() {
			const sprite = this.shape as sprite;
			if (sprite) {
				sprite.material.color.set('red');
			}
		}*/
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
			this.tile!.hasDeck = true;
			//this.tile!.z -= 24;
			this.size = [24, 17];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddeck,
				cell: this.cell,
				orderBias: .4,
			});
			this.stack();
		}
		override tick() {
			super.tick();
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
			let color = [255, 255, 255, 255] as vec4;
			color = shadows.calc(color, this.wpos);

			let shape = new sprite({
				binded: this,
				tuple: sprites.dporch,
				cell: this.cell,
				orderBias: .0,
				color: color
			});
			this.stack();

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
				orderBias: .4,
			});
			this.stack();
		}
		override tick() {
		}
	}
	export class deadtree extends objected {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'tree'
			this.height = 3;
		}
		override create() {
			this.tiled();
			this.size = [24, 50];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddeadtreetrunk,
				orderBias: 0.6,
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
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 50];
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddecidtreetrunk,
				orderBias: 0.6,
			});
			this.stack();
			const tile = tiles.get(this.wpos)!;
			if (!this.flowered) {
				this.flowered = true;
				for (let y = -1; y <= 1; y++)
					for (let x = -1; x <= 1; x++)
						if (!(x == 0 && y == 0) /*&& Math.random() > .3*/)
							factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [x, y]), { type: this.hints.type, tree: this, color: tile.color });
				factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color });
				factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color });
			}
		}
	}
	export class treeleaves extends objected {
		shaded = false
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
						Math.floor(color[0] * 1.6),
						Math.floor(color[1] * 1.6),
						Math.floor(color[2] * 1.6),
						color[3],
					]
				}
				let tuple = sprites.dtreeleaves;
				let shape = new sprite({
					binded: this,
					tuple: tuple,
					orderBias: 0.7,
					color: color
				});
				//shadows.shade(this.wpos, 0.1);
				if (!this.shaded) {
					this.shaded = true;
					const shadow = 0.03;
					shadows.shade_matrix(this.wpos,
						[
							[shadow / 2, shadow, shadow / 2],
							[shadow, shadow, shadow],
							[shadow / 2, shadow, shadow / 2]
						]);
				}
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
				orderBias: .6,
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
			return
			let shape = new sprite({
				binded: this,
				tuple: sprites.dwheat,
				cell: this.cell,
				//color: color,
				orderBias: .6
			});
			this.stack();
		}
	}
	export class panel extends objected {
		ticker = 0
		constructor() {
			super(numbers.roofs);
			this.type = 'panel';
			this.height = 10;
		}
		override create() {
			this.tiled();
			this.size = [8, 10];
			//let color =  tiles.get(this.wpos)!.color;
			//this.cell = [Math.floor(Math.random() * 2), 0];
			return;
			let shape = new sprite({
				binded: this,
				tuple: sprites.dpanel,
				cell: [0, 0],
				//color: color,
				orderBias: .6
			});
			shape.rup2 = 15;
			shape.rleft = 2;
			this.stack();
		}
		override tick() {
			return;
			let sprite = this.shape as sprite;
			this.ticker += ren.delta / 60;
			const cell = sprite.vars.cell!;
			if (this.ticker > 0.5) {
				if (cell[0] < 5)
					cell[0]++;
				else
					cell[0] = 0;
				this.ticker = 0;
			}
			//sprite.retransform();
			sprite.update();
			//console.log('boo');

		}
	}
	type item = [string: string, amount: number]
	export class container {
		obj?: objects.objected
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
			this.container.obj = this;
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
				orderBias: .6
			});
			this.stack(['roof', 'wall']);
		}
		mousing = false;
		override tick() {
			const sprite = this.shape as sprite;

			if (this.mousedSquare(wastes.gview.mrpos2) /*&& !this.mousing*/) {
				this.mousing = true;
				sprite.material.color.set('#c1ffcd');
				console.log('mover');
				win.contextmenu.focus = this;
			}
			else if (!this.mousedSquare(wastes.gview.mrpos2) && this.mousing) {
				if (win.contextmenu.focus == this)
					win.contextmenu.focus = undefined;
				sprite.material.color.set('white');
				this.mousing = false;
			}
		}
		override setup_context() {
			console.log('setup context');

			win.contextmenu.reset();
			win.contextmenu.options.options.push(["See contents", () => {
				return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
			}, () => {
				win.container.crate = this;
				win.container.call_once();
			}]);
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
				orderBias: 0
			});
			shape.rup2 = 9;
			shape.rleft = 6;
			this.stack(['roof']);
		}
	}
	export class roof extends objected {
		shaded = false
		constructor() {
			super(numbers.roofs);
			this.type = 'roof';
			this.height = 3;
		}
		override create() {
			//return;
			this.tiled();
			this.size = [24, 17];
			let shape = new sprite({
				binded: this,
				tuple: sprites.droof,
				orderBias: 1.6,
			});
			shape.rup = 29;
			if (!this.shaded) {
				this.shaded = true;
				const shadow = .8;
				shadows.shade_matrix(this.wpos, [
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, shadow, 0, 0],
					[0, 0, 0, shadow, 0],
					[0, 0, 0, 0, shadow]], true);
			}
		}
		override tick() {
			super.tick();
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
				orderBias: 1.6,
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
				orderBias: .4,
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
			this.height = 23;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			this.cell = [255 - this.pixel!.array[3], 0];
			let shape = new sprite({
				binded: this,
				tuple: sprites.ddoor,
				cell: this.cell,
				orderBias: door.order,
			});
			this.stack();
		}
		override tick() {
			super.tick();
			if (!this.shape)
				return;
			let pos = this.wpos;
			let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
			let at = sector.stacked(pos);
			let pawning = false;
			for (let obj of at) {
				if (obj.is_type(['pawn', 'you'])) {
					pawning = true;
					let sprite = this.shape as sprite;
					sprite.vars.cell = pts.subtract(this.cell, [1, 0]);
					sprite.vars.orderBias = 1.55;
					sprite.retransform();
					sprite.update();
					this.open = true;
					break;
				}
			}
			if (!pawning) {
				let sprite = this.shape as sprite;
				sprite.vars.cell = this.cell;
				sprite.vars.orderBias = door.order;
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
				orderBias: .5
			});
		}

		//tick() {
		//}
	}
}

export default objects;