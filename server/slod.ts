import aabb2 from "../src/aabb2";
import pts from "../src/pts";
import hooks from "../src/hooks";

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

namespace slod {

	const grid_crawl_makes_sectors = true;


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

	export var gworld: sworld

	export var SectorSpan = 4;

	export function add(obj: sobj) {
		let sector = gworld.at(gworld.big(obj.wpos));
		sector.add(obj);
	}

	export function remove(obj: sobj) {
		obj.sector?.remove(obj);
	}

	export class sworld {
		readonly arrays: ssector[][] = []
		constructor(span) {
			gworld = this;
		}
		update_grid(grid: sgrid, wpos: vec2) {
			grid.big = this.big(wpos);
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
		big(units: vec2): vec2 {
			return pts.floor(pts.divide(units, SectorSpan));
		}
	}

	export class ssector extends toggle {
		color?;
		public observers = 0
		static actives: ssector[] = []
		readonly small: aabb2;
		private readonly objs: sobj[] = [];
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
			hooks.call('sectorCreate', this);

		}
		objsro(): ReadonlyArray<sobj> {
			return this.objs;
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
		swap(obj: sobj) {
			// Call me whenever you move
			let newSector = this.world.at(this.world.big(pts.round(obj.wpos)));
			if (obj.sector != newSector) {
				obj.sector?.remove(obj);
				newSector.add(obj);
				if (!newSector.isActive())
					obj.hide();
			}
		}
		gather() {
			let packages: object[] = [];
			for (let obj of this.objs) {
				packages.push(obj.package());
			}
			return packages;
		}
		static tick() {
			for (let sector of this.actives) {
				sector.tick();
			}
		}
		tick() {
			for (let obj of this.objs) {
				obj.tick();
			}
			hooks.call('sectorTick', this);
			//for (let obj of this.objs)
			//	obj.tick();
		}
		show() {
			if (this.on())
				return;
			console.log('ssector show');

			ssector.actives.push(this);
			numbers.sectors[0]++;
			for (let obj of this.objs)
				obj.show();
			hooks.call('sectorShow', this);
		}
		hide() {
			if (this.observers >= 1) {
				console.log('too many observers to hide');
				return;
			}
			if (this.off())
				return;
			const i = ssector.actives.indexOf(this);
			ssector.actives.splice(i, 1);
			console.log('ssector hide, observers', this.observers);
			numbers.sectors[0]--;
			for (let obj of this.objs)
				obj.hide();
			hooks.call('sectorHide', this);
		}
		dist(grid: sgrid) {
			return pts.distsimple(this.big, grid.big);
		}
	}

	export class sgrid {
		big: vec2 = [0, 0];
		public shown: ssector[] = [];
		all: sobj[] = []
		constructor(
			public world: sworld,
			public spread,
			public outside
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
						sector.observers++;
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
					sector.observers--;
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
		id = 'sobj0'
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
		package() {
			return { id: this.id, type: this.type, wpos: this.wpos };
		}
	}
}

export default slod;