import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Color, Group } from "three";

import aabb2 from "./aabb2";
import pts from "./pts";
import wastes from "./wastes";
import ren from "./renderer";
import hooks from "./hooks";
import tiles from "./tiles";

export namespace numbers {
	export type tally = [active: number, total: number]

	export var sectors: tally = [0, 0]
	export var sprites: tally = [0, 0]
	export var objs: tally = [0, 0]

	export var tiles: tally = [0, 0]
	export var floors: tally = [0, 0]
	export var trees: tally = [0, 0]
	export var leaves: tally = [0, 0]
	export var walls: tally = [0, 0]
	export var roofs: tally = [0, 0]
	export var pawns: tally = [0, 0]
};

class toggle {
	protected active = false;
	isActive() { return this.active };
	on() {
		if (this.active) {
			console.warn(' (toggle) already on ');
			return true;
			// it was on before
		}
		this.active = true;
		return false;
		// it wasn't on before
	}
	off() {
		if (!this.active) {
			console.warn(' (toggle) already off ');
			return true;
		}
		this.active = false;
		return false;
	}
}

namespace lod {

	const chunk_coloration = false;

	const grid_crawl_makes_sectors = true;

	export var ggalaxy: galaxy;
	export var ggrid: grid;

	export var SectorSpan = 4;

	export function register() {
		// hooks.create('sectorCreate')
		// hooks.create('sectorShow')
		// hooks.create('sectorHide')

		// hooks.register('sectorHide', () => { console.log('~'); return false; } );
	}

	export function project(unit: vec2): vec2 {
		return pts.mult(pts.project(unit), wastes.size);
	}

	export function unproject(pixel: vec2): vec2 {
		return pts.divide(pts.unproject(pixel), wastes.size);
	}

	export function add(obj: obj) {
		let sector = ggalaxy.at(ggalaxy.big(obj.wpos));
		sector.add(obj);
	}

	export class galaxy {
		readonly arrays: sector[][] = []
		constructor(span) {
			ggalaxy = this;
			new grid(2, 2);
		}
		update(wpos: vec2) {
			ggrid.big = this.big(wpos);
			ggrid.offs();
			ggrid.crawl();
		}
		lookup(big: vec2): sector | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		at(big: vec2): sector {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): sector {
			let s = this.lookup(big);
			if (s)
				return s;
			s = this.arrays[big[1]][big[0]] = new sector(big, this);
			return s;
		}
		big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class sector extends toggle {
		color;
		group: Group;
		readonly small: aabb2;
		private readonly objs: obj[] = [];
		constructor(
			public readonly big: vec2,
			readonly galaxy: galaxy
		) {
			super();
			if (chunk_coloration)
				this.color = (['lightsalmon', 'lightblue', 'beige', 'pink'])[Math.floor(Math.random() * 4)];
			let min = pts.mult(this.big, SectorSpan);
			let max = pts.add(min, [SectorSpan - 1, SectorSpan - 1]);
			this.small = new aabb2(max, min);
			this.group = new Group;
			this.group.frustumCulled = false;
			this.group.matrixAutoUpdate = false;
			numbers.sectors[1]++;
			galaxy.arrays[this.big[1]][this.big[0]] = this;
			//console.log('sector');

			hooks.call('sectorCreate', this);

		}
		objsro(): ReadonlyArray<obj> {
			return this.objs;
		}
		add(obj: obj) {
			let i = this.objs.indexOf(obj);
			if (i == -1) {
				this.objs.push(obj);
				obj.sector = this;
				if (this.isActive())
					obj.show();
			}
		}
		stacked(wpos: vec2) {
			let stack: obj[] = [];
			for (let obj of this.objs)
				if (pts.equals(wpos, pts.round(obj.wpos)))
					stack.push(obj);
			return stack;
		}
		remove(obj: obj): boolean | undefined {
			let i = this.objs.indexOf(obj);
			if (i > -1) {
				obj.sector = null;
				return !!this.objs.splice(i, 1).length;
			}
		}
		swap(obj: obj) {
			let newSector = this.galaxy.at(this.galaxy.big(pts.round(obj.wpos)));
			if (obj.sector != newSector) {
				obj.sector?.remove(obj);
				newSector.add(obj);
				if (!newSector.isActive())
					obj.hide();
			}
		}
		tick() {
			hooks.call('sectorTick', this);
			//for (let obj of this.objs)
			//	obj.tick();
		}
		show() {
			if (this.on())
				return;
			numbers.sectors[0]++;
			for (let obj of this.objs)
				obj.show();
			ren.scene.add(this.group);
			hooks.call('sectorShow', this);
		}
		hide() {
			if (this.off())
				return;
			numbers.sectors[0]--;
			for (let obj of this.objs)
				obj.hide();
			ren.scene.remove(this.group);
			hooks.call('sectorHide', this);
		}
		dist() {
			return pts.distsimple(this.big, lod.ggrid.big);
		}
	}

	export class grid {
		big: vec2 = [0, 0];
		public shown: sector[] = [];
		constructor(
			public spread,
			public outside
		) {
			lod.ggrid = this;
			if (this.outside < this.spread) {
				console.warn(' outside less than spread ', this.spread, this.outside);
				this.outside = this.spread;
			}
		}
		visible(sector: sector) {
			return sector.dist() < this.spread;
		}
		crawl() {
			// spread = -2; < 2
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let sector = grid_crawl_makes_sectors ? ggalaxy.at(pos) : ggalaxy.lookup(pos);
					if (!sector)
						continue;
					if (!sector.isActive()) {
						this.shown.push(sector);
						sector.show();
					}
				}
			}
		}
		offs() {
			const noConcat = false;
			let allObjs: obj[] = [];
			let i = this.shown.length;
			while (i--) {
				let sector: sector;
				sector = this.shown[i];
				if (!noConcat)
					allObjs = allObjs.concat(sector.objsro());
				sector.tick();
				if (sector.dist() > this.outside) {
					sector.hide();
					this.shown.splice(i, 1);
				}
			}
			for (let obj of allObjs)
				obj.tick();
		}
	}

	interface ObjHints {

	};

	export class obj extends toggle {
		type = 'an obj'
		aabbScreen: aabb2
		wpos: vec2 = [0, 0]
		rpos: vec2 = [0, 0]
		size: vec2 = [100, 100]
		shape: shape | null
		sector: sector | null
		ro = 0
		z = 0 // z is only used by tiles
		height = 0
		heightAdd = 0
		constructor(
			public readonly counts: numbers.tally = numbers.objs) {
			super();
			this.counts[1]++;
		}
		finalize() { // finalzie is never used
			this.hide();
			this.counts[1]--;
		}
		show() {
			if (this.on())
				return;
			this.counts[0]++;
			this.create();
			this.update();
			this.shape?.show();
		}
		hide() {
			if (this.off())
				return;
			this.counts[0]--;
			//this.delete();
			this.shape?.hide();
			// console.log(' obj.hide ');
		}
		wtorpos() {
			this.rpos = lod.project(this.wpos);
		}
		rtospos() {
			this.wtorpos();
			return pts.clone(this.rpos);
		}
		tick() { // implement me
		}
		create() { // implement me
			console.warn(' (lod) obj.create ');
		}
		// delete is never used
		delete() { // implement me
			// console.warn(' (lod) obj.delete ');
		}
		update() { // implement me
			this.wtorpos();
			this.bound();
			this.shape?.update();
		}
		bound() {
			this.aabbScreen = new aabb2([0, 0], this.size);
			this.aabbScreen.translate(this.rpos);
		}
		mousedSquare(mouse: Vec2) {
			if (this.aabbScreen?.test(new aabb2(mouse, mouse)))
				return true;
		}
		is_type(types: string[]) {
			return types.indexOf(this.type) != -1;
		}
	}

	export namespace shape {
		//export type Parameters = Shape['pars'];
	};

	export class shape extends toggle {

		constructor(
			public readonly bindObj: obj,
			public readonly counts
		) {
			super();
			this.bindObj.shape = this;
			this.counts[1]++;
		}
		update() { // implement me
		}
		create() { // implement me
		}
		dispose() { // implement me
		}
		finalize() {
			this.hide();
			this.counts[1]--;
		}
		show() {
			if (this.on())
				return;
			this.create();
			this.counts[0]++;
		}
		hide() {
			if (this.off())
				return;
			this.dispose();
			this.counts[0]--;
		}
	}
}

export default lod;