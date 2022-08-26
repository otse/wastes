import { WebSocketServer } from 'ws';
//import { send } from 'process';

import pts from "../src/pts"
import aabb2 from "../src/aabb2"
import slod from "./slod"
import { timeStamp } from 'console';
import maps from './maps';
import hooks from '../src/hooks';
import colors from '../src/colors';
import { inventory } from './sinventory';

var connections: connection[] = [];

var heightmap: maps.scolormap
var buildingmap: maps.scolormap
var objectmap: maps.scolormap
var colormap: maps.scolormap

var rates: [item: string, buy: number, sell: number][] = [
	['scrap', 5, 2],
	['junk', 5, 2],
	['bullet', 2, 1],
]

/*var prices: [item: string, value: number][] = [
	['scrap', 5],
	['junk', 5],
	['bullet', 1]
]*/

function start() {

	new slod.sworld();

	// will observe the trashy vendor and shadow chicken
	//let villageVantage = new slod.sgrid(slod.gworld, 2, 2);

	heightmap = new maps.scolormap('heightmap')
	buildingmap = new maps.scolormap('buildingmap')
	objectmap = new maps.scolormap('objectmap')
	colormap = new maps.scolormap('colormap')

	// wait for pngs to load
	setTimeout(start2, 1000);
}

function start2() {


	function factory<type extends supersobj>(type: { new(): type }, pos: vec2, hints = {}) {
		let obj = new type;
		obj.wpos = pos;
		slod.add(obj);
		return obj;
	}

	hooks.register('sectorCreate', (sector: slod.ssector) => {
		pts.func(sector.small, (pos) => {
			pos = pts.subtract(pos, [0, 0])
			let pixel = buildingmap.pixel(pos);
			if (pixel.is_color(colors.color_decidtree)) {
				factory(tree, pos);
				console.log('decid tree', pos);
			}
			else if (pixel.is_color(colors.color_deadtree)) {
				factory(tree, pos);
				console.log('dead tree', pos);
			}

			else if (pixel.is_color(colors.color_plywood_wall)) {
				factory(wall, pos);
			}
			else if (pixel.is_color(colors.color_overgrown_wall)) {
				factory(wall, pos);
			}
			else if (pixel.is_color(colors.color_door)) {
				factory(door, pos);
			}
		});
		return false;
	});

	hooks.register('sectorCreate', (sector: slod.ssector) => {
		pts.func(sector.small, (pos) => {
			let pixel = objectmap.pixel(pos);
			if (pixel.is_color(colors.color_acid_barrel)) {
				// factory(objects.acidbarrel, pixel, pos);
			}
			else if (pixel.is_color(colors.color_wall_chest)) {
				factory(crate, pos);
			}
			else if (pixel.is_color(colors.color_shelves)) {
				factory(shelves, pos);
			}
			else {
				//let chick = new chicken;
				//chick.wpos = pos;
				//slod.add(chick);
			}
		})
		return false;
	})

	let vendor = new pawn;
	//vendor.pawntype = 'trader';
	vendor.walkArea = new aabb2([38, 49], [41, 49]);
	vendor.dialogue = 2;
	vendor.wpos = [37.5, 48.5];
	vendor.subtype = 'trader';
	vendor.isTrader = true;
	vendor.inventory.add('scrap', -1);
	vendor.inventory.add('junk', -1);
	slod.add(vendor);

	//for (let i = 0; i < 0; i++) {
	let guard = new pawn;
	guard.wpos = [45, 56];
	//peacekeeper.outfit = []
	guard.dialogue = 3;
	guard.subtype = 'guard';
	guard.walkArea = new aabb2([43, 51], [46, 58]);
	slod.add(guard);
	//}

	let talker = new pawn;
	talker.wpos = [43.8, 61.2];
	//peacekeeper.outfit = []
	talker.dialogue = 4;
	talker.angle = Math.PI / 2;
	talker.subtype = 'civilian';
	talker.walkArea = new aabb2([43.5, 61.5], [45.5, 59.5]);
	slod.add(talker);


	for (let i = 0; i < 1; i++) {
		let shadowChicken = new chicken;
		shadowChicken.wpos = [42, 53];
		shadowChicken.walkArea = new aabb2([41, 54], [43, 51]);
		slod.add(shadowChicken);
	}
}

const tick_rate = 333;

var delta = tick_rate / 1000;

const wss = new WebSocketServer({
	port: 8080
});

export function send_message_to_all(message, duration) {
	for (let con of connections)
		con.messages.push([message, duration]);
}

class timer {
	time = 0
	constructor(seed: number) {
		this.time = Date.now() + seed;
	}
	started() {
		this.time > 0;
	}
	elapsed(elapsed: number) {
		return Date.now() - this.time > elapsed;
	}
}

class connection {
	you: player
	messages: [text: string, duration: number][] = []
	grid: slod.sgrid
	sendDelay = 0
	sentPlayer = false
	json: any
	constructor(public ws) {

		console.log('new connection');

		send_message_to_all("New player joins", 3);

		this.sendDelay = Date.now() + 1000;

		this.grid = new slod.sgrid(slod.gworld, 2, 2);

		this.you = new player;
		this.you.wpos = [44, 51];
		// this.you.impertinent = true;
		slod.add(this.you);

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
		slod.remove(this.you);
		this.you.finalize();
		if (this.you.freezingNpc)
			this.you.freezingNpc.frozenBy = undefined;
		send_message_to_all("A player disconnected", 3);
	}
	receive(json: any) {
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
				this.you.sector?.swap(this.you);
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
			const npc = slod.byId[json.interactingWith] as npc;
			if (npc) {
				this.you.freezingNpc = npc;
				npc.frozenBy = this.you;
			}
			else
				console.warn('cant talk to this entity');

		}
		if (json.wantToBuy) {
			console.log('player wants to buy', json.wantToBuy);
			let trader = this.you.freezingNpc as pawn;
			if (trader && trader.type == 'pawn') {
				if (trader.inventory.get(json.wantToBuy)) {
					trader.inventory.remove(json.wantToBuy);
					this.you.inventory.add(json.wantToBuy);
				}
			}
			else
				this.messages.push(['Not properly interacting with an NPC.', 2])
		}
		if (json.wantToSell) {
			console.log('player wants to sell', json.wantToSell);
			let trader = this.you.freezingNpc as pawn;
			if (trader && trader.type == 'pawn') {
				let tuple;
				if (tuple = this.you.inventory.get(json.wantToSell)) {
					this.you.inventory.remove(json.wantToSell);
					trader.inventory.add(json.wantToSell);
					console.log('after sell player has left', tuple[1]);
				}
			}
			else
				this.messages.push(['Not properly interacting with an NPC.', 2])
		}
		if (json.wantToGrab) {
			console.log('player wants to grab ', json.wantToGrab);
			const container = slod.byId[json.wantToGrab[0]] as container;
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
		const vec = colormap.pixel(pts.round(this.you.wpos)).vec;
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
			pos = pts.add(pos, [.5, .5]);
			slod.gworld.update_grid(this.grid, pos);
		}
	}
	gather() {
		let object: any = {};

		if (!this.sentPlayer) {
			this.sentPlayer = true;
			console.log('sending you-pawn id');

			object.playerId = this.you?.id;
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
	slod.ssector.tick_actives();
	for (let con of connections) {
		//con.process();
		con.update_grid();
		con.gather();
		//con.ws.send();
	}
	slod.ssector.unstamp_newlies();
	slod.stamp++;
};

const outfits: [head: string, body: string, arms: string, legs: string][] = [
	['#2f302e', '#414439', '#444139', '#3e3f38'], // default
	['#2c3136', '#3a3935', '#3a3935', '#35393a'], // blueish
	['#474348', '#454049', '#454049', '#484c4c'], // pink
]

class supersobj extends slod.sobj {
	isSuperSobj = true
	solid = true
	bound: aabb2
	size = 1
	constructor() {
		super();
	}
	override create() {
		//console.log('create supersobj', this.type);

		this.rebound();
	}
	rebound() {
		const size = this.size / 2;
		this.bound = new aabb2([-size, -size], [size, size]);
		this.bound.translate(this.wpos);
	}
	on_hit() {

	}
	shoot(angle) {
		let hits: supersobj[] = [];
		for (let sobj of slod.ssector.visibles) {
			if (sobj == this)
				continue;
			const cast = sobj as supersobj;
			if (cast.isSuperSobj) {
				cast.rebound();
				const test = cast.bound.ray(
					{
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
				let c = pts.distsimple(a.wpos, this.wpos);
				let d = pts.distsimple(b.wpos, this.wpos);
				return (c > d) ? 1 : -1;
			});
		}
		//for (let hit of hits)
		//	console.log('we hit', hit.type);
		if (hits.length) {
			hits[0].on_hit();
		}
	}
}

class wall extends supersobj {
	constructor() {
		super();
		this.type = 'wall';
		console.log('make wall');

	}
}

class door extends supersobj {
	constructor() {
		super();
		this.type = 'door';
	}
	override tick() {
		let open = false;
		const stack = this.sector!.stacked(this.wpos);
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
	static id = 0
	inventory: inventory
	ticksAgo = 0
	constructor() {
		super();
		this.id = 'container_' + container.id++;
		this.inventory = new inventory(this);
	}
	override tick() {
		this.ticksAgo++;
		if (this.ticksAgo == 20) {
			// console.log('tick container', 1, 2, 3);

			this.ticksAgo = 0;
		}
	}
	override gather(fully: boolean) {
		let upper = super.gather(fully) as any;
		if (fully || this.inventory.stamp == slod.stamp)
			upper.inventory = this.inventory.collect();
		return upper;
	}
}

class shelves extends container {
	constructor() {
		super();
		console.log('shelves', 1);

		this.type = 'shelves';
		this.id = 'shelves_' + container.id++;
		this.inventory.add('stuff', 5);
		if (Math.random() > .5)
			this.inventory.add('junk', 5);
	}
	/*override create() {
		this.rebound();
	}*/
}

class crate extends container {
	constructor() {
		super();
		console.log('crate', 1);

		this.type = 'crate';
		this.id = 'crate_' + container.id++;
		this.inventory.add('stuff', 5);
		if (Math.random() > .5)
			this.inventory.add('junk', 5);
	}
	/*override create() {
		this.rebound();
	}*/
}

class tree extends supersobj {
	static id = 0
	constructor() {
		super();
		this.type = 'tree';
		this.id = 'tree_' + tree.id++
	}
	/*override create() {
		this.rebound();
	}*/
}

// npc can be a chicken or a pawn
class npc extends supersobj {
	static id = 0;
	isNpc = true
	health = 100
	dead = false
	frozenBy?: slod.sobj
	angle = 0
	walkArea: aabb2
	aimTarget: vec2 = [0, 0]
	timer: timer
	speed = 1.0
	constructor() {
		super();
		this.id = 'npc_' + npc.id++;
		this.timer = new timer(0);
	}
	override on_hit() {
		if (this.dead)
			return;
		this.health -= 10;
		if (this.health <= 0) {
			this.dead = true;
			console.log('killed this npc');
			this.needs_update();
		}
	}
	wander() {
		if (!this.frozenBy && this.walkArea) {
			if (this.timer.elapsed(2000)) {
				const target = this.walkArea.random_point();
				this.aimTarget = pts.round(target);

				//this.wpos = target;
				this.timer = new timer(0);
			}
		}

		if (!this.frozenBy && pts.together(this.aimTarget)) {
			let angle = pts.angle(this.wpos, this.aimTarget);

			this.angle = -angle + Math.PI;

			let speed = this.speed * delta;

			this.needs_update();

			let x = speed * Math.sin(this.angle);
			let y = speed * Math.cos(this.angle);

			let venture = pts.add(this.wpos, [x, y]);
			this.wpos = venture;

			this.sector?.swap(this);

			this.rebound();

			const dist = pts.distsimple(this.wpos, this.aimTarget);
			if (dist < 0.2)
				this.aimTarget = [0, 0];
		}

		if (this.frozenBy) {
			if (pts.distsimple(this.frozenBy.wpos, this.wpos) > 1.0) {
				const player = this.frozenBy as player;
				player.freezingNpc = undefined;
				this.frozenBy = undefined;
				this.timer = new timer(0);
			}
		}
	}
	override tick() {
		this.wander();
	}
	override gather(fully: boolean) {
		let upper = super.gather(fully) as any;
		upper.angle = this.angle;
		if (this.dead)
			upper.dead = this.dead;
		return upper;
	}
}

class pawn extends npc {
	static id = 0
	inventory: inventory
	outfit: string[] = []
	subtype = ''
	dialogue = 0
	aiming = false
	isPlayer = false
	isTrader = false
	constructor() {
		super();
		this.type = 'pawn';
		this.id = 'pawn_' + pawn.id++;
		this.outfit = outfits[Math.floor(Math.random() * outfits.length)];

		this.inventory = new inventory(this);

	}
	override tick() {
		super.tick();
		//if (this.subtype == 'trader') {
		//this.inventory.wpos = this.wpos;
		// console.log('syncing inventory with pawn-npc');
		//}

	}
	override on_hit() {
		super.on_hit();
	}
	override gather(fully: boolean) {
		let upper = super.gather(fully) as any;
		if (fully) {
			console.log('pawn first');
			//console.log('outfit');
			upper.outfit = this.outfit;
			upper.dialogue = this.dialogue;
			upper.subtype = this.subtype;
		}
		if (this.aiming)
			upper.aiming = this.aiming;
		if (fully || this.inventory.stamp == slod.stamp) {
			//console.log('inventory needs an update');
			upper.inventory = this.inventory.collect();
		}
		return upper;
	}
}

class player extends pawn {
	receive: any
	freezingNpc?: npc
	constructor() {
		super();
		this.type = 'pawn';
		this.isPlayer = true;

		this.inventory.add('money', 10);

		this.inventory.add('bullet', 10);
		this.inventory.add('cork', 50);

		console.log('amount of cork:', this.inventory.amount('cork'));

	}
	override tick() {
		let bullets = this.inventory.get('bullet');

		this.inventory.remove('cork');
	}
	override create() {
		super.create();
	}
	override hide() {
		console.log('ply-pawn should be impertinent');
	}
	override gather(fully: boolean) {
		let upper = super.gather(fully) as any;
		if (fully)
			upper.isPlayer = true;
		return upper;
	}
	end() {

	}
}

class npc_pawn extends player {

}

class chicken extends npc {
	static id = 0
	walkAgain: timer
	peckChance = 0
	randomWalker
	pecking = false
	sitting = false
	constructor() {
		super();
		this.type = 'chicken';
		this.id = 'chicken_' + chicken.id++;
		this.randomWalker = Date.now();
		this.health = 10;
		this.speed = 0.75;
		this.size = 0.5;
		this.walkAgain = new timer(0);
	}
	override on_hit() {
		super.on_hit();

		if (this.dead) {
			this.pecking = false;
			this.sitting = false;
		}
	}
	override gather(fully: boolean) {
		let upper = super.gather(fully) as any;
		// slod.sobj.attach_truthy(upper, this.pecking);
		if (this.pecking)
			upper.pecking = this.pecking;
		if (this.sitting)
			upper.sitting = this.sitting;
		return upper;
	}
	override tick() {
		if (this.dead)
			return;

		if (pts.together(this.aimTarget) == 0) {
			if (!this.pecking && !this.sitting && this.walkAgain?.elapsed(5000)) {
				if (Math.random() > .25) {
					this.pecking = true;
					this.needs_update();
					this.walkAgain = new timer(0);
				}
				else {
					this.sitting = true;
					this.needs_update();
					this.walkAgain = new timer(0);
				}
			}
		}

		if (this.pecking && this.walkAgain?.elapsed(500)) {
			this.pecking = false;
			this.needs_update();
			this.walkAgain = new timer(0);
		}
		else if (this.sitting && this.walkAgain?.elapsed(6000)) {
			this.sitting = false;
			this.needs_update();
			this.walkAgain = new timer(0);
		}
		else if (!this.pecking && !this.sitting) {
			this.wander();
		}
		//this.pecking = false;
	}
	//override gather() {

	//}
}


start();

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