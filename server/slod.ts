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
		// Call whenever sobj has moved within tick
		static swap(obj: sobj) {
			let oldSector = obj.sector!;
			let newSector = oldSector.world.at(
				slod.sworld.big(pts.round(obj.wpos)));
			if (oldSector != newSector) {
				oldSector?.remove(obj);
				newSector.add(obj);
				if (!newSector.isActive()) {
					obj.hide();
					//console.warn('sobj move into hidden ssector');
				}

				// Now check for important overlap

				// New sector not observed by old sector
				// [[ Exit ]]
				for (const tuple of oldSector.observers)
					if (!newSector.is_observed_by(tuple[0]))
						tuple[0].removes.push(obj.id);

				// Old sector not observed by new sector
				// [[ Entry ]]
				for (const tuple of newSector!.observers)
					if (!oldSector?.is_observed_by(tuple[0]))
						tuple[0].overlaps.push(obj);

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

				const fully =
					obj.stamp == 0 ||
					tuple[1] == slod.stamp ||
					tuple[0].is_overlap(obj);

				const updated = obj.stamp == slod.stamp;

				if (fully || updated)
					gathers.push(
						obj.gather(fully));

				if (obj.stamp == 0)
					// We were sent fully
					// Mark it for unstamp
					slod.ssector.newlies.push(obj);
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
			// We were sent fully
			// Now unstamp it
			for (let sobj of slod.ssector.newlies)
				sobj.stamp = -1;
		}
		/*static clear_fullies() {
			this.
		}*/
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
		removes: number[] = []
		shown: ssector[] = [];
		overlaps: sobj[] = [];
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
		is_overlap(target: sobj) {
			for (let sobj of this.overlaps)
				if (target == sobj)
					return true;
			return false;
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
				packages = packages.concat(
					sector.gather(this));
				// packages = packages.concat(sector.gather(this));
			}
			this.overlaps = [];
			return packages;
		}
	}

	export class sobj extends toggle {
		static ids = 1
		id = 0
		type = 'an sobj'
		stamp = 0
		aabb: aabb2
		wpos: vec2 = [0, 0]
		angle = 0
		sector: ssector | null
		// impertinent sobj stays visible
		// impertinent = false
		nosend = false
		constructor(
			public readonly counts: numbers.tally = numbers.objs) {
			super();
			this.id = sobj.ids++;
			this.counts[1]++;
			this.needs_update();
		}
		finalize() {
			//this.hide();
			this.counts[1]--;
		}
		remove_for_observer(grid: sgrid) {
			grid.removes.push(this.id); // we do grid removes push manually
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
			// this never worked
			if (property)
				upper[property] = property;
		}
		gather(fully: boolean) {
			// 
			type type = [random: any, tuple: [id: number, wpos: vec2, angle: number, type?: string]];
			let sent = <type>
				[{}, [this.id, this.wpos, this.angle, this.type]];
			if (!fully)
				sent[1].pop();
			return sent;
		}
	}
}

export default slod;