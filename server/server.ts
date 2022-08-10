import { WebSocketServer } from 'ws';
//import { send } from 'process';

import pts from "../src/pts"
import aabb2 from "../src/aabb2"
import slod from "./slod"

var connections: connection[] = [];

function start() {

	let peacekeeper = new npc;
	peacekeeper.wpos = [45.5, 56.5];
	//peacekeeper.outfit = []
	peacekeeper.walkArea = new aabb2([43, 51], [46, 57]);
	slod.add(peacekeeper);

}

const tick_rate = 333;

new slod.sworld();

const wss = new WebSocketServer({
	port: 8080
});

class connection {
	you: pawn
	ourwpos: vec2 = [44, 52]
	grid: slod.sgrid
	sendDelay = 0
	sentPlayer = false
	constructor(public ws) {
		this.sendDelay = Date.now() + 1000;

		this.grid = new slod.sgrid(slod.gworld, 2, 2);

		this.you = new pawn;
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
		this.you.sector?.hard_remove(this.you);
		slod.remove(this.you);
		this.you.finalize();
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
		object.removes = this.grid.removes;
		this.grid.removes = [];

		const string = JSON.stringify(object);

		this.ws.send(string);
	}
}

const loop = () => {
	slod.ssector.tick_all();
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

class pawn extends slod.sobj {
	static id = 0
	angle = 0
	aiming = false
	outfit: string[] = []
	constructor() {
		super();
		this.id = 'pawn_' + pawn.id++;
		this.type = 'pawn';
		this.outfit = outfits[Math.floor(Math.random() * outfits.length)];
	}
	override tick() {
	}
	override create() {

	}
	override hide() {
		console.log('ply-pawn should be impertinent');
	}
	override gather() {
		return {
			id: this.id,
			type: this.type,
			wpos: this.wpos,
			angle: this.angle,
			outfit: this.outfit,
			aiming: this.aiming
		};
	}
}

class npc extends pawn {
	isNpc = true
	walkArea: aabb2
	aimTarget: vec2 = [0, 0]
	randomWalker
	constructor() {
		super();

		this.randomWalker = Date.now();
	}
	override tick() {
		if (this.walkArea) {
			if (this.randomWalker - Date.now() <= 0) {
				const target = this.walkArea.random_point();
				this.aimTarget = target;

				//this.wpos = target;
				this.randomWalker = Date.now() + 2000;
			}
		}

		if (pts.together(this.aimTarget)) {
			let angle = pts.angle(this.wpos, this.aimTarget);

			this.angle = -angle + Math.PI;

			let speed = 0.5;

			let x = speed * Math.sin(this.angle);
			let y = speed * Math.cos(this.angle);

			let venture = pts.add(this.wpos, [x, y]);
			this.wpos = venture;

			const dist = pts.distsimple(this.wpos, this.aimTarget);
			if (dist < 0.5)
				this.aimTarget = [0, 0];
		}
	}
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