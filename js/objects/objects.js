import lod, { numbers } from "../lod";
import wastes, { win, pawns } from "../wastes";
import ren from "../renderer";
import pts from "../pts";
import tiles from "../tiles";
import hooks from "../hooks";
import sprite from "../sprite";
import sprites from "../sprites";
import app from "../app";
import colormap from "../colormap";
import shadows from "../shadows";
import colors from "../colors";
import { building_factory } from "./prefabs";
import { superobject } from "./superobject";
var objects;
(function (objects) {
    function factory(type, pixel, pos, hints = {}) {
        let obj = new type;
        obj.hints = hints;
        obj.pixel = pixel;
        obj.wpos = pos;
        lod.add(obj);
        return obj;
    }
    objects.factory = factory;
    function init() {
    }
    objects.init = init;
    function register() {
        console.log(' objects register ');
        for (let id of ['heightmap', 'objectmap', 'buildingmap', 'treemap', 'colormap', 'roughmap', 'roofmap']) {
            var img = document.getElementById(id);
            if (!img.complete) {
                wastes.resourced(id.toUpperCase());
                console.error('bad', img);
            }
        }
        wastes.heightmap = new colormap.colormap('heightmap');
        wastes.objectmap = new colormap.colormap('objectmap');
        wastes.buildingmap = new colormap.colormap('buildingmap');
        wastes.treemap = new colormap.colormap('treemap');
        wastes.colormap = new colormap.colormap('colormap');
        wastes.roughmap = new colormap.colormap('roughmap');
        wastes.roofmap = new colormap.colormap('roofmap');
        const treeTreshold = 50;
        hooks.register('sectorCreate', (sector) => {
            pts.func(sector.small, (pos) => {
                let pixel = wastes.objectmap.pixel(pos);
                if (pixel.is_color(colors.color_square_barrel)) {
                    factory(objects.squarebarrel, pixel, pos);
                }
                else if (pixel.is_color(colors.color_wall_chest)) {
                    //factory(objects.crate, pixel, pos);
                }
                else if (pixel.is_color(colors.color_wall_chest)) {
                    //factory(objects.crate, pixel, pos);
                }
                else if (pixel.is_color(colors.color_shelves)) {
                    //console.log('got shelves color');
                    //factory(objects.shelves, pixel, pos);
                }
                else if (pixel.is_color(colors.color_panel)) {
                    //factory(objects.panel, pixel, pos);
                }
            });
            return false;
        });
        hooks.register('sectorCreate', (sector) => {
            pts.func(sector.small, (pos) => {
                let pixel = wastes.roofmap.pixel(pos);
                if (pixel.is_color(colors.color_false_front)) {
                    //factory(objects.roof, pixel, pos);
                    factory(objects.falsefront, pixel, pos);
                }
            });
            return false;
        });
        hooks.register('sectorCreate', (sector) => {
            pts.func(sector.small, (pos) => {
                let pixel = wastes.treemap.pixel(pos);
                if (pixel.is_color(colors.color_decidtree)) {
                    factory(objects.decidtree, pixel, pos, { type: 'decid' });
                }
                else if (pixel.is_color(colors.color_deadtree)) {
                    factory(objects.deadtree, pixel, pos);
                }
                else if (pixel.is_color(colors.color_grass)) {
                    // factory(objects.grass, pixel, pos);
                }
            });
            return false;
        });
        hooks.register('sectorCreate', (sector) => {
            pts.func(sector.small, (pos) => {
                let pixel = wastes.buildingmap.pixel(pos);
                if (pixel.is_color(colors.color_plywood_wall)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.wall, pixel, pos, { type: 'plywood' });
                    factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_overgrown_wall)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.wall, pixel, pos, { type: 'overgrown' });
                    factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_deringer_wall)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.wall, pixel, pos, { type: 'sideroom' });
                    factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_medieval_wall)) {
                    factory(objects.wall, pixel, pos, { type: 'medieval' });
                }
                else if (pixel.is_color(colors.color_scrappy_wall)) {
                    factory(objects.wall, pixel, pos, { type: 'scrappy' });
                    //factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_fence)) {
                    //factory(fences.fence, pixel, pos);
                }
                else if (pixel.is_color(colors.color_wheat)) {
                    //factory(objects.wheat, pixel, pos);
                }
                else if (pixel.is_color(colors.color_deck_and_roof)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_porch)) {
                    factory(objects.porch, pixel, pos);
                }
                else if (pixel.is_color(colors.color_rails)) {
                    factory(objects.rails, pixel, pos);
                }
                else if (pixel.is_color(colors.color_door)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.door, pixel, pos);
                    factory(objects.roof, pixel, pos);
                }
                else if (pixel.is_color(colors.color_wooden_door_and_deck)) {
                    factory(objects.deck, pixel, pos);
                    factory(objects.door, pixel, pos);
                    //factory(objects.roof, pixel, pos);
                }
            });
            return false;
        });
    }
    objects.register = register;
    function start() {
        console.log(' objects start ');
        let prefab = building_factory();
        //prefab.wpos = [45, 48];
        //prefab.produce();
        //lod.add(prefab);
    }
    objects.start = start;
    function tick() {
        if (app.key(' ') == 1) {
            wastes.HIDE_ROOFS = !wastes.HIDE_ROOFS;
            console.log('hide roofs', wastes.HIDE_ROOFS);
        }
    }
    objects.tick = tick;
    function is_solid(pos) {
        const impassable = ['wall', 'crate', 'shelves', 'tree', 'fence', 'deep water'];
        pos = pts.round(pos);
        if (tiles.get(pos) == undefined)
            return true;
        let sector = lod.gworld.at(lod.world.big(pos));
        let at = sector.stacked(pos);
        for (let obj of at) {
            if (obj.is_type(['door']))
                return false;
            if (obj.is_type(impassable) && obj.calcz < 20) {
                return true;
            }
        }
        return false;
    }
    objects.is_solid = is_solid;
    class wall extends superobject {
        constructor() {
            super(numbers.walls);
            this.type = 'wall';
            this.height = 23;
            this.solid = true;
        }
        create() {
            var _a, _b, _c, _d, _e, _f;
            this.rebound();
            this.size = [24, 40];
            this.cell = [255 - this.pixel.arrayRef[3], 0];
            let tuple = sprites.dscrappywalls;
            if (((_a = this.hints) === null || _a === void 0 ? void 0 : _a.type) == 'plywood')
                tuple = sprites.dderingerwalls;
            if (((_b = this.hints) === null || _b === void 0 ? void 0 : _b.type) == 'overgrown')
                tuple = sprites.dderingerwalls;
            if (((_c = this.hints) === null || _c === void 0 ? void 0 : _c.type) == 'deringer')
                tuple = sprites.dderingerwalls;
            if (((_d = this.hints) === null || _d === void 0 ? void 0 : _d.type) == 'woody')
                tuple = sprites.dwoodywalls;
            if (((_e = this.hints) === null || _e === void 0 ? void 0 : _e.type) == 'medieval')
                tuple = sprites.dmedievalwalls;
            else if (((_f = this.hints) === null || _f === void 0 ? void 0 : _f.type) == 'ruddy')
                tuple = sprites.druddywalls;
            else {
                //if (Math.random() > .5)
                //	tuple = sprites.dscrappywalls2;
            }
            let shape = new sprite({
                binded: this,
                tuple: tuple,
                cell: this.cell,
                orderBias: 1.0,
            });
            this.stack();
        }
        adapt() {
            // change sprite to surrounding walls
        }
    }
    objects.wall = wall;
    class deck extends superobject {
        constructor() {
            super(numbers.floors);
            this.type = 'deck';
            this.height = 3;
        }
        onhit() { }
        create() {
            this.rebound();
            this.tile.hasDeck = true;
            //this.tile!.z -= 24;
            this.size = [24, 17];
            //if (this.pixel!.array[3] < 240)
            //	this.cell = [240 - this.pixel!.array[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.ddeck,
                cell: this.cell,
                orderBias: .4,
            });
            this.stack();
        }
        tick() {
            super.tick();
            let pos = this.wpos;
            let sector = lod.gworld.at(lod.world.big(pos));
            let at = sector.stacked(pos);
            for (let obj of at) {
                if (obj.type == 'you') {
                    wastes.HIDE_ROOFS = true;
                    break;
                }
            }
        }
    }
    deck.timer = 0;
    objects.deck = deck;
    class porch extends superobject {
        constructor() {
            super(numbers.floors);
            this.type = 'porch';
            this.height = 3;
        }
        onhit() { }
        create() {
            this.rebound();
            //this.tile!.z -= 24;
            this.size = [24, 17];
            //if (this.pixel!.array[3] < 240)
            //	this.cell = [240 - this.pixel!.array[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dporch,
                cell: this.cell,
                orderBias: 0.1
            });
            shape.shadowAmount = shadows.get_amount(pts.round(this.wpos));
            this.stack();
        }
    }
    porch.timer = 0;
    objects.porch = porch;
    class rails extends superobject {
        constructor() {
            super(numbers.floors);
            this.type = 'porch';
            this.height = 3;
        }
        create() {
            this.rebound();
            //this.tile!.z -= 24;
            this.size = [24, 17];
            //if (this.pixel!.array[3] < 240)
            //	this.cell = [240 - this.pixel!.array[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.drails,
                cell: this.cell,
                orderBias: .4,
            });
            this.stack();
        }
        tick() {
        }
    }
    rails.timer = 0;
    objects.rails = rails;
    class deadtree extends superobject {
        constructor() {
            super(numbers.floors);
            this.type = 'tree';
            this.height = 24;
            this.solid = true;
        }
        create() {
            this.rebound();
            this.size = [24, 50];
            let shape = new sprite({
                binded: this,
                tuple: sprites.ddeadtreetrunk,
                orderBias: 0.6,
            });
            this.stack();
        }
    }
    deadtree.timer = 0;
    objects.deadtree = deadtree;
    class squarebarrel extends superobject {
        constructor() {
            super(numbers.floors);
            this.type = 'tree';
            this.height = 12;
            this.solid = true;
            this.expand = .4;
            console.log('woo!');
        }
        create() {
            this.rebound();
            this.size = [24, 26];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dsquarebarrel,
                orderBias: 1.0
            });
            shape.shadowAmount = shadows.get_amount(pts.round(this.wpos));
            this.stack();
        }
    }
    objects.squarebarrel = squarebarrel;
    class decidtree extends superobject {
        constructor() {
            super(numbers.trees);
            this.flowered = false;
            this.type = 'tree';
            this.height = 24;
            this.solid = true;
        }
        create() {
            this.rebound();
            this.size = [24, 50];
            //if (this.pixel!.array[3] < 240)
            //	this.cell = [240 - this.pixel!.array[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.ddecidtreetrunk,
                orderBias: 1.0,
                mask: true,
                negativeMask: true
            });
            this.stack();
            const tile = tiles.get(this.wpos);
            if (!this.flowered) {
                this.flowered = true;
                for (let y = -1; y <= 1; y++)
                    for (let x = -1; x <= 1; x++)
                        if (!(x == 0 && y == 0))
                            factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [x, y]), {
                                type: this.hints.type,
                                tree: this,
                                color: tile.color,
                                grid: [x, y]
                            });
                //factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
                //factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
            }
        }
    }
    objects.decidtree = decidtree;
    class treeleaves extends superobject {
        constructor() {
            super(numbers.leaves);
            this.shaded = false;
            this.hasVines = false;
            this.type = 'leaves';
            this.height = 14;
            /*if (!this.hints.noVines || Math.random() > 0.5)
                this.hasVines = true;*/
        }
        onhit() {
        }
        create() {
            let pixel = wastes.treemap.pixel(this.wpos);
            if (!this.hints.noVines && pixel.arrayRef[3] == 254)
                this.hasVines = false; // true;
            if (pixel.arrayRef[3] == 253)
                return;
            this.rebound();
            let tuple = sprites.dtreeleaves;
            if (this.hasVines) {
                this.size = [24, 64];
                const grid = this.hints.grid || [0, 0];
                if (pts.equals(grid, [1, 0]) || pts.equals(grid, [1, 1])) {
                    tuple = sprites.dvines2;
                    //this.hints.color = [0, 0, 0, 255]
                    console.log(' !! using dvines 2 !!');
                }
                else if (pts.equals(grid, [0, -1]) || pts.equals(grid, [-1, -1])) {
                    tuple = sprites.dvines3;
                    //this.hints.color = [0, 0, 0, 255]
                }
                else {
                    tuple = sprites.dvines;
                }
            }
            else {
                this.size = [24, 31];
            }
            //this.try_create_vines();
            //if (this.pixel!.array[3] < 240)
            //	this.cell = [240 - this.pixel!.array[3], 0];
            let color = this.hints.color || [1, 1, 1];
            let color2 = wastes.colormap.pixel(this.wpos);
            if (!(255 - color2.arrayRef[3])) {
                if (this.hints.color) {
                    color = [
                        Math.floor(color[0] * 1.6),
                        Math.floor(color[1] * 1.6),
                        Math.floor(color[2] * 1.6)
                    ];
                }
                let shape = new sprite({
                    binded: this,
                    tuple: tuple,
                    orderBias: 0.7,
                    color: color,
                    masked: true
                });
                shape.writez = false;
                //shadows.shade(this.wpos, 0.1);
                if (!this.shaded) {
                    this.shaded = true;
                    const shadow = 0.03;
                    shadows.shade_matrix(this.wpos, [
                        [shadow / 2, shadow, shadow / 2],
                        [shadow, shadow, shadow],
                        [shadow / 2, shadow, shadow / 2]
                    ]);
                }
                if (this.hints.tree)
                    this.special_leaves_stack();
                else
                    this.stack();
            }
        }
        special_leaves_stack() {
            //console.log('special stack');
            const tree = this.hints.tree;
            if (this.shape) {
                const sprite = this.shape;
                this.z = tree.calcz + tree.height;
                sprite.rup = this.z;
                if (this.hasVines) {
                    sprite.rup2 = -33;
                }
            }
        }
    }
    objects.treeleaves = treeleaves;
    class grass extends superobject {
        constructor() {
            super(numbers.roofs);
            this.type = 'grass';
            this.height = 4;
            this.solid = false;
        }
        create() {
            this.rebound();
            this.size = [24, 30];
            let color = tiles.get(this.wpos).color;
            color = [
                Math.floor(color[0] * 1.5),
                Math.floor(color[1] * 1.5),
                Math.floor(color[2] * 2.0)
            ];
            this.cell = [255 - this.pixel.arrayRef[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dgrass,
                cell: this.cell,
                orderBias: 0.5,
                color: color
            });
            this.stack();
        }
    }
    objects.grass = grass;
    class wheat extends superobject {
        constructor() {
            super(numbers.roofs);
            this.type = 'wheat';
            this.height = 4;
        }
        create() {
            this.rebound();
            this.size = [24, 30];
            //let color =  tiles.get(this.wpos)!.color;
            //this.cell = [Math.floor(Math.random() * 2), 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dwheat,
                cell: this.cell,
                //color: color,
                orderBias: .6
            });
            this.stack();
        }
    }
    objects.wheat = wheat;
    class panel extends superobject {
        constructor() {
            super(numbers.roofs);
            this.ticker = 0;
            this.type = 'panel';
            this.height = 10;
        }
        create() {
            this.rebound();
            this.size = [8, 10];
            //let color =  tiles.get(this.wpos)!.color;
            //this.cell = [Math.floor(Math.random() * 2), 0];
            //return;
            let shape = new sprite({
                binded: this,
                tuple: sprites.dpanel,
                cell: [0, 0],
                //color: color,
                orderBias: 0
            });
            shape.rup2 = 15;
            shape.rleft = 2;
            this.stack();
        }
        tick() {
            //return;
            let sprite = this.shape;
            this.ticker += ren.delta;
            const cell = sprite.vars.cell;
            if (this.ticker > 0.5) {
                if (cell[0] < 5)
                    cell[0]++;
                else
                    cell[0] = 0;
                this.ticker = 0;
            }
            //sprite.retransform();
            sprite.shape_manual_update();
            //console.log('boo');
        }
    }
    objects.panel = panel;
    class crate extends superobject {
        constructor() {
            super(numbers.objs);
            this.type = 'crate';
            this.title = 'Crate';
            this.height = 17;
        }
        create() {
            this.rebound();
            this.size = [24, 40];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dcrate,
                cell: this.cell,
                orderBias: 1.0
            });
            this.stack(['roof', 'wall']);
        }
        tick() {
            const sprite = this.shape;
            if (!sprite)
                return;
            this.hovering_pass();
        }
        superobject_setup_context_menu() {
            console.log('setup context');
            win.contextmenu.reset();
            win.contextmenu.options.options.push(["See contents", () => {
                    return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                }, () => {
                    win.container.focus = this;
                    win.container.call_once();
                }]);
        }
    }
    objects.crate = crate;
    class shelves extends superobject {
        constructor() {
            super(numbers.objs);
            this.type = 'shelves';
            this.title = 'Shelves';
            this.height = 25;
        }
        create() {
            this.rebound();
            this.size = [20, 31];
            //this.cell = [255 - this.pixel!.array[3], 0];
            //return
            let shape = new sprite({
                binded: this,
                tuple: sprites.dshelves,
                //cell: this.cell,
                orderBias: 1.0
            });
            //shape.rup2 = 9;
            //shape.rleft = 6;
            this.stack(['roof', 'wall']);
        }
        tick() {
            const sprite = this.shape;
            this.hovering_pass();
        }
        superobject_setup_context_menu() {
            console.log('setup context');
            win.contextmenu.reset();
            win.contextmenu.options.options.push(["See contents", () => {
                    return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                }, () => {
                    win.container.focus = this;
                    win.container.call_once();
                }]);
            /*win.contextmenu.options.options.push(["Store", () => {
                return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
            }, () => {
                //win.container.crate = this;
                //win.container.call_once();
            }]);*/
            win.contextmenu.options.options.push(["Examine", () => {
                    return pts.distsimple(pawns.you.wpos, this.wpos) < 10;
                }, () => {
                    win.descriptor.focus = this;
                    win.descriptor.call_once("A shelves with not much on it.");
                }]);
        }
    }
    objects.shelves = shelves;
    class roof extends superobject {
        constructor() {
            super(numbers.roofs);
            this.shaded = false;
            this.type = 'roof';
            this.height = 3;
        }
        onhit() { }
        create() {
            //return;
            this.rebound();
            this.size = [24, 17];
            let shape = new sprite({
                binded: this,
                tuple: sprites.droof,
                orderBias: 1.0,
            });
            shape.rup = 26 + 3;
            if (!this.shaded) {
                this.shaded = true;
                const shadow = .7;
                shadows.shade_matrix(this.wpos, [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, shadow, 0],
                    [0, 0, 0, 0, shadow]
                ], true);
            }
        }
        tick() {
            super.tick();
            const sprite = this.shape;
            if (!sprite)
                return;
            if (wastes.HIDE_ROOFS)
                sprite.mesh.visible = false;
            else if (!wastes.HIDE_ROOFS)
                sprite.mesh.visible = true;
        }
    }
    objects.roof = roof;
    class falsefront extends superobject {
        constructor() {
            super(numbers.roofs);
            this.type = 'falsefront';
            this.height = 5;
        }
        create() {
            this.rebound();
            this.cell = [255 - this.pixel.arrayRef[3], 0];
            this.size = [24, 40];
            let shape = new sprite({
                binded: this,
                tuple: sprites.dfalsefronts,
                cell: this.cell,
                orderBias: 1.6,
            });
            this.stack();
            //this.z = 29+4;
        }
        tick() {
            super.tick();
            const sprite = this.shape;
            if (!sprite)
                return;
            if (wastes.HIDE_ROOFS)
                sprite.mesh.visible = false;
            else if (!wastes.HIDE_ROOFS)
                sprite.mesh.visible = true;
        }
    }
    objects.falsefront = falsefront;
    class door extends superobject {
        constructor() {
            super(numbers.walls);
            this.open = false;
            this.type = 'door';
            this.height = 23;
        }
        create() {
            this.rebound();
            this.size = [24, 40];
            if (this.pixel)
                this.cell = [255 - this.pixel.arrayRef[3], 0];
            let shape = new sprite({
                binded: this,
                tuple: sprites.ddoor,
                cell: this.cell,
                orderBias: door.order,
            });
            this.stack();
        }
        tick() {
            super.tick();
            if (!this.shape)
                return;
            let pos = this.wpos;
            let sector = lod.gworld.at(lod.world.big(pos));
            let at = sector.stacked(pos);
            let pawning = false;
            for (let obj of at) {
                if (obj.is_type(['pawn', 'you'])) {
                    pawning = true;
                    let sprite = this.shape;
                    sprite.vars.cell = pts.subtract(this.cell, [1, 0]);
                    sprite.vars.orderBias = 1.55;
                    sprite.retransform();
                    sprite.shape_manual_update();
                    this.open = true;
                    break;
                }
            }
            if (!pawning) {
                let sprite = this.shape;
                sprite.vars.cell = this.cell;
                sprite.vars.orderBias = door.order;
                sprite.retransform();
                sprite.shape_manual_update();
                this.open = false;
            }
        }
    }
    door.order = .7;
    objects.door = door;
    class shrubs extends superobject {
        constructor() {
            super(numbers.trees);
            this.type = 'shrubs';
        }
        create() {
            this.size = [24, 15];
            let shape = new sprite({
                binded: this,
                tuple: sprites.shrubs,
                orderBias: .5
            });
        }
    }
    objects.shrubs = shrubs;
})(objects || (objects = {}));
export default objects;
