import lod from "./lod";
import pawns from "./pawns";

export namespace client {

	export var pawnsId: { [id: string]: pawns.pawn } = {}

	export var socket: WebSocket

	export function start() {
		socket = new WebSocket("ws://localhost:8080");

		socket.onopen = function (e) {
			//console.log("[open] Connection established");
			//console.log("Sending to server");
			//socket.send("My name is John");
		};

		socket.onmessage = function (event) {
			const string = event.data;
			const data = JSON.parse(string);
			console.log(`received from server`, data);

			if (Array.isArray(data)) {
				const packages = data as any[];
				for (let sobj of packages) {
					if (sobj.type == 'pawn') {
						let pawn = pawnsId[sobj.id];
						if (!pawn) {
							console.log('make a pawn');
							
							let pawn = pawnsId[sobj.id] = new pawns.pawn();
							pawn.wpos = sobj.wpos;
							pawn.angle = sobj.angle;
							lod.add(pawn);
						}
						else
						{
							pawn.wpos = sobj.wpos;
							pawn.angle = sobj.angle;
						}
					}

				}
			}
		};

		setInterval(() => {
			const json = { player: { wpos: pawns.you.wpos, angle: pawns.you.angle } };
			const string = JSON.stringify(json);
			socket.send(string);

		}, 333);
	}
}