import { WebSocketServer } from 'ws';

import pts from "../src/pts"
import aabb2 from "../src/aabb2"
import slod from "./slod"
import { send } from 'process';

var cons: conn[] = [];

pts.abs([0, 0]);

function start() {

}

new slod.sworld(10);

const wss = new WebSocketServer({
	port: 8080
});

class conn {
	you: pawn
	ourwpos: vec2 = [44, 52]
	grid: slod.sgrid
	constructor(public ws) {
		this.you = new pawn;
		this.you.impertinent = true;

		slod.add(this.you);

		this.grid = new slod.sgrid(slod.gworld, 1, 1);
	}
	close() {
		this.grid.outside = -1;
		this.grid.offs();
		this.you.hide();
		slod.remove(this.you);
	}
	receive(json: any) {
		if (json.player) {
			this.you.wpos = json.player.wpos;
			this.you.angle = json.player.angle;
			this.you.sector?.swap(this.you);
		}
	}
	update_grid() {
		slod.gworld.update_grid(this.grid, this.you.wpos);
	}
	gather() {
		let packages = this.grid.gather();
		const string = JSON.stringify(packages);
		console.log('sending', packages);

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
		this.id = 'pawn' + pawn.id++;
		this.type = 'pawn';
	}
	override create() {

	}
	override hide() {
		console.log('ply-pawn should be impertinent');
	}
	override package() {
		return { id: this.id, type: this.type, wpos: this.wpos, angle: this.angle };
	}
}

setInterval(loop, 333);

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