import lod from "./lod";
import pawns from "./pawns";
import wastes from "./wastes";

export namespace client {

	export var pawnsId: { [id: string]: pawns.pawn } = {}

	export var socket: WebSocket

	export var playerId = -1;

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
			//console.log(`received from server`, data);

			if (data.player) {
				const id = data.player.id.split('_')[1];
				console.log('got our player sent', id);
				playerId = id;
				wastes.gview.center.wpos = data.player.wpos;
			}
			if (data.removes && data.removes.length) {
				console.log('we have a remove', data.removes);

				for (let idString of data.removes) {
					const split = idString.split('_');
					
					if (split[0] == 'pawn') {
						let pawn = pawnsId[idString];
						delete pawnsId[idString];
						pawn.hide();
						pawn.finalize();
						lod.remove(pawn);
					}
				}
			}
			if (data.news) {
				//console.log('got news');
				
				for (let sobj of data.news) {
					const id = sobj.id.split('_')[1];

					if (sobj.type == 'pawn') {
						let pawn = pawnsId[sobj.id];
						
						if (!pawn) {
							pawn = pawnsId[sobj.id] = new pawns.pawn();
							console.log('new pawn ', sobj.id);

							if (id == playerId) {
								pawns.you = pawn;
								pawn.type = 'you';
								console.log('we got our pawn');
							}

							pawn.wpos = sobj.wpos;
							pawn.angle = sobj.angle;
							pawn.sector?.swap(pawn);

							lod.add(pawn);
						}
						if (pawn && pawn.type != 'you') {
							pawn.wpos = sobj.wpos;
							pawn.angle = sobj.angle;
							pawn.sector?.swap(pawn);
						}
					}

				}
			}

		};

		setInterval(() => {
			if (pawns.you) {
				const json = { player: { wpos: pawns.you.wpos, angle: pawns.you.angle } };
				const string = JSON.stringify(json);
				socket.send(string);
			}

		}, 333);
	}
}