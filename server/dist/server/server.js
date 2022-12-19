"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.is_solid = exports.send_message_to_all = void 0;
const ws_1 = require("ws");
//import { send } from 'process';
const pts_1 = __importDefault(require("../src/pts"));
const aabb2_1 = __importDefault(require("../src/aabb2"));
const slod_1 = __importDefault(require("./slod"));
const maps_1 = __importDefault(require("./maps"));
const hooks_1 = __importDefault(require("../src/hooks"));
const colors_1 = __importDefault(require("../src/colors"));
const sinventory_1 = require("./sinventory");
var connections = [];
var heightmap;
var buildingmap;
var treemap;
var objectmap;
var colormap;
var rates = [
    ['scrap', 5, 2],
    ['junk', 5, 2],
    ['bullet', 2, 1],
];
function find_rate(item) {
    for (let tuple of rates)
        if (tuple[0] == item)
            return tuple;
}
/*var prices: [item: string, value: number][] = [
    ['scrap', 5],
    ['junk', 5],
    ['bullet', 1]
]*/
function sample(a) {
    return a[Math.floor(Math.random() * a.length)];
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        new slod_1.default.sworld();
        // will always observe the trashy vendor and shadow chicken
        //let villageVantage = new slod.sgrid(slod.gworld, 2, 2);
        heightmap = new maps_1.default.scolormap('heightmap');
        buildingmap = new maps_1.default.scolormap('buildingmap');
        treemap = new maps_1.default.scolormap('treemap');
        objectmap = new maps_1.default.scolormap('objectmap');
        colormap = new maps_1.default.scolormap('colormap');
        yield heightmap.read();
        yield buildingmap.read();
        yield treemap.read();
        yield objectmap.read();
        yield colormap.read();
        console.log('awaited all map reads');
        //await new Promise((resolve, reject) => {setTimeout(()=>resolve(1), 3000)});
        registrations();
    });
}
function registrations() {
    function factory(type, pos, hints = {}) {
        let obj = new type;
        obj.wpos = pos;
        slod_1.default.add(obj);
        return obj;
    }
    hooks_1.default.register('sectorCreate', (sector) => {
        pts_1.default.func(sector.small, (pos) => {
            pos = pts_1.default.subtract(pos, [0, 0]);
            let pixel = treemap.pixel(pos);
            if (pixel.is_color(colors_1.default.color_decidtree)) {
                factory(tree, pos);
                //console.log('decid tree', pos);
            }
            else if (pixel.is_color(colors_1.default.color_deadtree)) {
                factory(tree, pos);
                //console.log('dead tree', pos);
            }
        });
        return false;
    });
    hooks_1.default.register('sectorCreate', (sector) => {
        pts_1.default.func(sector.small, (pos) => {
            pos = pts_1.default.subtract(pos, [0, 0]);
            let pixel = buildingmap.pixel(pos);
            if (pixel.is_color(colors_1.default.color_plywood_wall)) {
                factory(wall, pos);
            }
            else if (pixel.is_color(colors_1.default.color_overgrown_wall)) {
                factory(wall, pos);
            }
            else if (pixel.is_color(colors_1.default.color_door)) {
                factory(door, pos);
            }
        });
        return false;
    });
    hooks_1.default.register('sectorCreate', (sector) => {
        pts_1.default.func(sector.small, (pos) => {
            let pixel = objectmap.pixel(pos);
            if (pixel.is_color(colors_1.default.color_square_barrel)) {
                // factory(objects.acidbarrel, pixel, pos);
            }
            else if (pixel.is_color(colors_1.default.color_wall_chest)) {
                factory(crate, pos);
            }
            else if (pixel.is_color(colors_1.default.color_shelves)) {
                factory(shelves, pos);
                console.log('shelves', pos);
            }
            else {
                //let chick = new chicken;
                //chick.wpos = pos;
                //slod.add(chick);
            }
        });
        return false;
    });
    let vendor = new pawn;
    //vendor.pawntype = 'trader';
    vendor.walkArea = new aabb2_1.default([38, 49], [41, 49]);
    vendor.dialogue = 2;
    vendor.wpos = [37.5, 48.5];
    vendor.subtype = 'trader';
    vendor.isTrader = true;
    vendor.title = 'Vendor';
    vendor.inventory.add('scrap', -1);
    vendor.inventory.add('junk', -1);
    vendor.inventory.add('bullet', -1);
    slod_1.default.add(vendor);
    for (let i = 0; i < 1; i++) {
        let guard = new pawn;
        guard.wpos = [45, 56];
        //peacekeeper.outfit = []
        guard.dialogue = 3;
        guard.title = 'Guard';
        guard.subtype = 'guard';
        guard.walkArea = new aabb2_1.default([43, 51], [46, 58]);
        slod_1.default.add(guard);
    }
    let zomb = new zombie;
    zomb.wpos = [34, 50];
    zomb.dead = true;
    zomb.stayDead = true;
    zomb.title = 'Faceplant';
    zomb.examine = `Looks like a knocked out zombie.`;
    zomb.walkArea = new aabb2_1.default([33, 45], [35, 51]);
    slod_1.default.add(zomb);
    // behind talker zombie
    let zomb2 = new zombie;
    zomb2.wpos = [45, 67];
    zomb2.walkArea = new aabb2_1.default([43, 65], [49, 70]);
    slod_1.default.add(zomb2);
    let talker = new pawn;
    talker.wpos = [43.8, 61.2];
    //peacekeeper.outfit = []
    talker.dialogue = 4;
    talker.angle = Math.PI / 2;
    talker.subtype = 'civilian';
    talker.walkArea = new aabb2_1.default([43.5, 61.5], [45.5, 59.5]);
    slod_1.default.add(talker);
    //for (let i = 0; i < 10; i++) {
    let shadowChicken = new chicken;
    shadowChicken.wpos = [42, 53];
    shadowChicken.respawns = true;
    shadowChicken.examine = 'This chicken likes the shadow.';
    shadowChicken.walkArea = new aabb2_1.default([41, 54], [43, 51]);
    slod_1.default.add(shadowChicken);
    //}
}
const tick_rate = 333;
var delta = tick_rate / 1000;
const wss = new ws_1.WebSocketServer({
    port: 8080
});
function send_message_to_all(message, duration) {
    for (let con of connections)
        con.messages.push([message, duration]);
}
exports.send_message_to_all = send_message_to_all;
class timer {
    constructor(seed) {
        this.time = 0;
        this.time = Date.now() + seed;
    }
    started() {
        this.time > 0;
    }
    elapsed(elapsed) {
        return Date.now() - this.time > elapsed;
    }
}
class connection {
    constructor(ws) {
        this.ws = ws;
        this.messages = [];
        this.sendDelay = 0;
        this.sentPlayer = false;
        console.log('new connection');
        send_message_to_all("New player joins", 3);
        this.sendDelay = Date.now() + 1000;
        this.grid = new slod_1.default.sgrid(slod_1.default.gworld, 2, 2);
        this.you = new player;
        this.you.wpos = [44, 51];
        // this.you.impertinent = true;
        slod_1.default.add(this.you);
        if (Math.random() > .5)
            this.you.inventory.add('beer');
        if (Math.random() > .5)
            this.you.inventory.add('string');
        if (Math.random() > .5)
            this.you.inventory.add('stone');
        //const string = JSON.stringify({ playerId: this.you.id });
        //this.ws.send(string);
    }
    close() {
        this.grid.outside = -1;
        this.grid.offs();
        this.you.hide();
        slod_1.default.remove(this.you);
        this.you.finalize();
        if (this.you.freezingNpc)
            this.you.freezingNpc.frozenBy = undefined;
        send_message_to_all("A player disconnected", 3);
    }
    receive(json) {
        this.json = json;
        this.process();
        /*if (json.player) {
            if (this.you) {
                //this.you.needsAnUpdate = true
                this.you.needs_update(1); // todo stamp padding is so so
                this.you.wpos = json.player.wpos;
                this.you.angle = json.player.angle;
                this.you.aiming = json.player.aiming;
                this.you.sector?.swap(this.you);
            }
        }*/
    }
    process() {
        if (!this.json)
            return;
        const json = this.json;
        this.json = undefined;
        if (json.player) {
            if (this.you) {
                //this.you.needsAnUpdate = true
                this.you.needs_update();
                this.you.wpos = json.player.wpos;
                this.you.angle = json.player.angle;
                this.you.aiming = json.player.aiming;
                slod_1.default.ssector.swap(this.you);
            }
        }
        if (json.player.shoot) {
            const hasBullet = this.you.inventory.amount('bullet');
            if (hasBullet) {
                this.you.shoot(this.you.angle);
                this.you.inventory.remove('bullet');
            }
        }
        if (json.interactingWith) {
            console.log('player is interacting with npc', json.interactingWith);
            const npc = slod_1.default.byId[json.interactingWith];
            if (npc) {
                this.you.freezingNpc = npc;
                npc.frozenBy = this.you;
            }
            else
                console.warn('cant talk to this entity');
        }
        if (json.wantToBuy) {
            console.log('player wants to buy', json.wantToBuy);
            let trader = this.you.freezingNpc;
            if (trader && trader.type == 'pawn') {
                if (trader.inventory.get(json.wantToBuy)) {
                    const money = this.you.inventory.get("money");
                    const rate = find_rate(json.wantToBuy);
                    const cost = rate && rate[1] || 1;
                    if (money && money[1] >= cost) {
                        trader.inventory.remove(json.wantToBuy);
                        this.you.inventory.add(json.wantToBuy);
                        money[1] -= cost;
                    }
                }
            }
            else
                this.messages.push(['Not properly interacting with an NPC.', 2]);
        }
        if (json.wantToSell) {
            console.log('player wants to sell', json.wantToSell);
            let trader = this.you.freezingNpc;
            if (trader && trader.type == 'pawn') {
                let tuple;
                if (this.you.inventory.get(json.wantToSell)) {
                    const money = this.you.inventory.get("money");
                    const rate = find_rate(json.wantToSell);
                    const cost = rate && rate[2] || 1;
                    this.you.inventory.remove(json.wantToSell);
                    this.you.inventory.add("money", cost);
                    trader.inventory.add(json.wantToSell);
                }
            }
            else
                this.messages.push(['Not properly interacting with an NPC.', 2]);
        }
        if (json.wantToGrab) {
            console.log('player wants to grab ', json.wantToGrab);
            const container = slod_1.default.byId[json.wantToGrab[0]];
            // todo do a distance check between the container and pawn
            if (container && container.inventory.get(json.wantToGrab[1])) {
                container.inventory.remove(json.wantToGrab[1]);
                this.you.inventory.add(json.wantToGrab[1]);
            }
        }
        if (json.tradeWithId) {
            console.log('player is trying to trade with', json.tradeWithId);
        }
        // check if standing in shallow water
        const vec = colormap.pixel(pts_1.default.round(this.you.wpos)).vec;
        if (vec && vec[0] == 50 && vec[1] == 50 && vec[2] == 50) {
            console.log(`we're standing in shallow water`);
        }
        else {
            //console.log('the color is',vec);
        }
    }
    update_grid() {
        if (this.you) {
            let pos = this.you.wpos;
            pos = pts_1.default.add(pos, [.5, .5]);
            slod_1.default.gworld.update_grid(this.grid, pos);
        }
    }
    gather() {
        var _a;
        let object = {};
        if (!this.sentPlayer) {
            this.sentPlayer = true;
            console.log('sending you-pawn id');
            object.playerId = (_a = this.you) === null || _a === void 0 ? void 0 : _a.id;
            object.rates = rates;
        }
        object.news = this.grid.gather();
        if (this.grid.removes.length)
            object.removes = this.grid.removes;
        this.grid.removes = [];
        if (this.messages.length)
            object.messages = this.messages;
        this.messages = [];
        const string = JSON.stringify(object);
        this.ws.send(string);
    }
}
const loop = () => {
    slod_1.default.ssector.tick_actives();
    for (let con of connections) {
        //con.process();
        con.update_grid();
        con.gather();
        //con.ws.send();
    }
    slod_1.default.ssector.unstamp_newlies();
    slod_1.default.stamp++;
};
const outfits = [
    //['#2f302e', '#414439', '#444139', '#3e3f38'], // default
    ['#2c3136', '#3a3935', '#3a3935', '#35393a'], // blueish
    //['#474348', '#454049', '#454049', '#484c4c'], // pink
];
class supersobj extends slod_1.default.sobj {
    constructor() {
        super();
        this.isSuperSobj = true;
        this.title = '';
        this.examine = '';
        this.solid = true;
        this.size = 1;
    }
    create() {
        //console.log('create supersobj', this.type);
        this.rebound();
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        if (fully) {
            if (this.title)
                random.title = this.title;
            if (this.examine)
                random.examine = this.examine;
        }
        return upper;
    }
    rebound() {
        const size = this.size / 2;
        this.bound = new aabb2_1.default([-size, -size], [size, size]);
        this.bound.translate(this.wpos);
    }
    on_hit(by) {
    }
    shoot(angle) {
        let hits = [];
        for (let sobj of slod_1.default.ssector.visibles) {
            if (sobj == this)
                continue;
            const cast = sobj;
            if (cast.isSuperSobj) {
                cast.rebound();
                const test = cast.bound.ray({
                    dir: [Math.sin(angle), Math.cos(angle)],
                    org: this.wpos
                });
                if (test) {
                    hits.push(cast);
                    //console.log('we hit something', cast.type);
                    //cast.onhit();
                }
            }
        }
        hits = hits.filter((e) => e.solid); // so we can shoot thru doors
        if (hits.length) {
            hits.sort((a, b) => {
                let c = pts_1.default.distsimple(a.wpos, this.wpos);
                let d = pts_1.default.distsimple(b.wpos, this.wpos);
                return (c > d) ? 1 : -1;
            });
        }
        //for (let hit of hits)
        //	console.log('we hit', hit.type);
        if (hits.length) {
            hits[0].on_hit(this);
        }
    }
}
class wall extends supersobj {
    constructor() {
        super();
        this.type = 'wall';
        //console.log('make wall');
    }
}
class door extends supersobj {
    constructor() {
        super();
        this.type = 'door';
    }
    tick() {
        let open = false;
        const stack = this.sector.stacked(this.wpos);
        for (const sobj of stack) {
            if (sobj == this)
                continue;
            if (sobj.is_type(['pawn', 'chicken']))
                open = true;
        }
        this.solid = !open;
    }
}
class container extends supersobj {
    constructor() {
        super();
        this.ticksAgo = 0;
        this.inventory = new sinventory_1.inventory(this);
    }
    tick() {
        this.ticksAgo++;
        if (this.ticksAgo == 20) {
            // console.log('tick container', 1, 2, 3);
            this.ticksAgo = 0;
        }
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        if (fully || this.inventory.stamp == slod_1.default.stamp)
            random.inventory = this.inventory.collect();
        return upper;
    }
}
class shelves extends container {
    constructor() {
        super();
        //console.log('shelves', 1);
        this.type = 'shelves';
        //this.title = 'Shelves';
        this.inventory.add('stuff', 5);
        if (Math.random() > .5)
            this.inventory.add('junk', 5);
    }
}
class crate extends container {
    constructor() {
        super();
        console.log('crate', 1);
        this.type = 'crate';
        //this.title = 'Crate';
        this.inventory.add('stuff', 5);
        if (Math.random() > .5)
            this.inventory.add('junk', 5);
    }
}
class tree extends supersobj {
    constructor() {
        super();
        this.type = 'tree';
    }
}
function is_solid(pos) {
    const impassable = ['wall', 'crate', 'shelves', 'tree', 'fence', 'deep water'];
    pos = pts_1.default.round(pos);
    let sector = slod_1.default.gworld.at(slod_1.default.sworld.big(pos));
    let at = sector.stacked(pos);
    for (let obj of at) {
        if (obj.is_type(impassable)) {
            return true;
        }
    }
    return false;
}
exports.is_solid = is_solid;
// npc can be a chicken or a pawn
class npc extends supersobj {
    constructor() {
        super();
        this.originalWpos = [0, 0];
        this.respawns = true;
        this.respawned = false;
        this.isNpc = true;
        this.health = 100;
        this.dead = false;
        this.stayDead = false;
        this.aimTarget = [0, 0];
        this.wanderWait = 2000;
        this.speed = 1.0;
        this.timer = new timer(0);
    }
    on_hit(by) {
        if (this.dead)
            return;
        this.health -= 20;
        if (this.health <= 0) {
            this.dead = true;
            console.log('killed this npc');
            this.needs_update();
        }
    }
    try_move_to(pos) {
        let venture = pts_1.default.add(this.wpos, pos);
        if (!is_solid(venture))
            this.wpos = venture;
    }
    wander() {
        if (!this.frozenBy && this.walkArea) {
            if (this.timer.elapsed(this.wanderWait)) {
                const target = this.walkArea.random_point();
                this.aimTarget = pts_1.default.round(target);
                //this.wpos = target;
                this.timer = new timer(0);
            }
        }
        if (!this.frozenBy && !pts_1.default.equals(this.aimTarget, [0, 0])) {
            let angle = pts_1.default.angle(this.wpos, this.aimTarget);
            this.angle = -angle + Math.PI;
            let speed = this.speed * delta;
            this.needs_update();
            let x = speed * Math.sin(this.angle);
            let y = speed * Math.cos(this.angle);
            this.try_move_to([x, y]);
            //let venture = pts.add(this.wpos, [x, y]);
            //this.wpos = venture;
            slod_1.default.ssector.swap(this);
            this.rebound();
            const dist = pts_1.default.distsimple(this.wpos, this.aimTarget);
            if (dist < 0.2)
                this.aimTarget = [0, 0];
        }
        if (this.frozenBy) {
            if (pts_1.default.distsimple(this.frozenBy.wpos, this.wpos) > 1.0) {
                const player = this.frozenBy;
                player.freezingNpc = undefined;
                this.frozenBy = undefined;
                this.timer = new timer(0);
            }
        }
    }
    respawn(oldNpc) {
        // override this
    }
    tick() {
        if (pts_1.default.equals(this.originalWpos, [0, 0])) {
            this.originalWpos = pts_1.default.clone(this.wpos);
            console.log('setting original wpos');
        }
        if (this.dead) {
            if (!this.respawnTimer) {
                this.respawnTimer = new timer(0);
                console.log(`npc died, setting respawn timre`);
            }
            if (!this.stayDead) {
                if (this.respawnTimer.elapsed(20000)) {
                    slod_1.default.remove(this);
                }
                else if (!this.respawned && this.respawnTimer.elapsed(5000)) {
                    this.respawn(this);
                    this.respawned = true;
                }
            }
        }
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        //random.angle = this.angle;
        if (this.dead)
            random.dead = this.dead;
        return upper;
    }
}
const guns = ['revolver', 'rifle', 'lasermusket'];
class pawn extends npc {
    constructor() {
        super();
        this.outfit = [];
        this.subtype = '';
        this.wielding = '';
        this.dialogue = 0;
        this.aiming = false;
        this.isPlayer = false;
        this.isTrader = false;
        this.type = 'pawn';
        this.title = 'Pawn';
        this.outfit = sample(outfits);
        this.wielding = sample(guns);
        this.inventory = new sinventory_1.inventory(this);
    }
    respawn(oldNpc) {
        console.log('PAWN RESPAWN');
        let npc = new pawn;
        npc.title = oldNpc.title;
        npc.dialogue = oldNpc.dialogue;
        npc.respawns = oldNpc.respawns;
        npc.wpos = oldNpc.originalWpos;
        npc.walkArea = oldNpc.walkArea;
        npc.inventory = oldNpc.inventory;
        npc.inventory.owner = npc;
        npc.subtype = oldNpc.subtype;
        npc.isTrader = oldNpc.isTrader;
        slod_1.default.add(npc);
    }
    tick() {
        super.tick();
        if (this.dead)
            return;
        this.wander();
        //if (this.subtype == 'trader') {
        //this.inventory.wpos = this.wpos;
        // console.log('syncing inventory with pawn-npc');
        //}
    }
    on_hit(by) {
        super.on_hit(by);
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        if (fully) {
            //console.log('pawn fully');
            //console.log('outfit');
            random.outfit = this.outfit;
            random.dialogue = this.dialogue;
            random.subtype = this.subtype;
            random.wielding = this.wielding;
            if (this.examine)
                random.examine = this.examine;
        }
        if (this.aiming)
            random.aiming = this.aiming;
        if (fully || this.inventory.stamp == slod_1.default.stamp) {
            //console.log('inventory needs an update');
            random.inventory = this.inventory.collect();
        }
        return upper;
    }
}
class player extends pawn {
    constructor() {
        super();
        this.type = 'pawn';
        this.title = 'Player';
        this.isPlayer = true;
        this.inventory.add('money', 10);
        this.inventory.add('bullet', 20);
        this.inventory.add('cork', 50);
        console.log('amount of cork:', this.inventory.amount('cork'));
    }
    tick() {
        let bullets = this.inventory.get('bullet');
        this.inventory.remove('cork');
    }
    create() {
        super.create();
    }
    hide() {
        console.log('ply-pawn should be impertinent');
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        if (fully)
            random.isPlayer = true;
        return upper;
    }
    end() {
    }
}
class npc_pawn extends player {
}
class chicken extends npc {
    constructor() {
        super();
        this.peckChance = 0;
        this.pecking = false;
        this.sitting = false;
        this.type = 'chicken';
        this.title = 'Chicken';
        this.examine = 'Cluck cluck.';
        this.randomWalker = Date.now();
        this.health = 10;
        this.speed = 0.75;
        this.size = 0.5;
        this.walkAgain = new timer(0);
    }
    respawn(oldNpc) {
        console.log('CHICKN RESPAWN');
        let npc = new chicken;
        npc.respawns = oldNpc.respawns;
        npc.wpos = oldNpc.originalWpos;
        npc.walkArea = oldNpc.walkArea;
        npc.title = oldNpc.title;
        npc.examine = oldNpc.examine;
        slod_1.default.add(npc);
    }
    on_hit(by) {
        super.on_hit(by);
        if (this.dead) {
            this.pecking = false;
            this.sitting = false;
        }
    }
    gather(fully) {
        let upper = super.gather(fully);
        let [random] = upper;
        // slod.sobj.attach_truthy(upper, this.pecking);
        if (this.pecking)
            random.pecking = this.pecking;
        if (this.sitting)
            random.sitting = this.sitting;
        return upper;
    }
    tick() {
        var _a, _b, _c;
        super.tick();
        if (this.dead)
            return;
        if (pts_1.default.together(this.aimTarget) == 0) {
            if (!this.pecking && !this.sitting && ((_a = this.walkAgain) === null || _a === void 0 ? void 0 : _a.elapsed(3000))) {
                if (Math.random() > .20) {
                    this.pecking = true;
                }
                else {
                    this.sitting = true;
                }
                this.needs_update();
                this.walkAgain = new timer(0);
            }
        }
        if (this.pecking && ((_b = this.walkAgain) === null || _b === void 0 ? void 0 : _b.elapsed(500))) {
            this.pecking = false;
            this.needs_update();
            this.walkAgain = new timer(0);
        }
        else if (this.sitting && ((_c = this.walkAgain) === null || _c === void 0 ? void 0 : _c.elapsed(4000))) {
            this.sitting = false;
            this.needs_update();
            this.walkAgain = new timer(0);
        }
        else if (!this.pecking && !this.sitting) {
            this.wander();
        }
        //this.pecking = false;
    }
}
class zombie extends npc {
    constructor() {
        super();
        this.type = 'zombie';
        this.title = 'Zombie';
        this.wanderWait = 4000;
    }
    tick() {
        super.tick();
        if (this.dead)
            return;
        this.wander();
    }
    respawn(oldNpc) {
        let npc = new zombie;
        //npc.respawns = oldNpc.respawns;
        npc.wpos = oldNpc.originalWpos;
        npc.walkArea = oldNpc.walkArea;
        //npc.title = oldNpc.title;
        //npc.examine = oldNpc.examine;
        slod_1.default.add(npc);
    }
}
function boot() {
    return __awaiter(this, void 0, void 0, function* () {
        yield start();
        setInterval(loop, tick_rate);
        wss.on('connection', (ws) => {
            let con = new connection(ws);
            connections.push(con);
            console.log('players: ', connections.length);
            ws.on('message', (data) => {
                const json = JSON.parse(data);
                con.receive(json);
                //console.log('received: %s', data);
            });
            ws.on('close', () => {
                console.log('closing');
                con.close();
                const i = connections.indexOf(con);
                connections.splice(i, 1);
            });
            //ws.send('something');
        });
    });
}
boot();
