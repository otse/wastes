import app from "./app";
import pts from "./pts";
import ren from './renderer';
import wastes, { pawns } from "./wastes";
import hooks from "./hooks";
import { client } from "./client";
import { hovering_sprites } from "./sprite";
import glob from "./glob";
var win;
(function (win_1) {
    var win;
    var toggle_character = false;
    win_1.started = false;
    function start() {
        win_1.started = true;
        glob.hovering = 0;
        win = document.getElementById('win');
        contextmenu.init();
        container.init();
        trader.init();
        dialogue.init();
        glob.is_hovering = is_hovering;
        setTimeout(() => {
            //message.message("Welcome", 1000);
        }, 1000);
    }
    win_1.start = start;
    function tick() {
        if (!win_1.started)
            return;
        if (app.key('c') == 1) {
            toggle_character = !toggle_character;
            character.call_once(toggle_character);
        }
        if (app.key('b') == 1) {
            //toggle_container = !toggle_container;
            //container.toggle(null, toggle_container);
        }
        you.tick();
        character.tick();
        container.tick();
        dialogue.tick();
        contextmenu.tick();
        message.tick();
        descriptor.tick();
        trader.tick();
        glob.win_propagate_events = (event) => {
            var _a, _b, _c, _d, _e, _f;
            (_a = character.modal) === null || _a === void 0 ? void 0 : _a.checker(event);
            (_b = container.modal) === null || _b === void 0 ? void 0 : _b.checker(event);
            (_c = trader.modal) === null || _c === void 0 ? void 0 : _c.checker(event);
            (_d = dialogue.modal) === null || _d === void 0 ? void 0 : _d.checker(event);
            (_e = contextmenu.modal) === null || _e === void 0 ? void 0 : _e.checker(event);
            (_f = descriptor.modal) === null || _f === void 0 ? void 0 : _f.checker(event);
        };
    }
    win_1.tick = tick;
    function is_hovering() {
        var _a, _b, _c, _d, _e, _f;
        return ((_a = character.modal) === null || _a === void 0 ? void 0 : _a.hovering) ||
            ((_b = container.modal) === null || _b === void 0 ? void 0 : _b.hovering) ||
            ((_c = trader.modal) === null || _c === void 0 ? void 0 : _c.hovering) ||
            ((_d = dialogue.modal) === null || _d === void 0 ? void 0 : _d.hovering) ||
            ((_e = contextmenu.modal) === null || _e === void 0 ? void 0 : _e.hovering) ||
            ((_f = descriptor.modal) === null || _f === void 0 ? void 0 : _f.hovering);
    }
    win_1.is_hovering = is_hovering;
    class modal {
        checker(event) {
            var touch = event;
            let hovering = false;
            for (let element of this.polyfill) {
                if (element == document.elementFromPoint(touch.pageX, touch.pageY)) {
                    hovering = true;
                    break;
                }
            }
            this.hovering = hovering;
        }
        constructor(title) {
            this.polyfill = [];
            this.element = document.createElement('div');
            this.element.className = 'modal';
            if (app.mobile) {
            }
            else {
                this.element.onmouseover = () => { this.hovering = true; document.querySelectorAll('.stats')[0].innerHTML = 'mouse over'; };
                this.element.onmouseleave = () => { this.hovering = false; document.querySelectorAll('.stats')[0].innerHTML = 'mouse leave'; };
            }
            if (title) {
                this.title = document.createElement('div');
                this.title.innerHTML = title;
                this.title.className = 'title';
                this.polyfill.push(this.title);
                this.element.append(this.title);
            }
            this.content = document.createElement('div');
            this.polyfill.push(this.content);
            this.content.className = 'content';
            this.content.innerHTML = 'content';
            this.element.append(this.content);
            win.append(this.element);
        }
        update(title) {
            if (title)
                this.title.innerHTML = title;
        }
        reposition(pos) {
            const round = pts.floor(pos);
            this.element.style.top = round[1];
            this.element.style.left = round[0];
        }
        deletor() {
            this.element.remove();
            if (this.hovering)
                glob.hovering--;
        }
        float(anchor, add = [0, 0]) {
            //let pos = this.anchor.rtospos([-1.5, 2.5]);
            let pos = anchor.rtospos();
            pos = pts.add(pos, add);
            pos = pts.add(pos, pts.divide(anchor.size, 2));
            //pos = pts.add(pos, this.anchor.size);
            //let pos = this.anchor.aabbScreen.center();
            //let pos = lod.project(wastes.gview.mwpos);
            pos = pts.subtract(pos, wastes.gview.rpos);
            pos = pts.divide(pos, wastes.gview.zoom);
            pos = pts.divide(pos, ren.ndpi);
            //pos = pts.add(pos, pts.divide(ren.screenCorrected, 2));
            //pos[1] -= ren.screenCorrected[1] / 2;
            this.reposition([ren.screen[0] / 2 + pos[0], ren.screen[1] / 2 - pos[1]]);
        }
    }
    class trader {
        static hover_money_label_here() {
        }
        static init() {
            hooks.register('viewRClick', (view) => {
                // We right click outsideis
                if (trader.modal && !trader.modal.hovering) {
                    trader.end();
                }
                return false;
                return false;
            });
        }
        static end() {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
            this.modal = undefined;
            this.tradeWithCur = undefined;
            this.traderInventoryElement = undefined;
            this.yourInventoryElement = undefined;
        }
        static call_once() {
            if (this.tradeWith && this.tradeWithCur != this.tradeWith) {
                trader.end();
            }
            if (!this.modal) {
                this.modal = new modal('Trader');
                this.modal.element.classList.add('trader');
                this.modal.content.innerHTML = `<div style="width: 50%;">Buy:</div><div style="width: 50%;">Sell:</div>`;
                this.modal.content.classList.add('trader');
                this.traderLayout = document.createElement('div');
                this.traderLayout.className = 'trader layout';
                this.modal.content.append(this.traderLayout);
                this.tradeWithCur = this.tradeWith;
                this.render_trader_inventory(true);
                //let next = document.createElement('span');
                //next.innerHTML += '<hr>sell:<br />';
                //this.modal.content.append(next);
                this.render_your_inventory(true);
            }
        }
        static render_trader_inventory(force) {
            var _a, _b, _c;
            if (!this.traderInventoryElement) {
                this.traderInventoryElement = document.createElement('div');
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.polyfill.push(this.traderInventoryElement);
                this.traderInventoryElement.className = 'inventory';
                this.traderInventoryElement.style.width = '50%';
                this.traderLayout.append(this.traderInventoryElement);
            }
            let pawn = this.tradeWithCur;
            const inventory = pawn.inventory;
            if (inventory && this.traderStamp != inventory.stamp || force) {
                console.log('refresh trader inven');
                this.traderInventoryElement.innerHTML = ``;
                for (let tuple of inventory.tuples) {
                    if (tuple[0] == 'money')
                        continue;
                    let button = document.createElement('div');
                    (_b = this.modal) === null || _b === void 0 ? void 0 : _b.polyfill.push(button);
                    //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                    button.innerHTML += tuple[0];
                    button.className = 'item';
                    if (tuple[1] > 1) {
                        button.innerHTML += ` <span>×${tuple[1]}</span>`;
                    }
                    button.onclick = () => {
                        client.wantToBuy = tuple[0];
                    };
                    let extra = document.createElement('span');
                    button.append(extra);
                    const rate = client.get_rate(tuple[0]);
                    let buy = rate[1];
                    extra.innerHTML = `&nbsp; - ${buy}ct`;
                    (_c = this.modal) === null || _c === void 0 ? void 0 : _c.polyfill.push(extra);
                    this.traderInventoryElement.append(button);
                    this.traderStamp = inventory.stamp;
                }
            }
        }
        static render_your_inventory(force) {
            var _a, _b, _c;
            if (!this.yourInventoryElement) {
                this.yourInventoryElement = document.createElement('div');
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.polyfill.push(this.yourInventoryElement);
                this.yourInventoryElement.className = 'inventory';
                this.yourInventoryElement.style.width = '50%';
                this.traderLayout.append(this.yourInventoryElement);
            }
            let you = pawns.you;
            const inventory = you.inventory;
            if (inventory && this.yourStamp != inventory.stamp || force) {
                this.yourInventoryElement.innerHTML = ``;
                for (let tuple of inventory.tuples) {
                    if (tuple[0] == 'money')
                        continue;
                    let button = document.createElement('div');
                    (_b = this.modal) === null || _b === void 0 ? void 0 : _b.polyfill.push(button);
                    //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                    button.innerHTML += tuple[0];
                    button.className = 'item';
                    if (tuple[1] > 1) {
                        button.innerHTML += ` <span>×${tuple[1]}</span>`;
                    }
                    button.onclick = () => {
                        client.wantToSell = tuple[0];
                    };
                    let extra = document.createElement('span');
                    (_c = this.modal) === null || _c === void 0 ? void 0 : _c.polyfill.push(extra);
                    button.append(extra);
                    const rate = client.get_rate(tuple[0]);
                    let sell = rate[2];
                    extra.innerHTML = `&nbsp; - ${sell}ct`;
                    this.yourInventoryElement.append(button);
                    this.yourStamp = inventory.stamp;
                }
                let money = 0;
                for (let tuple of inventory.tuples)
                    if (tuple[0] == 'money') {
                        money = tuple[1];
                        break;
                    }
                let next = document.createElement('div');
                next.innerHTML += `your money: ${money} ct<br />`;
                this.yourInventoryElement.append(next);
            }
        }
        static tick() {
            if (this.tradeWithCur && pts.distsimple(this.tradeWithCur.wpos, pawns.you.wpos) > 1) {
                trader.end();
            }
            if (this.modal) {
                this.modal.float(this.tradeWithCur, [0, 0]);
                this.render_trader_inventory(false);
                this.render_your_inventory(false);
            }
        }
    }
    trader.traderStamp = 0;
    trader.yourStamp = 0;
    win_1.trader = trader;
    class character {
        static render_inventory(force) {
            var _a;
            if (!this.inventoryElement) {
                this.inventoryElement = document.createElement('div');
                this.inventoryElement.className = 'inventory';
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.content.append(character.inventoryElement);
            }
            const inventory = pawns.you.inventory;
            if (!inventory)
                return;
            if (inventory && this.inventoryStamp != inventory.stamp || force) {
                this.inventoryElement.innerHTML = ``;
                console.log('yes', inventory.tuples);
                //console.log(inventory);
                for (let tuple of inventory.tuples) {
                    let button = document.createElement('div');
                    //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                    button.innerHTML += tuple[0];
                    if (tuple[1] > 1) {
                        button.innerHTML += ` <span>×${tuple[1]}</span>`;
                    }
                    button.className = 'item';
                    this.inventoryElement.append(button);
                    this.inventoryStamp = inventory.stamp;
                }
            }
        }
        static call_once(open) {
            var _a;
            this.open = open;
            if (open && !this.modal) {
                this.modal = new modal('you');
                //this.modal.reposition(['100px', '30%']);
                this.modal.content.innerHTML = 'stats:<br />effectiveness: 100%<br /><hr>';
                this.modal.content.innerHTML += 'inventory:<br />';
                //inventory
                this.render_inventory(true);
                let next = document.createElement('p');
                next.innerHTML += '<hr>guns:<br />';
                if (pawns.you.gun)
                    next.innerHTML += `<img class="gun" src="tex/guns/${pawns.you.gun.name}.png">`;
                this.modal.content.append(next);
            }
            else if (!open && this.modal) {
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.inventoryElement = undefined;
            }
        }
        static tick() {
            var _a;
            if (this.open) {
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.float(pawns.you, [15, 20]);
                this.render_inventory(false);
            }
        }
    }
    character.open = false;
    character.inventoryStamp = 0;
    win_1.character = character;
    class you {
        static call(open) {
            var _a;
            if (open && !this.modal) {
                this.modal = new modal('you');
                this.modal.element.classList.add('you');
                this.modal.content.remove();
            }
            else if (!open && this.modal) {
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
            }
        }
        static tick() {
            if (pawns.you && !pawns.you.isActive()) {
                this.call(true);
                this.modal.float(pawns.you, [-5, 5]);
                console.log('call and float');
            }
            else {
                this.call(false);
            }
        }
    }
    win_1.you = you;
    class contextmenu {
        static reset() {
            this.buttons = [];
            this.options.options = [];
        }
        static end_close_others() {
            trader.end();
            dialogue.end();
        }
        static end() {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
            this.modal = undefined;
            this.focusCur = undefined;
        }
        static init() {
            hooks.register('viewMClick', (view) => {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.focus = undefined;
                return false;
            });
            hooks.register('viewRClick', (view) => {
                console.log('contextmenu on ?', this.focus);
                if (!hovering_sprites.sprites.length)
                    this.focus = undefined;
                console.log('we got hovering sprites', hovering_sprites.sprites.length);
                hovering_sprites.sort_closest_to_mouse();
                if (hovering_sprites.sprites.length)
                    this.focus = hovering_sprites.sprites[0].vars.binded;
                // We are hovering an existing modal and right-clicking it (added for mobile)
                if (this.focusCur && this.modal && this.modal.hovering) {
                    return false;
                }
                // We have a focus, but no window! This is the easiest scenario.
                else if (this.focus && !this.modal) {
                    this.focus.superobject_setup_context_menu();
                    this.focusCur = this.focus;
                    this.call_once();
                }
                // We click away from any sprites and we have a menu open: break it
                else if (!this.focus && this.modal) {
                    contextmenu.end();
                }
                // We clicked on the already focussed sprite: break it
                else if (this.modal && this.focus && this.focus == this.focusCur) {
                    contextmenu.end();
                }
                // We have an open modal, but focus on a different sprite: recreate it
                else if (this.modal && this.focus && this.focus != this.focusCur) {
                    this.end();
                    this.focus.superobject_setup_context_menu();
                    this.focusCur = this.focus;
                    this.call_once();
                }
                //else {
                //	this.modal?.deletor();
                //	this.focusCur = undefined;
                //}
                return false;
            });
        }
        static destroy() {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
            //this.focusCur = undefined;
        }
        static call_once() {
            this.end_close_others();
            this.modal = new modal(this.focus.title);
            this.modal.content.innerHTML = '';
            this.modal.element.classList.add('contextmenu');
            for (let option of this.options.options) {
                let button = document.createElement('div');
                this.modal.polyfill.push(button);
                button.innerHTML = option[0] + "&nbsp;";
                //if (tuple[1] > 1) {
                //	button.innerHTML += ` <span>×${tuple[1]}</span>`
                //}
                button.className = 'option';
                const lambda = (e) => {
                    var _a;
                    if (option[1]()) {
                        (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                        this.modal = undefined;
                        option[2]();
                    }
                };
                button.onclick = lambda;
                //button.ontouchend = lambda;
                this.modal.content.append(button);
                this.buttons.push([button, option]);
            }
        }
        static update() {
            //console.log('focusCur', this.focusCur);
            for (let button of this.buttons) {
                const element = button[0];
                const option = button[1];
                if (!option[1]()) {
                    element.classList.add('disabled');
                }
                else {
                    element.classList.remove('disabled');
                }
            }
        }
        static tick() {
            //for (let hover of hoveringSprites) {
            //	
            //}
            if (this.modal && this.focusCur) {
                this.update();
                this.modal.float(this.focusCur, [0, 0]);
            }
        }
    }
    contextmenu.buttons = [];
    contextmenu.options = { options: [] };
    win_1.contextmenu = contextmenu;
    class descriptor {
        static call_once(text = 'Examined') {
            if (this.modal !== undefined) {
                this.modal.deletor();
                this.modal = undefined;
            }
            if (this.modal == undefined) {
                this.modal = new modal('descriptor');
                this.modal.title.remove();
                //this.modal.content.remove();
                this.modal.content.innerHTML = text;
                this.focusCur = this.focus;
                this.timer = Date.now();
            }
        }
        static tick() {
            var _a;
            if (this.modal !== undefined) {
                this.modal.float(this.focusCur, [0, 0]);
            }
            if (Date.now() - this.timer > 4 * 1000) {
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
            }
        }
    }
    descriptor.timer = 0;
    win_1.descriptor = descriptor;
    class dialogue {
        static init() {
            hooks.register('viewRClick', (view) => {
                // We right clickd outside
                if (dialogue.modal && !dialogue.modal.hovering)
                    dialogue.end();
                return false;
            });
        }
        static call_once() {
            // We wish to talk to a different pawn
            if (this.talkingTo != this.talkingToCur) {
                this.end();
            }
            if (this.talkingTo && !this.modal) {
                this.talkingToCur = this.talkingTo;
                this.modal = new modal();
                this.where = 0;
                this.change();
            }
        }
        static end() {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
            this.modal = undefined;
            this.talkingToCur = undefined;
        }
        static change() {
            var _a, _b, _c;
            const which = 1;
            this.modal.content.innerHTML = ''; // reset
            let pawnImage = document.createElement('div');
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.polyfill.push(pawnImage);
            pawnImage.className = 'pawnimage';
            this.modal.content.append(pawnImage);
            let textArea = document.createElement('div');
            (_b = this.modal) === null || _b === void 0 ? void 0 : _b.polyfill.push(textArea);
            if (this.talkingToCur.dialogue[this.where])
                textArea.innerHTML = this.talkingToCur.dialogue[this.where] + "&nbsp;";
            this.modal.content.append(textArea);
            //const next = this.talkingToCur!.dialogue[this.where[1]][1];
            const next = this.talkingToCur.dialogue[this.where + 1];
            if (next) {
                let button = document.createElement('div');
                (_c = this.modal) === null || _c === void 0 ? void 0 : _c.polyfill.push(button);
                button.innerHTML = '>>';
                button.className = 'button';
                textArea.append(button);
                button.onclick = (e) => {
                    console.log('woo');
                    this.where++;
                    this.change();
                    //button.remove();
                };
            }
        }
        static tick() {
            if (this.modal && this.talkingToCur) {
                this.modal.float(this.talkingToCur, [0, 10]);
            }
            if (this.talkingToCur && pts.distsimple(pawns.you.wpos, this.talkingToCur.wpos) > 1) {
                this.end();
            }
        }
    }
    dialogue.where = 0;
    win_1.dialogue = dialogue;
    class container {
        static init() {
            hooks.register('viewRClick', (view) => {
                // We right clickd outside
                if (container.modal && !container.modal.hovering) {
                    container.end();
                }
                return false;
            });
        }
        static end() {
            var _a;
            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
            this.modal = undefined;
            this.focusCur = undefined;
            this.inventoryElement = undefined;
        }
        static update_inventory_view(force) {
            var _a;
            if (!this.modal)
                return;
            if (!this.inventoryElement) {
                this.inventoryElement = document.createElement('div');
                this.modal.polyfill.push(this.inventoryElement);
                this.inventoryElement.className = 'inventory';
                this.modal.content.append(this.inventoryElement);
            }
            const cast = this.focus;
            const inventory = cast.inventory;
            if (this.stamp != inventory.stamp || force) {
                this.stamp = inventory.stamp;
                this.inventoryElement.innerHTML = ``;
                for (let tuple of inventory.tuples) {
                    let item = document.createElement('div');
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.polyfill.push(item);
                    item.innerHTML = tuple[0];
                    if (tuple[1] > 1) {
                        item.innerHTML += ` <span>×${tuple[1]}</span>`;
                    }
                    item.className = 'item';
                    this.inventoryElement.append(item);
                    item.onclick = (e) => {
                        console.log('clicked');
                        client.wantToGrab = [cast.id, tuple[0]];
                        //cast.inventory.remove(tuple[0]);
                        //pawns.you?.inventory.add(tuple[0]);
                    };
                    //item.onmouseover = () => { hoveringClickableElement = true; }
                    //item.onmouseleave = () => { hoveringClickableElement = false; }
                    //this.modal.content.innerHTML += item + '<br />';
                }
            }
        }
        static call_once() {
            // We are trying to open a different container
            if (this.modal !== undefined) {
                this.end();
            }
            if (this.focus) {
                this.focusCur = this.focus;
                this.modal = new modal('Container');
                this.modal.content.innerHTML = '';
                this.update_inventory_view(true);
            }
        }
        static tick() {
            if (this.modal && this.focusCur) {
                this.modal.float(this.focusCur);
                this.update_inventory_view(false);
            }
            if (this.focusCur && pts.distsimple(pawns.you.wpos, this.focusCur.wpos) > 1) {
                this.end();
            }
        }
    }
    //static obj?: lod.obj
    container.stamp = 0;
    win_1.container = container;
    class areatag {
        static call_step() {
            var _a;
            if (this.tag != this.tagCur) {
                if (this.element)
                    this.element.remove();
                this.tagCur = this.tag;
                this.element = document.createElement('div');
                this.element.className = 'area';
                this.element.innerHTML = ` ${((_a = this.tagCur) === null || _a === void 0 ? void 0 : _a.name) || ''} `;
                win.append(this.element);
                // remove the current element after 2s
                const element = this.element;
                setTimeout(() => {
                    element.classList.add('fade');
                    setTimeout(() => {
                        element.remove();
                    }, 2000);
                }, 2000);
            }
        }
    }
    win_1.areatag = areatag;
    class message {
        constructor() {
            this.duration = 5;
        }
        static message(message, duration) {
            this.messages.push({ message: message, duration: duration });
        }
        static tick() {
            if (this.messages.length) {
                let shift = this.messages.shift();
                let element = document.createElement('div');
                element.className = 'message';
                element.innerHTML = shift.message;
                document.getElementById('messages').append(element);
                setTimeout(() => {
                    element.classList.add('fade');
                }, shift.duration);
                setTimeout(() => {
                    element.remove();
                }, shift.duration + 2000);
            }
        }
    }
    message.messages = [];
    win_1.message = message;
})(win || (win = {}));
export default win;
