import { THREE, Group, Mesh, Shader, BoxGeometry, ConeGeometry, CylinderGeometry, Matrix3, Matrix4, MeshLambertMaterial, MeshBasicMaterial, MeshBasicMaterialParameters, Color } from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";

import lod, { numbers } from "./lod";
import wastes, { win, pawns, fences } from "./wastes";

import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import tiles from "./tiles";
import hooks from "./hooks";
import sprite, { hovering_sprites } from "./sprite";
import sprites from "./sprites";
import app from "./app";
import colormap from "./colormap";
import shadows from "./shadows";
import colors from "./colors";

namespace objects {

	export function factory<type extends superobject>(type: { new(): type }, pixel, pos, hints = {}) {
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
		wastes.treemap = new colormap.colormap('treemap');
		wastes.colormap = new colormap.colormap('colormap');
		wastes.roughmap = new colormap.colormap('roughmap');
		wastes.roofmap = new colormap.colormap('roofmap');

		const treeTreshold = 50;

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.objectmap.pixel(pos);
				if (pixel.is_color(colors.color_acid_barrel)) {
					// factory(objects.acidbarrel, pixel, pos);
				}
				else if (pixel.is_color(colors.color_wall_chest)) {
					//factory(objects.crate, pixel, pos);
				}
				else if (pixel.is_color(colors.color_shelves)) {
					console.log('got shelves color');
					
					//factory(objects.shelves, pixel, pos);
				}
				else if (pixel.is_color(colors.color_panel)) {
					factory(objects.panel, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.roofmap.pixel(pos);
				if (pixel.is_color(colors.color_false_front)) {
					//factory(objects.roof, pixel, pos);
					//factory(objects.falsefront, pixel, pos);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.treemap.pixel(pos);

				if (pixel.is_color(colors.color_decidtree)) {
					factory(objects.decidtree, pixel, pos, { type: 'decid' });
				}
				else if (pixel.is_color(colors.color_deadtree)) {
					factory(objects.deadtree, pixel, pos);
				}
			})
			return false;
		});

		hooks.register('sectorCreate', (sector: lod.sector) => {
			pts.func(sector.small, (pos) => {
				let pixel = wastes.buildingmap.pixel(pos);
				if (pixel.is_color(colors.color_plywood_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'plywood' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_overgrown_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'overgrown' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_deringer_wall)) {
					factory(objects.deck, pixel, pos);
					factory(objects.wall, pixel, pos, { type: 'sideroom' });
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_medieval_wall)) {
					factory(objects.wall, pixel, pos, { type: 'medieval' });
				}
				else if (pixel.is_color(colors.color_scrappy_wall)) {
					factory(objects.wall, pixel, pos, { type: 'scrappy' });
					//factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_fence)) {
					//factory(fences.fence, pixel, pos);
				}
				else if (pixel.is_color(colors.color_grass)) {
					//factory(objects.grass, pixel, pos);
				}
				else if (pixel.is_color(colors.color_wheat)) {
					factory(objects.wheat, pixel, pos);
				}
				else if (pixel.is_color(colors.color_deck_and_roof)) {
					factory(objects.deck, pixel, pos);
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_porch)) {
					factory(objects.porch, pixel, pos);
				}
				else if (pixel.is_color(colors.color_rails)) {
					factory(objects.rails, pixel, pos);
				}
				else if (pixel.is_color(colors.color_door)) {
					factory(objects.deck, pixel, pos);
					factory(objects.door, pixel, pos);
					factory(objects.roof, pixel, pos);
				}
				else if (pixel.is_color(colors.color_wooden_door_and_deck)) {
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
		const impassable = ['wall', 'crate', 'shelves', 'tree', 'fence', 'deep water'];
		pos = pts.round(pos);
		if (tiles.get(pos) == undefined)
			return true;
		let sector = lod.gworld.at(lod.world.big(pos));
		let at = sector.stacked(pos);
		for (let obj of at) {
			if (obj.is_type(impassable)) {
				return true;
			}
		}
		return false;
	}

	export class superobject extends lod.obj {
		static focus: superobject
		id = 'an_objected_0'
		title = ''
		examine = ''
		isSuper = true
		paintTimer = 0
		paintedRed = false
		solid = true
		pixel?: colormap.pixel
		tile?: tiles.tile
		tileBound?: aabb2
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
		override hide() {
			console.log('superobject hide');
			hovering_sprites.unhover(this.shape as sprite);
			super.hide();
		}
		nettick() {
		}
		superobject_hovering_pass() {
			const sprite = this.shape as sprite;
			if (!sprite)
				return;
			if (sprite.mousedSquare(wastes.gview.mrpos)) {
				sprite.material.color.set('#c1ffcd');
				hovering_sprites.hover(sprite);
			}
			else {
				sprite.material.color.set('white');
				hovering_sprites.unhover(sprite);
			}
		}
		tick() {
			//this.superobject_hovering_pass();
			if (this.paintedRed) {
				this.paintTimer += ren.delta;
				if (this.paintTimer > 1) {
					const sprite = this.shape as sprite;
					sprite.material.color.set('white');
					this.paintedRed = false;
					this.paintTimer = 0;
				}
			}
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
		superobject_setup_context_menu() { // override me
		}
	}

	export class wall extends superobject {
		constructor() {
			super(numbers.walls);
			this.type = 'wall';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			this.cell = [255 - this.pixel!.arrayRef[3], 0];
			let tuple = sprites.dscrappywalls;
			if (this.hints?.type == 'plywood')
				tuple = sprites.dderingerwalls;
			if (this.hints?.type == 'overgrown')
				tuple = sprites.dderingerwalls;
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
				orderBias: 1.0,
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
	export class deck extends superobject {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'deck'
			this.height = 3;
		}
		override onhit() { }

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
			let sector = lod.gworld.at(lod.world.big(pos));
			let at = sector.stacked(pos);
			for (let obj of at) {
				if (obj.type == 'you') {
					wastes.HIDE_ROOFS = true;
					break;
				}
			}
		}
	}
	export class porch extends superobject {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'porch'
			this.height = 3;
		}
		override onhit() { }

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
				orderBias: -0.45,
				color: color
			});
			this.stack();

		}
	}
	export class rails extends superobject {
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
	export class deadtree extends superobject {
		static timer = 0;
		constructor() {
			super(numbers.floors);
			this.type = 'tree'
			this.height = 24;
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
	}
	export class decidtree extends superobject {
		flowered = false
		constructor() {
			super(numbers.trees);
			this.type = 'tree'
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
						if (!(x == 0 && y == 0))
							factory(
								objects.treeleaves,
								this.pixel,
								pts.add(this.wpos, [x, y]),
								{
									type: this.hints.type,
									tree: this,
									color: tile.color,
									grid: [x, y]
								});
				//factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
				//factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
			}
		}
	}
	export class treeleaves extends superobject {
		shaded = false
		hasVines = false
		constructor() {
			super(numbers.leaves);
			this.type = 'leaves'
			this.height = 14;

			/*if (!this.hints.noVines || Math.random() > 0.5)
				this.hasVines = true;*/
		}

		override onhit() {

		}
		override create() {
			let pixel = wastes.treemap.pixel(this.wpos);

			if (!this.hints.noVines && pixel.arrayRef[3] == 254)
				this.hasVines = false // true;

			if (pixel.arrayRef[3] == 253)
				return;

			this.tiled();

			let tuple = sprites.dtreeleaves;

			if (this.hasVines) {
				this.size = [24, 64];
				const grid = this.hints.grid || [0, 0];
				if (pts.equals(grid, [1, 0]) || pts.equals(grid, [1, 1])) {
					tuple = sprites.dvines2;
					//this.hints.color = [0, 0, 0, 255]
					console.log(' !! using dvines 2 !!');
				}
				else if (pts.equals(grid, [0, -1]) || pts.equals(grid, [-1, -1])) {
					tuple = sprites.dvines3;
					//this.hints.color = [0, 0, 0, 255]
				}
				else {
					tuple = sprites.dvines;
				}
			}
			else {
				this.size = [24, 31];
			}
			//this.try_create_vines();
			//if (this.pixel!.array[3] < 240)
			//	this.cell = [240 - this.pixel!.array[3], 0];
			let color = this.hints.color || [255, 255, 255, 255];

			let color2 = wastes.colormap.pixel(this.wpos);

			if (!(255 - color2.arrayRef[3])) {
				if (this.hints.color) {
					color = [
						Math.floor(color[0] * 1.6),
						Math.floor(color[1] * 1.6),
						Math.floor(color[2] * 1.6),
						color[3],
					]
				}
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
			//console.log('special stack');
			const tree = this.hints.tree;
			if (this.shape) {
				const sprite = this.shape as sprite;
				this.z = tree.calc + tree.height;
				sprite.rup = this.z;

				if (this.hasVines) {
					sprite.rup2 = -33;
				}
			}
		}
	}
	export class grass extends superobject {
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
			this.cell = [255 - this.pixel!.arrayRef[3], 0];
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
	export class wheat extends superobject {
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
				orderBias: .6
			});
			this.stack();
		}
	}
	export class panel extends superobject {
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
			sprite.shape_manual_update();
			//console.log('boo');
		}
	}
	export class crate extends superobject {
		inventory?: any
		constructor() {
			super(numbers.objs);
			this.type = 'crate';
			this.title = 'Crate';
			this.height = 17;
		}
		override create() {
			this.tiled();
			this.size = [24, 40];
			let shape = new sprite({
				binded: this,
				tuple: sprites.dcrate,
				cell: this.cell,
				orderBias: 1.0
			});
			this.stack(['roof', 'wall']);
		}
		override tick() {
			const sprite = this.shape as sprite;

			if (!sprite)
				return;

			this.superobject_hovering_pass();
		}
		override superobject_setup_context_menu() {
			console.log('setup context');

			win.contextmenu.reset();
			win.contextmenu.options.options.push(["See contents", () => {
				return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
			}, () => {
				win.container.focus = this;
				win.container.call_once();
			}]);
		}
	}
	export class shelves extends superobject {
		constructor() {
			super(numbers.objs);
			this.type = 'shelves';
			this.title = 'Shelves';
			this.height = 25;
		}
		override create() {
			this.tiled();
			this.size = [20, 31];
			//this.cell = [255 - this.pixel!.array[3], 0];
			//return
			let shape = new sprite({
				binded: this,
				tuple: sprites.dshelves,
				//cell: this.cell,
				orderBias: 1.0
			});
			//shape.rup2 = 9;
			//shape.rleft = 6;
			this.stack(['roof', 'wall']);
		}
		override tick() {
			const sprite = this.shape as sprite;

			this.superobject_hovering_pass();
		}
		override superobject_setup_context_menu() {
			console.log('setup context');

			win.contextmenu.reset();
			win.contextmenu.options.options.push(["See contents", () => {
				return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
			}, () => {
				win.container.focus = this;
				win.container.call_once();
			}]);
			/*win.contextmenu.options.options.push(["Store", () => {
				return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
			}, () => {
				//win.container.crate = this;
				//win.container.call_once();
			}]);*/
			win.contextmenu.options.options.push(["Examine", () => {
				return pts.distsimple(pawns.you.wpos, this.wpos) < 10;
			}, () => {
				win.descriptor.focus = this;
				win.descriptor.call_once("A shelves with not much on it.");
			}]);
		}
	}
	export class roof extends superobject {
		shaded = false
		constructor() {
			super(numbers.roofs);
			this.type = 'roof';
			this.height = 3;
		}
		override onhit() { }
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
				const shadow = .75;
				shadows.shade_matrix(this.wpos, [
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
					[0, 0, 0, 0, 0],
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
	export class falsefront extends superobject {
		constructor() {
			super(numbers.roofs);
			this.type = 'falsefront'
			this.height = 5;
		}
		override create() {
			this.tiled();
			this.cell = [255 - this.pixel!.arrayRef[3], 0];
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
	export class acidbarrel extends superobject {
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

	export class door extends superobject {
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
			this.cell = [255 - this.pixel!.arrayRef[3], 0];
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
			let sector = lod.gworld.at(lod.world.big(pos));
			let at = sector.stacked(pos);
			let pawning = false;
			for (let obj of at) {
				if (obj.is_type(['pawn', 'you'])) {
					pawning = true;
					let sprite = this.shape as sprite;
					sprite.vars.cell = pts.subtract(this.cell, [1, 0]);
					sprite.vars.orderBias = 1.55;
					sprite.retransform();
					sprite.shape_manual_update();
					this.open = true;
					break;
				}
			}
			if (!pawning) {
				let sprite = this.shape as sprite;
				sprite.vars.cell = this.cell;
				sprite.vars.orderBias = door.order;
				sprite.retransform();
				sprite.shape_manual_update();
				this.open = false;
			}
		}
	}

	export class shrubs extends superobject {
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