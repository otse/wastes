import aabb2 from "../src/aabb2";
import pts from "../src/pts";
import hooks from "../src/hooks";

export namespace numbers {
	export type tally = [active: number, total: number]

	export var sectors: tally = [0, 0]
	export var objs: tally = [0, 0]

	export var tiles: tally = [0, 0]
	export var trees: tally = [0, 0]
	export var walls: tally = [0, 0]
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

// server version of the lod

namespace slod {

	const grid_crawl_makes_sectors = true;

	export var stamp = 0;

	export var gworld: sworld

	export var SectorSpan = 3;

	export var byId: { [id: string]: slod.sobj } = {}

	export function add(sobj: sobj) {
		let sector = gworld.at(slod.sworld.big(pts.round(sobj.wpos)));
		byId[sobj.id] = sobj;
		sector.add(sobj);
	}

	export function remove(obj: sobj) {
		const { sector } = obj;
		if (sector) {
			sector.remove(obj);
			// remove obj for all observers
			for (const tuple of sector.observers)
				tuple[0].removes.push(obj.id);
		}
	}

	export class sworld {
		readonly arrays: ssector[][] = []
		constructor() {
			gworld = this;
		}
		update_grid(grid: sgrid, wpos: vec2) {
			grid.big = slod.sworld.big(wpos);
			grid.offs();
			grid.crawl();
		}
		lookup(big: vec2): ssector | undefined {
			if (this.arrays[big[1]] == undefined)
				this.arrays[big[1]] = [];
			return this.arrays[big[1]][big[0]];
		}
		at(big: vec2): ssector {
			return this.lookup(big) || this.make(big);
		}
		protected make(big): ssector {
			let s = this.lookup(big);
			if (s)
				return s;
			s = this.arrays[big[1]][big[0]] = new ssector(big, this);
			return s;
		}
		static big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class ssector extends toggle {
		color?;
		public observers: [observer: sgrid, stamp: number][] = []
		static newlies: sobj[] = []
		static visibles: sobj[] = []
		static actives: ssector[] = []
		readonly small: aabb2;
		readonly sobjs: sobj[] = [];
		constructor(
			public readonly big: vec2,
			readonly world: sworld
		) {
			super();
			// console.log(`new ssector ${big[0]} ${big[1]}`);
			let min = pts.mult(this.big, SectorSpan);
			let max = pts.add(min, [SectorSpan - 1, SectorSpan - 1]);
			this.small = new aabb2(max, min);
			numbers.sectors[1]++;
			world.arrays[this.big[1]][this.big[0]] = this;
			hooks.call('sectorCreate', this);
		}
		observe(grid: sgrid) {
			this.observers.push([grid, slod.stamp]);
		}
		unobserve(grid: sgrid) {
			for (let i = this.observers.length - 1; i >= 0; i--) {
				const tuple = this.observers[i];
				if (tuple[0] == grid) {
					this.observers.splice(i, 1);
					break;
				}
			}
		}
		add(obj: sobj) {
			let i = this.sobjs.indexOf(obj);
			if (i == -1) {
				this.sobjs.push(obj);
				obj.sector = this;
				if (this.isActive() && !obj.isActive())
					obj.show();
			}
		}
		stacked(wpos: vec2) {
			let stack: sobj[] = [];
			for (let obj of this.sobjs)
				if (pts.equals(wpos, pts.round(obj.wpos)))
					stack.push(obj);
			return stack;
		}
		remove(obj: sobj): boolean | undefined {
			let i = this.sobjs.indexOf(obj);
			if (i > -1) {
				obj.sector = null;
				return !!this.sobjs.splice(i, 1).length;
			}
		}
		//hard_remove(obj: sobj) {
		//	for (let grid of this.observers)
		//		grid.removes.push(obj.id);
		//}
		is_observed_by(target: sgrid) {
			for (const tuple of this.observers)
				if (tuple[0] == target)
					return true;
			return false;
		}
		swap(obj: sobj) {
			// Call me whenever you move
			let newSector = this.world.at(slod.sworld.big(pts.round(obj.wpos)));
			if (obj.sector != newSector) {
				obj.sector?.remove(obj);
				newSector.add(obj);
				if (!newSector.isActive()) {
					obj.hide();
					//console.warn('sobj move into hidden ssector');
				}
				// If the new sector isn't observed, remove us from that observer
				for (const tuple of this.observers)
					if (!newSector.is_observed_by(tuple[0]))
						//if (!obj.impertinent)
						tuple[0].removes.push(obj.id);

			}
		}
		find_observer_tuple(observer: sgrid) {
			for (const tuple of this.observers)
				if (tuple[0] == observer)
					return tuple;
		}
		gather(grid: slod.sgrid) {
			const tuple = this.find_observer_tuple(grid)!;
			let gathers: object[] = [];
			for (let obj of this.sobjs) {
				// If we are a new observer, or we have changes
				if (tuple[1] == slod.stamp || obj.stamp == 0 || obj.stamp >= slod.stamp)
					gathers.push(obj.gather(tuple[1] == slod.stamp || obj.stamp == 0));

				if (obj.stamp == 0) {
					console.log('this object is newly created, deserves to be fully send', obj.type);
					slod.ssector.newlies.push(obj);
				}
			}
			return gathers;
		}
		static tick_actives() {
			ssector.visibles = [];
			for (let sector of ssector.actives)
				ssector.visibles = ssector.visibles.concat(sector.sobjs);
			// todo sort players first, then pawns
			for (let sobj of this.visibles)
				sobj.tick();
			// for (let sector of ssector.actives)
			// 	sector.tick();
		}
		static unstamp_newlies() {
			// this fixes the unique moment where a new sobj isnt send fully
			// since we were already observing the sector.
			// that's why we fully send all 0-stamps, then cancel it with -1
			for (let sobj of slod.ssector.newlies)
				sobj.stamp = -1;
		}
		tick() {
			hooks.call('ssectorTick', this);
		}
		show() {
			if (this.on())
				return;
			//console.log('ssector show');
			ssector.actives.push(this);
			numbers.sectors[0]++;
			for (let obj of this.sobjs)
				obj.show();
			hooks.call('ssectorShow', this);
		}
		hide() {
			if (this.observers.length >= 1)
				return;
			if (this.off())
				return;
			const i = ssector.actives.indexOf(this);
			ssector.actives.splice(i, 1);
			// console.log('ssector hide, observers', this.observers.length);
			numbers.sectors[0]--;
			for (let obj of this.sobjs)
				obj.hide();
			hooks.call('ssectorHide', this);
		}
		dist(grid: sgrid) {
			return pts.distsimple(this.big, grid.big);
		}
	}

	export class sgrid {
		big: vec2 = [0, 0];
		removes: string[] = []
		shown: ssector[] = [];
		constructor(
			public world: sworld,
			public spread: number,
			public outside: number
		) {
			console.log(`new sgrid ${spread}`);

			//slod.ggrid = this;
			if (this.outside < this.spread) {
				console.warn(' outside less than spread ', this.spread, this.outside);
				this.outside = this.spread;
			}
		}
		grow() {
			this.spread++;
			this.outside++;
		}
		shrink() {
			this.spread--;
			this.outside--;
		}
		visible(sector: ssector) {
			return sector.dist(this) < this.spread;
		}
		crawl() {
			// spread = -2; < 2
			for (let y = -this.spread; y < this.spread + 1; y++) {
				for (let x = -this.spread; x < this.spread + 1; x++) {
					let pos = pts.add(this.big, [x, y]);
					let sector = grid_crawl_makes_sectors ? this.world.at(pos) : this.world.lookup(pos);
					if (!sector)
						continue;
					if (this.shown.indexOf(sector) == -1) {
						this.shown.push(sector);
						sector.observe(this);
						if (!sector.isActive())
							sector.show();
					}
				}
			}
		}
		offs() {
			let i = this.shown.length;
			while (i--) {
				let sector = this.shown[i];
				if (sector.dist(this) > this.outside) {
					sector.unobserve(this);
					for (let obj of sector.sobjs)
						this.removes.push(obj.id);
					sector.hide();
					this.shown.splice(i, 1);
				}
			}
		}
		gather() {
			let packages: object[] = [];
			for (let sector of this.shown) {
				packages = packages.concat(sector.gather(this));
				// packages = packages.concat(sector.gather(this));
			}
			return packages;
		}
	}

	export class sobj extends toggle {
		id = 'sobj_0'
		type = 'an sobj'
		stamp = 0
		newly = true // unused prototype for newly created objects, rather than newly observed objects
		aabb: aabb2
		wpos: vec2 = [0, 0]
		sector: ssector | null
		// impertinent sobj stays visible
		// impertinent = false
		nosend = false
		constructor(
			public readonly counts: numbers.tally = numbers.objs) {
			super();
			this.counts[1]++;
			this.needs_update();
		}
		finalize() {
			//this.hide();
			this.counts[1]--;
		}
		remove_for_observer(grid: sgrid) {
			grid.removes.push(this.id);
		}
		needs_update() {
			if (this.stamp != 0)
				this.stamp = slod.stamp;
		}
		show() {
			if (this.on())
				return;
			this.counts[0]++;
			this.create();
			this.update();
		}
		hide() {
			//if (this.impertinent)
			//	return;
			if (this.off())
				return;
			this.counts[0]--;
		}
		//after_tick() {
		//	this.newly = false;
		//}
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

		}
		is_type(types: string[]) {
			return types.indexOf(this.type) != -1;
		}
		static attach_truthy(upper, property) {
			if (property)
				upper[property] = property;
		}
		gather(first: boolean) {
			//if (first/* || stamp == slod.stamp*/)
			return { id: this.id, type: this.type, wpos: this.wpos };
			//else
			//	return { id: this.id, type: this.type };

		}
	}
}

export default slod;