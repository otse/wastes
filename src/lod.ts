import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Color, Group } from "three";

import aabb2 from "./aabb2";
import pts from "./pts";
import wastes from "./wastes";
import ren from "./renderer";
import hooks from "./hooks";

export namespace Numbers {
	export type Tally = [active: number, total: number]

	export var Sectors: Tally = [0, 0]
	export var Objs: Tally = [0, 0]
	export var Trees: Tally = [0, 0]
	export var Sprites: Tally = [0, 0]
	export var Tiles: Tally = [0, 0]
};

class Toggle {
	protected active = false;
	isActive() { return this.active };
	on() {
		if (this.active) {
			console.warn(' already on ');
			return true;
			// it was on before
		}
		this.active = true;
		return false;
		// it wasn't on before
	}
	off() {
		if (!this.active) {
			console.warn(' already off ');
			return true;
		}
		this.active = false;
		return false;
	}
}

namespace lod {

	export var galaxy: Galaxy;

	export const SectorSpan = 4;

	export function register() {
		hooks.create('sectorCreate')
		hooks.create('sectorShow')
		hooks.create('sectorHide')
	}

	export class Galaxy {
		readonly arrays: Sector[][] = []
		readonly grid: Grid
		constructor(span) {
			this.grid = new Grid(8, 8, this);
		}
		update(wpos: vec2) {
			this.grid.big = this.big(wpos);
			this.grid.offs();
			this.grid.crawl();
		}
		lookup(big: vec2): Sector | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		sectoratpixel(pixel: vec2): Sector {
			let units = this.unproject(pixel);
			let bigs = this.big(units);
			return this.at(bigs);
		}
		at(big: vec2): Sector {
			return this.lookup(big) || this.make(big);
		}
		add(obj: Obj) {
			//obj.wtorpos();
			let sector = this.at(this.big(obj.wpos));
			sector.add(obj);
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
		project(unit: vec2): vec2 {
			return pts.mult(pts.project(unit), wastes.size);
		}
		unproject(pixel: vec2): vec2 {
			return pts.divide(pts.unproject(pixel), wastes.size);
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
			return pts.distsimple(this.big, this.galaxy.grid.big);
		}
	}

	export class Grid {
		big: vec2 = [0, 0];
		public shown: Sector[] = [];
		constructor(
			public readonly spread,
			public readonly outside,
			readonly galaxy: Galaxy
		) {
		}
		visible(sector: Sector) {
			return sector.dist() < this.spread;
		}
		crawl() {
			for (let y = -this.spread; y < this.spread; y++) {
				for (let x = -this.spread; x < this.spread; x++) {
					let pos = pts.add(this.big, [x, y]);
					let sector = this.galaxy.lookup(pos);
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
			const noConcat = true;
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
		hexagonal: boolean
		wpos: vec2 = [0, 0]
		rpos: vec2 = [0, 0]
		size: vec2 = [100, 100]
		shape: Shape | null
		sector: Sector | null
		stuffs: ObjStuffs
		z = 0
		rz = 0
		constructor(
			stuffs: ObjStuffs | undefined,
			public readonly counts: Numbers.Tally = Numbers.Objs) {
			super();
			this.hexagonal = false
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
			this.rpos = lod.galaxy.project(this.wpos);
		}
		tick() { // implement me
		}
		create() { // implement me
			console.warn(' obj.create ');
		}
		delete() { // implement me
			console.warn(' obj.delete ');
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
		export type Parameters = Shape['pars'];
	};

	export class Shape extends Toggle {
		constructor(
			public readonly pars: { bind: Obj },
			public readonly counts
		) {
			super();
			this.pars.bind.shape = this;
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