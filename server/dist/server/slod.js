"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.numbers = void 0;
const aabb2_1 = __importDefault(require("../src/aabb2"));
const pts_1 = __importDefault(require("../src/pts"));
const hooks_1 = __importDefault(require("../src/hooks"));
var numbers;
(function (numbers) {
    numbers.sectors = [0, 0];
    numbers.objs = [0, 0];
    numbers.tiles = [0, 0];
    numbers.trees = [0, 0];
    numbers.walls = [0, 0];
    numbers.pawns = [0, 0];
})(numbers = exports.numbers || (exports.numbers = {}));
;
class toggle {
    constructor() {
        this.active = false;
    }
    isActive() { return this.active; }
    ;
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
var slod;
(function (slod) {
    const grid_crawl_makes_sectors = true;
    slod.stamp = 0;
    slod.SectorSpan = 3;
    slod.byId = {};
    function add(sobj) {
        let sector = slod.gworld.at(slod.sworld.big(pts_1.default.round(sobj.wpos)));
        slod.byId[sobj.id] = sobj;
        sector.add(sobj);
    }
    slod.add = add;
    function remove(obj) {
        const { sector } = obj;
        if (sector) {
            sector.remove(obj);
            // remove obj for all observers
            for (const tuple of sector.observers)
                tuple[0].removes.push(obj.id);
        }
    }
    slod.remove = remove;
    class sworld {
        constructor() {
            this.arrays = [];
            slod.gworld = this;
        }
        update_grid(grid, wpos) {
            grid.big = slod.sworld.big(wpos);
            grid.offs();
            grid.crawl();
        }
        lookup(big) {
            if (this.arrays[big[1]] == undefined)
                this.arrays[big[1]] = [];
            return this.arrays[big[1]][big[0]];
        }
        at(big) {
            return this.lookup(big) || this.make(big);
        }
        make(big) {
            let s = this.lookup(big);
            if (s)
                return s;
            s = this.arrays[big[1]][big[0]] = new ssector(big, this);
            return s;
        }
        static big(units) {
            return pts_1.default.floor(pts_1.default.divide(units, slod.SectorSpan));
        }
    }
    slod.sworld = sworld;
    class ssector extends toggle {
        constructor(big, world) {
            super();
            this.big = big;
            this.world = world;
            this.observers = [];
            this.sobjs = [];
            // console.log(`new ssector ${big[0]} ${big[1]}`);
            let min = pts_1.default.mult(this.big, slod.SectorSpan);
            let max = pts_1.default.add(min, [slod.SectorSpan - 1, slod.SectorSpan - 1]);
            this.small = new aabb2_1.default(max, min);
            numbers.sectors[1]++;
            world.arrays[this.big[1]][this.big[0]] = this;
            hooks_1.default.call('sectorCreate', this);
        }
        observe(grid) {
            this.observers.push([grid, slod.stamp]);
        }
        unobserve(grid) {
            for (let i = this.observers.length - 1; i >= 0; i--) {
                const tuple = this.observers[i];
                if (tuple[0] == grid) {
                    this.observers.splice(i, 1);
                    break;
                }
            }
        }
        add(obj) {
            let i = this.sobjs.indexOf(obj);
            if (i == -1) {
                this.sobjs.push(obj);
                obj.sector = this;
                if (this.isActive() && !obj.isActive())
                    obj.show();
            }
        }
        stacked(wpos) {
            let stack = [];
            for (let obj of this.sobjs)
                if (pts_1.default.equals(wpos, pts_1.default.round(obj.wpos)))
                    stack.push(obj);
            return stack;
        }
        remove(obj) {
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
        is_observed_by(target) {
            for (const tuple of this.observers)
                if (tuple[0] == target)
                    return true;
            return false;
        }
        // Call whenever sobj has moved within tick
        static swap(obj) {
            let oldSector = obj.sector;
            let newSector = oldSector.world.at(slod.sworld.big(pts_1.default.round(obj.wpos)));
            if (oldSector != newSector) {
                oldSector === null || oldSector === void 0 ? void 0 : oldSector.remove(obj);
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
                for (const tuple of newSector.observers)
                    if (!(oldSector === null || oldSector === void 0 ? void 0 : oldSector.is_observed_by(tuple[0])))
                        tuple[0].overlaps.push(obj);
            }
        }
        find_observer_tuple(observer) {
            for (const tuple of this.observers)
                if (tuple[0] == observer)
                    return tuple;
        }
        gather(grid) {
            const tuple = this.find_observer_tuple(grid);
            let gathers = [];
            for (let obj of this.sobjs) {
                const fully = obj.stamp == 0 ||
                    tuple[1] == slod.stamp ||
                    tuple[0].is_overlap(obj);
                const updated = obj.stamp == slod.stamp;
                if (fully || updated)
                    gathers.push(obj.gather(fully));
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
            hooks_1.default.call('ssectorTick', this);
        }
        show() {
            if (this.on())
                return;
            //console.log('ssector show');
            ssector.actives.push(this);
            numbers.sectors[0]++;
            for (let obj of this.sobjs)
                obj.show();
            hooks_1.default.call('ssectorShow', this);
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
            hooks_1.default.call('ssectorHide', this);
        }
        dist(grid) {
            return pts_1.default.distsimple(this.big, grid.big);
        }
    }
    ssector.newlies = [];
    ssector.visibles = [];
    ssector.actives = [];
    slod.ssector = ssector;
    class sgrid {
        constructor(world, spread, outside) {
            this.world = world;
            this.spread = spread;
            this.outside = outside;
            this.big = [0, 0];
            this.removes = [];
            this.shown = [];
            this.overlaps = [];
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
        is_overlap(target) {
            for (let sobj of this.overlaps)
                if (target == sobj)
                    return true;
            return false;
        }
        visible(sector) {
            return sector.dist(this) < this.spread;
        }
        crawl() {
            // spread = -2; < 2
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts_1.default.add(this.big, [x, y]);
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
            let packages = [];
            for (let sector of this.shown) {
                packages = packages.concat(sector.gather(this));
                // packages = packages.concat(sector.gather(this));
            }
            this.overlaps = [];
            return packages;
        }
    }
    slod.sgrid = sgrid;
    class sobj extends toggle {
        constructor(counts = numbers.objs) {
            super();
            this.counts = counts;
            this.id = 0;
            this.type = 'an sobj';
            this.stamp = 0;
            this.wpos = [0, 0];
            this.angle = 0;
            // impertinent sobj stays visible
            // impertinent = false
            this.nosend = false;
            this.id = sobj.ids++;
            this.counts[1]++;
            this.needs_update();
        }
        finalize() {
            //this.hide();
            this.counts[1]--;
        }
        remove_for_observer(grid) {
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
        tick() {
        }
        create() {
            console.warn(' (lod) obj.create ');
        }
        // delete is never used
        delete() {
            // console.warn(' (lod) obj.delete ');
        }
        update() {
        }
        is_type(types) {
            return types.indexOf(this.type) != -1;
        }
        static attach_truthy(upper, property) {
            // this never worked
            if (property)
                upper[property] = property;
        }
        gather(fully) {
            let sent = [{},
                this.id,
                this.wpos,
                this.angle,
                this.type];
            // example:
            // [{inventory: []}, 12, [24, 48], 0, 'crate']
            // we dont need type unless fully
            if (!fully)
                sent.pop();
            return sent;
        }
    }
    sobj.ids = 1;
    slod.sobj = sobj;
})(slod || (slod = {}));
exports.default = slod;
