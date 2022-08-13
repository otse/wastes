import lod from "./lod";
import pawns from "./pawns";
import wastes from "./wastes";
import objects from "./objects";
import win from "./win";
import chickens from "./chickens";

export namespace client {

	export var sobjs: { [id: string]: lod.obj } = {}

	export var socket: WebSocket

	export var playerId = -1;

	export function tick() {
		for (let id in sobjs) {
			let obj = sobjs[id] as objects.objected;
			if (obj.type != 'you')
				obj.nettick();
		}
	}

	export function start() {

		socket = new WebSocket("ws://86.93.147.154:8080");

		socket.onopen = function (e) {
			//console.log("[open] Connection established");
			//console.log("Sending to server");
			//socket.send("My name is John");
		};

		function process_news<type extends objects.objected>(type: { new(): type }, typed: string, data: any, handle, update) {
			for (let sobj of data.news) {
				const { id } = sobj;
				if (sobj.type != typed)
					continue;
				let obj = sobjs[id];
				if (!obj) {
					console.log('new sobj', typed, id);
					obj = sobjs[id] = new type;
					handle(obj, sobj);
					lod.add(obj);
				}
				else if (obj) {		
					update(obj, sobj);
				}
			}
		}

		socket.onmessage = function (event) {
			const data = JSON.parse(event.data);

			if (data.removes && data.removes.length) {
				console.log('we have a remove', data.removes);
				for (let id of data.removes) {
					let obj = sobjs[id];
					delete sobjs[id];
					obj.hide();
					obj.finalize();
					lod.remove(obj);
				}
			}
			if (data.news) {
				process_news(pawns.pawn, 'pawn', data,
					(obj, sobj) => {
						const { wpos, angle, outfit } = sobj;
						obj.wpos = wpos;
						obj.angle = angle;
						obj.outfit = outfit;
					},
					(obj, sobj) => {
						if (obj.type == 'you')
							return;
						const { wpos, angle, aiming } = sobj;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.aiming = aiming;
						//obj.sector?.swap(obj);
					});

				process_news(chickens.chicken, 'chicken', data,
					(obj, sobj) => {
						const { wpos, angle } = sobj;
						obj.wpos = wpos;
						obj.angle = angle;
					},
					(obj, sobj) => {
						const { wpos, angle } = sobj;						
						obj.netwpos = wpos;
						obj.netangle = angle;
					});
			}

			if (data.player) {
				playerId = data.player.id;
				let pawn = sobjs[data.player.id];
				if (pawn) {
					pawns.you = pawn as pawns.pawn;
					pawn.type = 'you';
					console.log('we got our pawn', playerId);
					wastes.gview.center = pawn
				}
			}

			if (data.messages) {
				for (let message of data.messages) {
					win.message.message(message[0], message[1] * 1000);
				}
			}

		};

		setInterval(() => {
			if (pawns.you) {
				const json = { player: { wpos: pawns.you.wpos, angle: pawns.you.angle, aiming: pawns.you.aiming } };
				const string = JSON.stringify(json);
				socket.send(string);
			}

		}, 333);
	}
}