import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Color, Group } from "three";

import aabb2 from "./aabb2";
import pts from "./pts";
import wastes from "./wastes";
import ren from "./renderer";
import hooks from "./hooks";

export namespace Numbers {
	export type Tally = [active: number, total: number]

	export var Sectors: Tally = [0, 0]
	export var Sprites: Tally = [0, 0]
	export var Objs: Tally = [0, 0]

	export var Tiles: Tally = [0, 0]
	export var Trees: Tally = [0, 0]
	export var Walls: Tally = [0, 0]
};

class Toggle {
	protected active = false;
	isActive() { return this.active };
	on() {
		if (this.active) {
			console.warn(' (lod) already on ');
			return true;
			// it was on before
		}
		this.active = true;
		return false;
		// it wasn't on before
	}
	off() {
		if (!this.active) {
			console.warn(' (lod) already off ');
			return true;
		}
		this.active = false;
		return false;
	}
}

namespace lod {

	export var galaxy: Galaxy;
	export var grid: Grid;

	export var SectorSpan = 4;

	export function register() {
		hooks.create('sectorCreate')
		hooks.create('sectorShow')
		hooks.create('sectorHide')
	}

	export function project(unit: vec2): vec2 {
		return pts.mult(pts.project(unit), wastes.size);
	}

	export function unproject(pixel: vec2): vec2 {
		return pts.divide(pts.unproject(pixel), wastes.size);
	}

	export function add(obj: Obj) {
		let sector = galaxy.at(galaxy.big(obj.wpos));
		sector.add(obj);
	}

	export class Galaxy {
		readonly arrays: Sector[][] = []
		constructor(span) {
			galaxy = this;
			new Grid(8, 8);
		}
		update(wpos: vec2) {
			grid.big = this.big(wpos);
			grid.offs();
			grid.crawl();
		}
		lookup(big: vec2): Sector | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		at(big: vec2): Sector {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): Sector {
			let s = this.lookup(big);
			if (s)
				return s;
			s = this.arrays[big[1]][big[0]] = new Sector(big, this);
			return s;
		}
		big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class Sector extends Toggle {
		color;
		group: Group;
		readonly small: aabb2;
		private readonly objs: Obj[] = [];
		objs_(): ReadonlyArray<Obj> { return this.objs; }
		constructor(
			public readonly big: vec2,
			readonly galaxy: Galaxy
		) {
			super();
			//this.color = (['salmon', 'blue', 'cyan', 'purple'])[Math.floor(Math.random() * 4)];
			let min = pts.mult(this.big, SectorSpan);
			let max = pts.add(min, [SectorSpan - 1, SectorSpan - 1]);
			this.small = new aabb2(max, min);
			this.group = new Group;
			this.group.frustumCulled = false;
			this.group.matrixAutoUpdate = false;
			Numbers.Sectors[1]++;
			galaxy.arrays[this.big[1]][this.big[0]] = this;
			//console.log('sector');

			hooks.call('sectorCreate', this);

		}
		add(obj: Obj) {
			let i = this.objs.indexOf(obj);
			if (i == -1) {
				this.objs.push(obj);
				obj.sector = this;
				if (this.isActive())
					obj.show();
			}
		}
		remove(obj: Obj): boolean | undefined {
			let i = this.objs.indexOf(obj);
			if (i > -1) {
				obj.sector = null;
				return !!this.objs.splice(i, 1).length;
			}
		}
		swap(obj: Obj) {
			/*let newSector = this.galaxy.sectoratpixel(obj.rpos);
			if (obj.sector != newSector) {
				obj.sector?.remove(obj);
				newSector.add(obj);
				if (!newSector.isActive())
					obj.hide();
			}*/
		}
		tick() {
			hooks.call('sectorTick', this);
			//for (let obj of this.objs)
			//	obj.tick();
		}
		show() {
			if (this.on())
				return;
			Numbers.Sectors[0]++;
			//console.log('?');

			for (let obj of this.objs)
				obj.show();
			ren.scene.add(this.group);
			hooks.call('sectorShow', this);
		}
		hide() {
			if (this.off())
				return;
			Numbers.Sectors[0]--;
			for (let obj of this.objs)
				obj.hide();
			ren.scene.remove(this.group);
			hooks.call('sectorHide', this);
		}
		dist() {
			return pts.distsimple(this.big, grid.big);
		}
	}

	export class Grid {
		big: vec2 = [0, 0];
		public shown: Sector[] = [];
		constructor(
			public readonly spread,
			public readonly outside
		) {
			grid = this;
		}
		visible(sector: Sector) {
			return sector.dist() < this.spread;
		}
		crawl() {
			for (let y = -this.spread; y < this.spread; y++) {
				for (let x = -this.spread; x < this.spread; x++) {
					let pos = pts.add(this.big, [x, y]);
					let sector = galaxy.lookup(pos);
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
			let allObjs: Obj[] = [];
			let i = this.shown.length;
			while (i--) {
				let sector: Sector;
				sector = this.shown[i];
				if (!noConcat)
					allObjs = allObjs.concat(sector.objs_());
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

	interface ObjStuffs {

	};

	export class Obj extends Toggle {
		aabbScreen: aabb2
		wpos: vec2 = [0, 0]
		rpos: vec2 = [0, 0]
		size: vec2 = [100, 100]
		shape: Shape | null
		sector: Sector | null
		stuffs: ObjStuffs
		rz = 0
		constructor(
			stuffs: ObjStuffs | undefined,
			public readonly counts: Numbers.Tally = Numbers.Objs) {
			super();
			this.counts[1]++;
		}
		finalize() {
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
			this.delete();
			this.shape?.hide();
			// console.log(' obj.hide ');
		}
		wtorpos() {
			this.rpos = lod.project(this.wpos);
		}
		tick() { // implement me
		}
		create() { // implement me
			console.warn(' (lod) obj.create ');
		}
		delete() { // implement me
			console.warn(' (lod) obj.delete ');
		}
		update() {
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
	}

	export namespace Shape {
		//export type Parameters = Shape['pars'];
	};

	export class Shape extends Toggle {

		constructor(
			public readonly bindObj: Obj,
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