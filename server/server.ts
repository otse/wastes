import { WebSocketServer } from 'ws';
//import { send } from 'process';

import pts from "../src/pts"
import aabb2 from "../src/aabb2"
import slod from "./slod"
import { timeStamp } from 'console';
import maps from './maps';
import hooks from '../src/hooks';

var connections: connection[] = [];

var heightmap: maps.scolormap
var buildingmap: maps.scolormap
var colormap: maps.scolormap

const color_decidtree: vec3 = [20, 70, 20];
const color_deadtree: vec3 = [60, 70, 60];

function start() {

	new slod.sworld();

	heightmap = new maps.scolormap('heightmap')
	buildingmap = new maps.scolormap('buildingmap')
	colormap = new maps.scolormap('colormap')

	function factory<type extends supersobj>(type: { new(): type }, pos, hints = {}) {
		let obj = new type;
		obj.wpos = pos;
		slod.add(obj);
		return obj;
	}

	hooks.register('SSectorCreate', (sector: slod.ssector) => {
		pts.func(sector.small, (pos) => {
			pos = pts.subtract(pos, [0, 0])
			let pixel = buildingmap.pixel(pos);
			if (pixel.is_color(color_decidtree)) {
				factory(tree, pos);
				console.log('decid tree', pos);
			}
			else if (pixel.is_color(color_deadtree)) {
				factory(tree, pos);
				console.log('dead tree', pos);
			}
		});
		return false;
	});

	let peacekeeper = new pawn;
	peacekeeper.wpos = [45, 56];
	//peacekeeper.outfit = []
	peacekeeper.walkArea = new aabb2([43, 51], [46, 58]);
	slod.add(peacekeeper);

	let shadowChicken = new chicken;
	shadowChicken.wpos = [42, 53];
	shadowChicken.walkArea = new aabb2([41, 54], [43, 51]);
	slod.add(shadowChicken);
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
	constructor(public ws) {

		console.log('new connection');

		send_message_to_all("New player joins", 3);

		this.sendDelay = Date.now() + 1000;

		this.grid = new slod.sgrid(slod.gworld, 1, 1);

		this.you = new player;
		this.you.wpos = [44, 52];
		this.you.impertinent = true;
		slod.add(this.you);
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
		if (json.player) {
			if (this.you) {
				this.you.wpos = json.player.wpos;
				this.you.angle = json.player.angle;
				this.you.aiming = json.player.aiming;
				this.you.sector?.swap(this.you);
			}
		}
		if (json.player.shoot) {
			this.you.shoot(this.you.angle);
		}
		if (json.talkingToId) {
			console.log('player is talking to pawn', json.talkingToId);
			const npc = slod.byId[json.talkingToId] as npc;
			if (npc) {
				this.you.freezingNpc = npc;
				npc.frozenBy = this.you;
			}
			else
				console.warn('cant talk to this entity');

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

		//if (this.sendDelay - Date.now() <= 0) {
		if (!this.sentPlayer) {
			this.sentPlayer = true;
			console.log('sending you-pawn');

			object.player = this.you?.gather();
		}
		//}

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
		con.update_grid();
		con.gather();
		//con.ws.send();
	}
};

const outfits: [string, string, string, string][] = [
	['#444139', '#444139', '#484c4c', '#31362c'],
	['#484847', '#484847', '#44443f', '#2c3136']
]

class supersobj extends slod.sobj {
	isSuperSobj = true
	bound: aabb2
	constructor() {
		super();
	}
	override create() {
		//console.log('create supersobj', this.type);
		
		this.rebound();
	}
	rebound() {
		this.bound = new aabb2([-.5, -.5], [.5, .5]);
		this.bound.translate(this.wpos);
	}
	onhit() {
		
	}
	shoot(angle) {
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
					console.log('we hit something', cast.type);
					cast.onhit();
				}
			}
		}
	}
}

class tree extends supersobj {
	constructor() {
		super();
		this.type = 'tree';
	}
	/*override create() {
		this.rebound();
	}*/
}

class npc extends supersobj {
	static id = 0;
	isNpc = true
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
				this.frozenBy = undefined;
				this.timer = new timer(0);
			}
		}
	}
	override tick() {
		this.wander();
	}
	override gather() {
		return {
			id: this.id,
			type: this.type,
			wpos: this.wpos,
			angle: this.angle
		};
	}
}

class pawn extends npc {
	static id = 0
	outfit: string[] = []
	aiming = false
	isPlayer = false
	constructor() {
		super();
		this.type = 'pawn';
		this.id = 'pawn_' + pawn.id++;
		this.outfit = outfits[Math.floor(Math.random() * outfits.length)];
	}
	override gather() {
		let upper = super.gather();
		return {
			...upper,
			outfit: this.outfit,
			aiming: this.aiming
		};
	}
}

class player extends pawn {
	freezingNpc?: npc
	constructor() {
		super();
		this.type = 'pawn';
		this.isPlayer = true;
	}
	override tick() {
	}
	override create() {
		super.create();
	}
	override hide() {
		console.log('ply-pawn should be impertinent');
	}
	override gather() {
		let upper = super.gather();
		return {
			...upper,
			isPlayer: true
		};
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
		this.speed = 0.75;
		this.walkAgain = new timer(0);
	}
	gather() {
		let upper = super.gather();
		return {
			...upper,
			pecking: this.pecking,
			sitting: this.sitting
		};
	}
	override tick() {
		if (pts.together(this.aimTarget) == 0) {
			if (!this.pecking && !this.sitting && this.walkAgain?.elapsed(5000)) {
				if (Math.random() > .25) {
					this.pecking = true;
					this.walkAgain = new timer(0);
				}
				else {
					this.sitting = true;
					this.walkAgain = new timer(0);
				}
			}
		}

		if (this.pecking && this.walkAgain?.elapsed(500)) {
			this.pecking = false;
			this.walkAgain = new timer(0);
		}
		else if (this.sitting && this.walkAgain?.elapsed(6000)) {
			this.sitting = false;
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