import lod from "./lod";
import pawns from "./objects/pawns";
import wastes from "./wastes";
import objects from "./objects/objects";
import win from "./win";
import chickens from "./objects/chickens";
import dialogues from "./dialogue";
import zombies from "./objects/zombies";
export var client;
(function (client) {
    client.objsId = {};
    client.plyId = -1;
    client.rates = [];
    client.prices = [];
    function get_rate(item) {
        for (const rate of client.rates)
            if (rate[0] == item)
                return rate;
        return ['', 1, 1];
    }
    client.get_rate = get_rate;
    client.interactingWith = 0;
    client.wantToBuy = '';
    client.wantToSell = '';
    client.wantToGrab = '';
    client.tradeWithId = 0;
    function tick() {
        for (let id in client.objsId) {
            let obj = client.objsId[id];
            if (obj.type != 'you')
                obj.nettick();
        }
    }
    client.tick = tick;
    function start() {
        client.socket = new WebSocket("ws://86.93.147.154:8080");
        client.socket.onopen = function (e) {
            //console.log("[open] Connection established");
            //console.log("Sending to server");
            //socket.send("My name is John");
        };
        function process_news(type, target, data, handle, update) {
            for (let sobj of data.news) {
                let [, id, , , type2] = sobj;
                let obj = client.objsId[id];
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
                    obj = client.objsId[id] = new type;
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
        client.socket.onmessage = function (event) {
            const data = JSON.parse(event.data);
            if (data.removes && data.removes.length) {
                // console.log('we have removes', data.removes);
                for (let id of data.removes) {
                    let obj = client.objsId[id];
                    if (!obj)
                        continue;
                    console.log('remove', obj.type);
                    if (id == client.plyId) {
                        // prevent self-destruct by moving too fast
                        console.error(' you are probably going too fast ');
                        continue;
                    }
                    obj.hide();
                    obj.finalize();
                    lod.remove(obj);
                    delete client.objsId[id];
                }
            }
            if (data.news) {
                for (let sobj of data.news) {
                    //if (sobj.type == 'tree')
                    //console.log('got a server tree');
                }
                process_news(pawns.pawn, 'pawn', data, (obj, sobj) => {
                    console.log('news pawn');
                    const [random, , wpos, angle] = sobj;
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
                }, (obj, sobj) => {
                    //console.log('update pawn');
                    const [random, , wpos, angle] = sobj;
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
                process_news(chickens.chicken, 'chicken', data, (obj, sobj) => {
                    const [random, , wpos, angle] = sobj;
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
                }, (obj, sobj) => {
                    const [random, , wpos, angle] = sobj;
                    obj.netwpos = wpos;
                    obj.netangle = angle;
                    obj.pecking = random.pecking;
                    obj.sitting = random.sitting;
                    obj.dead = random.dead;
                    // console.log('updating chicken!');
                });
                process_news(zombies.zombie, 'zombie', data, (obj, sobj) => {
                    const [random, , wpos, angle] = sobj;
                    obj.wpos = wpos;
                    obj.angle = angle;
                    obj.dead = random.dead;
                    if (random.title)
                        obj.title = random.title;
                    if (random.examine)
                        obj.examine = random.examine;
                }, (obj, sobj) => {
                    const [random, , wpos, angle] = sobj;
                    obj.netwpos = wpos;
                    obj.netangle = angle;
                    obj.dead = random.dead;
                    // console.log('updating chicken!');
                });
                process_news(objects.crate, 'crate', data, (obj, sobj) => {
                    const [random, , wpos] = sobj;
                    obj.wpos = wpos;
                    obj.inventory = random.inventory;
                    console.error('a new crate!');
                }, (obj, sobj) => {
                    const [random] = sobj;
                    if (random.inventory)
                        obj.inventory = random.inventory;
                    // console.log('updating chicken!');
                });
                process_news(objects.shelves, 'shelves', data, (obj, sobj) => {
                    const [random, , wpos] = sobj;
                    obj.wpos = wpos;
                    obj.inventory = random.inventory;
                }, (obj, sobj) => {
                    const [random] = sobj;
                    if (random.inventory)
                        obj.inventory = random.inventory;
                    // console.log('updating chicken!');
                });
            }
            if (data.playerId) {
                client.plyId = data.playerId;
                let pawn = client.objsId[client.plyId];
                if (pawn) {
                    console.log('  got you pawn  ', client.plyId);
                    pawns.you = pawn;
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
                let json = {
                    player: {
                        wpos: pawns.you.wpos,
                        angle: pawns.you.angle,
                        aiming: pawns.you.aiming,
                        shoot: pawns.you.shoot
                    }
                };
                pawns.you.shoot = false;
                if (client.interactingWith) {
                    json.interactingWith = client.interactingWith;
                    client.interactingWith = 0;
                }
                if (client.wantToBuy) {
                    json.wantToBuy = client.wantToBuy;
                    client.wantToBuy = '';
                }
                if (client.wantToSell) {
                    json.wantToSell = client.wantToSell;
                    client.wantToSell = '';
                }
                if (client.wantToGrab) {
                    json.wantToGrab = client.wantToGrab;
                    client.wantToGrab = '';
                }
                if (client.tradeWithId) {
                    json.tradeWithId = client.tradeWithId;
                    client.tradeWithId = 0;
                }
                const string = JSON.stringify(json);
                client.socket.send(string);
            }
        }, 333);
    }
    client.start = start;
})(client || (client = {}));
export default client;
