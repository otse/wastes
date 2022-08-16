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

namespace slod {

	const grid_crawl_makes_sectors = true;

	export var gworld: sworld

	export var SectorSpan = 4;

	export var byId: { [id: string]: slod.sobj } = {}

	export function add(sobj: sobj) {
		let sector = gworld.at(slod.sworld.big(sobj.wpos));
		byId[sobj.id] = sobj;
		sector.add(sobj);
	}

	export function remove(obj: sobj) {
		const { sector } = obj;
		if (sector) {
			sector.remove(obj);
			for (let grid of sector.observers)
				grid.removes.push(obj.id);
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
		public observers: sgrid[] = []
		static actives: ssector[] = []
		readonly small: aabb2;
		readonly objs: sobj[] = [];
		constructor(
			public readonly big: vec2,
			readonly world: sworld
		) {
			super();
			console.log(`new ssector ${big[0]} ${big[1]}`);
			let min = pts.mult(this.big, SectorSpan);
			let max = pts.add(min, [SectorSpan - 1, SectorSpan - 1]);
			this.small = new aabb2(max, min);
			numbers.sectors[1]++;
			world.arrays[this.big[1]][this.big[0]] = this;
			hooks.call('ssectorCreate', this);
		}
		observe(grid: sgrid) {
			this.observers.push(grid);
		}
		unobserve(grid: sgrid) {
			this.observers.splice(this.observers.indexOf(grid), 1);
		}
		add(obj: sobj) {
			let i = this.objs.indexOf(obj);
			if (i == -1) {
				this.objs.push(obj);
				obj.sector = this;
				if (this.isActive() && !obj.isActive())
					obj.show();
			}
		}
		stacked(wpos: vec2) {
			let stack: sobj[] = [];
			for (let obj of this.objs)
				if (pts.equals(wpos, pts.round(obj.wpos)))
					stack.push(obj);
			return stack;
		}
		remove(obj: sobj): boolean | undefined {
			let i = this.objs.indexOf(obj);
			if (i > -1) {
				obj.sector = null;
				return !!this.objs.splice(i, 1).length;
			}
		}
		//hard_remove(obj: sobj) {
		//	for (let grid of this.observers)
		//		grid.removes.push(obj.id);
		//}
		is_observed_by(target: sgrid) {
			for (let grid of this.observers)
				if (grid == target)
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
				for (let grid of this.observers) {
					if (!newSector.is_observed_by(grid)) {
						grid.removes.push(obj.id);
					}
				}
			}
		}
		gather() {
			let packages: object[] = [];
			for (let obj of this.objs) {
				packages.push(obj.gather());
			}
			return packages;
		}
		static tick_all() {
			for (let sector of ssector.actives) {
				sector.tick();
			}
		}
		tick() {
			for (let obj of this.objs) {
				obj.tick();
			}
			hooks.call('ssectorTick', this);
			//for (let obj of this.objs)
			//	obj.tick();
		}
		show() {
			if (this.on())
				return;
			//console.log('ssector show');
			ssector.actives.push(this);
			numbers.sectors[0]++;
			for (let obj of this.objs)
				obj.show();
			hooks.call('ssectorShow', this);
		}
		hide() {
			if (this.observers.length >= 1) {
				return;
			}
			if (this.off())
				return;
			const i = ssector.actives.indexOf(this);
			ssector.actives.splice(i, 1);
			console.log('ssector hide, observers', this.observers.length);
			numbers.sectors[0]--;
			for (let obj of this.objs)
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
		public shown: ssector[] = [];
		all: sobj[] = []
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
					for (let obj of sector.objs)
						this.removes.push(obj.id);
					sector.hide();
					this.shown.splice(i, 1);
				}
			}
		}
		gather() {
			let packages: object[] = [];
			for (let sector of this.shown) {
				packages = packages.concat(sector.gather());
			}
			return packages;
		}
	}

	export class sobj extends toggle {
		id = 'sobj_0'
		type = 'an sobj'
		aabb: aabb2
		wpos: vec2 = [0, 0]
		size: vec2 = [100, 100]
		sector: ssector | null
		impertinent = false
		constructor(
			public readonly counts: numbers.tally = numbers.objs) {
			super();
			this.counts[1]++;
		}
		finalize() {
			//this.hide();
			this.counts[1]--;
		}
		remove_for_observer(grid: sgrid) {
			grid.removes.push(this.id);
		}
		show() {
			if (this.on())
				return;
			this.counts[0]++;
			this.create();
			this.update();
		}
		hide() {
			if (this.impertinent)
				return;
			if (this.off())
				return;
			this.counts[0]--;
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
			this.bound();
		}
		bound() {
			let size = this.size;
			this.aabb = new aabb2([-.5, -.5], [.5, .5]);
			this.aabb.translate(this.wpos);
		}
		is_type(types: string[]) {
			return types.indexOf(this.type) != -1;
		}
		gather() {
			return { id: this.id, type: this.type, wpos: this.wpos };
		}
	}
}

export default slod;