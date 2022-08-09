import { WebSocketServer } from 'ws';

import pts from "../src/pts"
import aabb2 from "../src/aabb2"
import slod from "./slod"
import { send } from 'process';

var cons: conn[] = [];

pts.abs([0, 0]);

function start() {

}

const tick_rate = 333;

new slod.sworld(10);

const wss = new WebSocketServer({
	port: 8080
});

class conn {
	you: pawn
	ourwpos: vec2 = [44, 52]
	grid: slod.sgrid
	sentPlayer = false
	constructor(public ws) {
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
		slod.remove(this.you!);
		this.you.finalize();
	}
	receive(json: any) {
		if (json.player) {
			if (this.you) {
				this.you.wpos = json.player.wpos;
				this.you.angle = json.player.angle;
				this.you.sector?.swap(this.you);
			}
		}
	}
	update_grid() {
		if (this.you)
			slod.gworld.update_grid(this.grid, this.you.wpos);
	}
	gather() {
		let object: any = {};

		if (!this.sentPlayer) {
			this.sentPlayer = true;
			console.log('sending you-pawn');

			object.player = this.you?.gather();
		}

		object.news = this.grid.gather();
		object.removes = this.grid.removes;
		this.grid.removes = [];

		const string = JSON.stringify(object);

		this.ws.send(string);
	}
}

const loop = () => {
	slod.ssector.tick();
	for (let con of cons) {
		con.update_grid();
		con.gather();
		//con.ws.send();
	}
};

class pawn extends slod.sobj {
	angle = 0
	static id = 0
	constructor() {
		super();
		this.id = 'pawn_' + pawn.id++;
		this.type = 'pawn';
	}
	override create() {

	}
	override hide() {
		console.log('ply-pawn should be impertinent');
	}
	override gather() {
		return { id: this.id, type: this.type, wpos: this.wpos, angle: this.angle };
	}
}

setInterval(loop, tick_rate);

wss.on('connection', function connection(ws) {

	let con = new conn(ws);
	cons.push(con);

	ws.on('message', function message(data) {

		const json = JSON.parse(data);

		con.receive(json);

		//console.log('received: %s', data);

	});

	ws.on('close', function message() {
		console.log('closing');
		con.close();
		let i = cons.indexOf(con);
		cons.splice(i, 1);
	});


	//ws.send('something');
});