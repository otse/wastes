import { Group } from "three";
import aabb2 from "./aabb2";
import pts from "./pts";
import wastes from "./wastes";
import ren from "./renderer";
import hooks from "./hooks";
export var numbers;
(function (numbers) {
    numbers.sectors = [0, 0];
    numbers.sprites = [0, 0];
    numbers.objs = [0, 0];
    numbers.tiles = [0, 0];
    numbers.floors = [0, 0];
    numbers.trees = [0, 0];
    numbers.leaves = [0, 0];
    numbers.walls = [0, 0];
    numbers.roofs = [0, 0];
    numbers.pawns = [0, 0];
    numbers.chickens = [0, 0];
})(numbers || (numbers = {}));
;
class toggle {
    constructor() {
        this.active = false;
    }
    isActive() { return this.active; }
    ;
    on() {
        if (this.active) {
            // console.warn(' (toggle) already on ');
            return true;
            // it was on before
        }
        this.active = true;
        return false;
        // it wasn't on before
    }
    off() {
        if (!this.active) {
            // console.warn(' (toggle) already off ');
            return true;
        }
        this.active = false;
        return false;
    }
}
var lod;
(function (lod) {
    const chunk_coloration = false;
    const fog_of_war = true;
    const grid_crawl_makes_sectors = true;
    lod.SectorSpan = 2;
    lod.stamp = 0; // used only by server slod
    function register() {
        // hooks.create('sectorCreate')
        // hooks.create('sectorShow')
        // hooks.create('sectorHide')
        // hooks.register('sectorHide', () => { console.log('~'); return false; } );
    }
    lod.register = register;
    function project(unit) {
        return pts.mult(pts.project(unit), wastes.size);
    }
    lod.project = project;
    function unproject(pixel) {
        return pts.divide(pts.unproject(pixel), wastes.size);
    }
    lod.unproject = unproject;
    function add(obj) {
        let sector = lod.gworld.at(lod.world.big(obj.wpos));
        sector.add(obj);
    }
    lod.add = add;
    function remove(obj) {
        var _a;
        (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
    }
    lod.remove = remove;
    class world {
        constructor(span) {
            this.arrays = [];
            lod.gworld = this;
            new grid(2, 2);
        }
        update(wpos) {
            lod.ggrid.big = lod.world.big(wpos);
            lod.ggrid.ons();
            lod.ggrid.offs();
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
            s = this.arrays[big[1]][big[0]] = new sector(big, this);
            return s;
        }
        static big(units) {
            return pts.floor(pts.divide(units, lod.SectorSpan));
        }
    }
    lod.world = world;
    class sector extends toggle {
        constructor(big, world) {
            super();
            this.big = big;
            this.world = world;
            this.fog_of_war = false;
            this.objs = [];
            if (chunk_coloration)
                this.color = (['lightsalmon', 'lightblue', 'beige', 'pink'])[Math.floor(Math.random() * 4)];
            let min = pts.mult(this.big, lod.SectorSpan);
            let max = pts.add(min, [lod.SectorSpan - 1, lod.SectorSpan - 1]);
            this.small = new aabb2(max, min);
            this.group = new Group;
            this.group.frustumCulled = false;
            this.group.matrixAutoUpdate = false;
            numbers.sectors[1]++;
            world.arrays[this.big[1]][this.big[0]] = this;
            //console.log('sector');
            hooks.call('sectorCreate', this);
        }
        add(obj) {
            let i = this.objs.indexOf(obj);
            if (i == -1) {
                this.objs.push(obj);
                obj.sector = this;
                if (this.isActive() && !obj.isActive())
                    obj.show();
            }
        }
        stacked(wpos) {
            let stack = [];
            for (let obj of this.objs)
                if (pts.equals(wpos, pts.round(obj.wpos)))
                    stack.push(obj);
            return stack;
        }
        remove(obj) {
            let i = this.objs.indexOf(obj);
            if (i > -1) {
                obj.sector = null;
                return !!this.objs.splice(i, 1).length;
            }
        }
        static swap(obj) {
            // Call me whenever you move
            let oldSector = obj.sector;
            let newSector = oldSector.world.at(lod.world.big(pts.round(obj.wpos)));
            if (oldSector != newSector) {
                oldSector.remove(obj);
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
        grayscale() {
            this.color = 'gray';
        }
    }
    lod.sector = sector;
    class grid {
        constructor(spread, outside) {
            this.spread = spread;
            this.outside = outside;
            this.big = [0, 0];
            this.shown = [];
            this.visibleObjs = [];
            lod.ggrid = this;
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
        visible(sector) {
            return sector.dist() < this.spread;
        }
        ons() {
            // spread = -2; < 2
            for (let y = -this.spread; y < this.spread + 1; y++) {
                for (let x = -this.spread; x < this.spread + 1; x++) {
                    let pos = pts.add(this.big, [x, y]);
                    let sector = grid_crawl_makes_sectors ? lod.gworld.at(pos) : lod.gworld.lookup(pos);
                    if (!sector)
                        continue;
                    if (!sector.isActive()) {
                        this.shown.push(sector);
                        sector.show();
                        for (let obj of sector.objs)
                            obj.tick();
                    }
                }
            }
        }
        offs() {
            // Hide sectors
            this.visibleObjs = [];
            let i = this.shown.length;
            while (i--) {
                let sector;
                sector = this.shown[i];
                if (sector.dist() > this.outside) {
                    sector.hide();
                    this.shown.splice(i, 1);
                }
                else {
                    sector.tick();
                    this.visibleObjs = this.visibleObjs.concat(sector.objs);
                }
                if (fog_of_war) {
                    if (sector.dist() == this.outside) {
                        //console.log('brim-chunk');
                        sector.fog_of_war = true;
                        //sector.color = '#555555';
                    }
                    else {
                        sector.fog_of_war = false;
                        //sector.color = '#ffffff';
                    }
                }
            }
        }
        ticks() {
            for (let sector of this.shown)
                for (let obj of sector.objs)
                    obj.tick();
        }
    }
    lod.grid = grid;
    ;
    class obj extends toggle {
        constructor(counts = numbers.objs) {
            super();
            this.counts = counts;
            this.id = -1;
            this.type = 'an obj';
            this.networked = false;
            this.solid = false;
            this.wpos = [0, 0];
            this.rpos = [0, 0];
            this.size = [100, 100];
            this.ro = 0;
            this.z = 0; // z is only used by tiles
            this.calcz = 0;
            this.height = 0;
            this.expand = .5;
            this.counts[1]++;
        }
        finalize() {
            // this.hide();
            this.counts[1]--;
        }
        show() {
            var _a;
            if (this.on())
                return;
            this.counts[0]++;
            this.create();
            this.obj_manual_update();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.show();
        }
        hide() {
            var _a;
            if (this.off())
                return;
            this.counts[0]--;
            //this.delete();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.hide();
            // console.log(' obj.hide ');
        }
        rebound() {
            this.bound = new aabb2([-this.expand, -this.expand], [this.expand, this.expand]);
            this.bound.translate(this.wpos);
        }
        wtorpos() {
            this.rpos = lod.project(this.wpos);
        }
        rtospos() {
            this.wtorpos();
            return pts.clone(this.rpos);
        }
        tick() {
            // implement me
        }
        create() {
            // implement me
            // typically used to create a sprite
            console.warn(' (lod) obj.create ');
        }
        // delete is never used
        delete() {
            // implement me
            // console.warn(' (lod) obj.delete ');
        }
        obj_manual_update() {
            var _a;
            // implement me
            this.wtorpos();
            (_a = this.shape) === null || _a === void 0 ? void 0 : _a.shape_manual_update();
        }
        is_type(types) {
            return types.indexOf(this.type) != -1;
        }
    }
    lod.obj = obj;
    ;
    class shape extends toggle {
        constructor(bindObj, counts) {
            super();
            this.bindObj = bindObj;
            this.counts = counts;
            this.bindObj.shape = this;
            this.counts[1]++;
        }
        shape_manual_update() {
        }
        create() {
        }
        dispose() {
        }
        finalize() {
            // this.hide();
            this.counts[1]--;
            this.bindObj.shape = null;
            //console.warn('finalize!');
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
            this.finalize();
            this.counts[0]--;
        }
    }
    lod.shape = shape;
})(lod || (lod = {}));
export default lod;
