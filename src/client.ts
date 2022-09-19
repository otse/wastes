import lod from "./lod";
import pawns from "./objects/pawns";
import wastes from "./wastes";
import objects from "./objects/objects";
import win from "./win";
import chickens from "./objects/chickens";
import dialogues from "./dialogue";
import zombies from "./objects/zombies";
import { superobject } from "./objects/superobject";

export namespace client {

	export var objsId: { [id: string]: lod.obj } = {}

	export var socket: WebSocket

	export var plyId = -1;

	export var rates: [item: string, buy: number, sell: number][] = []
	export var prices: [item: string, value: number][] = []

	export function get_rate(item: string) {
		for (const rate of rates)
			if (rate[0] == item)
				return rate;
		return ['', 1, 1];
	}

	export var interactingWith = 0
	export var wantToBuy = ''
	export var wantToSell = ''
	export var wantToGrab = ''

	export var tradeWithId = 0;

	export function tick() {
		for (let id in objsId) {
			let obj = objsId[id] as superobject;
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

		type sobj = [random: any, id: number, wpos: vec2, angle: number, type?: string]
		type news = sobj[];

		function process_news<type extends superobject>(
			type: { new(): type },
			target: string,
			data: any,
			handle,
			update) {

			for (let sobj of data.news as news) {
				let [,id,,,type2] = sobj;
				let obj = objsId[id];
				if (obj)
					type2 = obj.type;
				if (type2 == 'you')
					type2 = 'pawn';
				if (type2 != target)
					continue;
				//if (expected == 'chicken')
				//	console.log('chikn', sobj);

				if (!obj) {
					// console.log('new sobj', typed, id);
					obj = objsId[id] = new type;
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
				// console.log('we have removes', data.removes);
				for (let id of data.removes) {
					let obj = objsId[id];
					if (!obj)
						continue;
					console.log('remove', obj.type);

					if (id == plyId) {
						// prevent self-destruct by moving too fast
						console.error(' you are probably going too fast ');
						continue;
					}
					obj.hide();
					obj.finalize();
					lod.remove(obj);
					delete objsId[id];
				}
			}
			if (data.news) {
				for (let sobj of data.news) {
					//if (sobj.type == 'tree')
					//console.log('got a server tree');
				}

				process_news(pawns.pawn, 'pawn', data,
					(obj: pawns.pawn, sobj: sobj) => {
						console.log('news pawn');
						const [random,, wpos, angle] = sobj;
						obj.wpos = wpos;
						obj.angle = angle;
						obj.netangle = angle;
						obj.dead = random.dead;
						obj.wielding = random.wielding;
						if (random.title)
							obj.title = random.title;
						if (random.examine)
							obj.examine = random.examine;
						obj.aiming = random.aiming;
						obj.netwpos = wpos;
						// new should always have angle
						if (!random.outfit)
							console.error('no outfit for new pawn?');
						if (random.outfit) {
							obj.outfit = random.outfit;
						}
						obj.subtype = random.subtype;
						if (random.dialogue)
							obj.dialogue = dialogues[random.dialogue];
						obj.isPlayer = random.isPlayer;
						obj.inventory = random.inventory;
					},
					(obj, sobj) => {
						//console.log('update pawn');
						const [random,, wpos, angle] = sobj;
						if (obj.type != 'you') {
							obj.netwpos = wpos;
							obj.netangle = angle;
							obj.aiming = random.aiming;
						}
						obj.dead = random.dead;
						if (random.inventory) {
							console.log('update inventory');
							obj.inventory = random.inventory;
						}
					});

				process_news(chickens.chicken, 'chicken', data,
					(obj, sobj: sobj) => {
						const [random,, wpos, angle] = sobj;
						obj.wpos = wpos;
						obj.netwpos = wpos;
						obj.angle = angle;
						obj.netangle = angle;
						// todo net angle ?
						obj.sitting = random.sitting;
						if (random.title)
							obj.title = random.title;
						if (random.examine)
							obj.examine = random.examine;
						obj.dead = random.dead;
					},
					(obj, sobj) => {
						const [random,, wpos, angle] = sobj;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.pecking = random.pecking;
						obj.sitting = random.sitting;
						obj.dead = random.dead;
						// console.log('updating chicken!');
					});

				process_news(zombies.zombie, 'zombie', data,
					(obj, sobj) => {
						const [random,, wpos, angle] = sobj;
						obj.wpos = wpos;
						obj.angle = angle;
						obj.dead = random.dead;
						if (random.title)
							obj.title = random.title;
						if (random.examine)
							obj.examine = random.examine;
					},
					(obj, sobj) => {
						const [random,, wpos, angle] = sobj;
						obj.netwpos = wpos;
						obj.netangle = angle;
						obj.dead = random.dead;
						// console.log('updating chicken!');
					});

				process_news(objects.crate, 'crate', data,
					(obj, sobj: sobj) => {
						const [random,, wpos] = sobj;
						obj.wpos = wpos;
						obj.inventory = random.inventory;
						console.error('a new crate!');
					},
					(obj, sobj) => {
						const [random] = sobj;
						if (random.inventory)
							obj.inventory = random.inventory;
						// console.log('updating chicken!');
					});

				process_news(objects.shelves, 'shelves', data,
					(obj, sobj) => {
						const [random,, wpos] = sobj;
						obj.wpos = wpos;
						obj.inventory = random.inventory;
					},
					(obj, sobj) => {
						const [random] = sobj;
						if (random.inventory)
							obj.inventory = random.inventory;
						// console.log('updating chicken!');
					});
			}

			if (data.playerId) {
				plyId = data.playerId;
				let pawn = objsId[plyId];
				if (pawn) {
					console.log('  got you pawn  ', plyId);
					pawns.you = pawn as pawns.pawn;
					pawn.type = 'you';
					wastes.gview.center = pawn;
				}
			}

			if (data.rates) {
				client.rates = data.rates;
				console.log('got rates');
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
				if (interactingWith) {
					json.interactingWith = interactingWith;
					interactingWith = 0;
				}
				if (wantToBuy) {
					json.wantToBuy = wantToBuy;
					wantToBuy = '';
				}
				if (wantToSell) {
					json.wantToSell = wantToSell;
					wantToSell = '';
				}
				if (wantToGrab) {
					json.wantToGrab = wantToGrab;
					wantToGrab = '';
				}
				if (tradeWithId) {
					json.tradeWithId = tradeWithId;
					tradeWithId = 0;
				}
				const string = JSON.stringify(json);
				socket.send(string);
			}

		}, 333);
	}
}

export default client;