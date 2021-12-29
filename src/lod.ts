import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector3, Color, Group } from "three";

import aabb2 from "./aabb2";
import pts from "./pts";
import wests from "./wastes";
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
	type Units = vec2
	type SectorUnits = vec2
	type Pixels = vec2

	export const Unit = 16
	export const UnitsPerSector = 4

	export function register() {
		hooks.create('sectorCreate')
		hooks.create('sectorShow')
		hooks.create('sectorHide')
	}

	export class Galaxy {
		readonly arrays: Sector[][] = []
		readonly grid: Grid
		constructor(span) {
			this.grid = new Grid(5, 5, this);
		}
		update(wpos: Units) {
			this.grid.big = Galaxy.big(wpos);
			this.grid.offs();
			this.grid.crawl();
		}
		lookup(big: vec2): Sector | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		atrpos(pixels: Pixels): Sector {
			let units = Galaxy.unproject(pixels);
			let bigs = Galaxy.big(units);
			return this.at(bigs);
		}
		at(big: vec2): Sector {
			return this.lookup(big) || this.make(big);
		}
		add(obj: Obj) {
			obj.wtorpos();
			let sector = this.atrpos(obj.rpos);
			sector.add(obj);
		}
		protected make(big): Sector {
			let s = this.lookup(big);
			if (s)
				return s;
			s = this.arrays[big[1]][big[0]] = new Sector(big, this);
			return s;
		}
		static big(units: Units): SectorUnits {
			return pts.floor(pts.divide(units, UnitsPerSector));
		}
		static unproject(pixels: Pixels): Units {
			return pts.divide(pixels, Unit);
		}
	}

	export class Sector extends Toggle {
		group: Group;
		//readonly span = 2000;
		readonly screen: aabb2;
		readonly small: aabb2;
		private readonly objs: Obj[] = [];
		objs_(): ReadonlyArray<Obj> { return this.objs; }
		constructor(
			public readonly big: vec2,
			readonly galaxy: Galaxy
		) {
			super();
			let x = pts.mult(big, Unit);
			let y = pts.add(x, [Unit, Unit]);
			this.screen = new aabb2(x, y);
			this.small = new aabb2(
				[this.big[0] * UnitsPerSector, this.big[1] * UnitsPerSector],
				[this.big[0] * UnitsPerSector + UnitsPerSector - 1, this.big[1] * UnitsPerSector + UnitsPerSector - 1]);
			this.group = new Group;
			Numbers.Sectors[1]++;
			galaxy.arrays[this.big[1]][this.big[0]] = this;
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
			let newSector = this.galaxy.atrpos(obj.rpos);
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
			Numbers.Sectors[0]++;
			Util.SectorShow(this);
			//console.log(' sector show ');
			for (let obj of this.objs)
				obj.show();
			ren.scene.add(this.group);
			hooks.call('sectorShow', this);
		}
		hide() {
			if (this.off())
				return;
			Numbers.Sectors[0]--;
			Util.SectorHide(this);
			//console.log(' sector hide ');
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
			let allObjs: Obj[] = [];
			let i = this.shown.length;
			while (i--) {
				let sector: Sector;
				sector = this.shown[i];
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
		aabb: aabb2
		hexagonal: boolean
		wpos: Units = [0, 0]
		rpos: Pixels = [0, 0]
		size: vec2 = [100, 100]
		shape: Shape | null
		sector: Sector | null
		stuffs: ObjStuffs
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
			this.update();
			this.shape?.show();
		}
		hide() {
			if (this.off())
				return;
			this.counts[0]--;
			this.shape?.hide();
			// console.log(' obj.hide ');
		}
		wtorpos() {
			this.rpos = pts.projecthex(this.wpos);
		}
		tick() { // implement me
		}
		create() { // implement me
			console.warn(' obj.make ');
		}
		update() {
			this.wtorpos();
			this.bound();
			this.shape?.update();
		}
		bound() {
			this.aabb = new aabb2([0, 0], this.size);
			this.aabb.translate(this.rpos);
		}
		moused(mouse: Vec2) {
			if (this.aabb?.test(new aabb2(mouse, mouse)))
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

export namespace Util {
	const showWireframe = true;
	export function SectorShow(sector: lod.Sector) {
		let breadth = lod.Unit * lod.UnitsPerSector;
		let any = sector as any;
		any.geometry = new PlaneBufferGeometry(breadth, breadth, 2, 2);
		any.material = new MeshBasicMaterial({
			wireframe: true,
			transparent: true,
			color: 'red'
		});
		any.mesh = new Mesh(any.geometry, any.material);
		any.mesh.position.fromArray([sector.big[0] * breadth + breadth / 2, sector.big[1] * breadth + breadth / 2, 0]);
		any.mesh.updateMatrix();
		any.mesh.frustumCulled = false;
		any.mesh.matrixAutoUpdate = false;
		if (showWireframe)
			ren.groups.axisSwap.add(any.mesh);
	}
	export function SectorHide(sector: lod.Sector) {
		let any = sector as any;
		ren.groups.axisSwap.remove(any.mesh);
	}
}
export default lod;