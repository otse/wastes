import lod from "./lod";
import pawns from "./pawns";
import wastes from "./wastes";
import objects from "./objects";
import win from "./win";
import chickens from "./chickens";
import dialogues from "./dialogue";

export namespace client {

	export var sObjsId: { [id: string]: lod.obj } = {}

	export var socket: WebSocket

	export var plyId = -1;

	export var talkingToId = ''

	export function tick() {
		for (let id in sObjsId) {
			let obj = sObjsId[id] as objects.objected;
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

		function process_news<type extends objects.objected>(
			type: { new(): type }, typed: string, data: any, handle, update) {
			for (let sobj of data.news) {
				const { id } = sobj;
				if (sobj.type != typed)
					continue;
				let obj = sObjsId[id];
				if (!obj) {
					console.log('new sobj', typed, id);
					obj = sObjsId[id] = new type;
					obj.id = id;
					obj.networked = true;
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
					let obj = sObjsId[id];
					if (!obj)
						continue;
					if (id == plyId)
						// prevent self-destruct by moving too fast
						continue;
					obj.hide();
					obj.finalize();
					lod.remove(obj);
					delete sObjsId[id];
				}
			}
			if (data.news) {
				for (let sobj of data.news) {
					if (sobj.type == 'tree')
						console.log('got a server tree');
				}
				process_news(pawns.pawn, 'pawn', data,
					(obj, sobj) => {
						const { wpos, angle, outfit, dialogue, aiming, isPlayer } = sobj;
						obj.wpos = wpos;
						obj.angle = angle;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.outfit = outfit;
						if (dialogue)
							obj.dialogue = dialogues[dialogue];
						obj.aiming = aiming;
						obj.isPlayer = isPlayer;
					},
					(obj, sobj) => {
						if (obj.type == 'you')
							return;
						const { wpos, angle, aiming } = sobj;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.aiming = aiming;
					});

				process_news(chickens.chicken, 'chicken', data,
					(obj, sobj) => {
						const { id, wpos, angle, sitting } = sobj;
						obj.id = id;
						obj.wpos = wpos;
						obj.angle = angle;
						obj.sitting = sitting;
					},
					(obj, sobj) => {
						const { wpos, angle, pecking, sitting } = sobj;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.pecking = pecking;
						obj.sitting = sitting;
						// console.log('updating chicken!');
					});
			}

			if (data.playerId) {
				plyId = data.playerId;
				let pawn = sObjsId[plyId];
				if (pawn) {
					console.log('  got you pawn  ', plyId);
					pawns.you = pawn as pawns.pawn;
					pawn.type = 'you';
					wastes.gview.center = pawn;
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
				let json: any = {
					player:
					{
						wpos: pawns.you.wpos,
						angle: pawns.you.angle,
						aiming: pawns.you.aiming,
						shoot: pawns.you.shoot
					}
				};
				pawns.you.shoot = false;
				if (talkingToId) {
					json.talkingToId = talkingToId;
					talkingToId = '';
				}
				const string = JSON.stringify(json);
				socket.send(string);
			}

		}, 333);
	}
}