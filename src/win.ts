import { default as THREE, BoxGeometry } from "three";

import app from "./app";
import lod from "./lod";
import pts from "./pts";

import ren from './renderer';
import wastes, { pawns } from "./wastes";
import objects from "./objects/objects";
import areas from "./areas";
import hooks from "./hooks";
import { client } from "./client";
import { hovering_sprites } from "./sprite";
import { superobject } from "./objects/superobject";
import glob from "./glob";

namespace win {

	var win: HTMLElement;

	var toggle_character = false;

	export var started = false;

	export var checks

	export function start() {
		started = true;

		glob.hovering = 0;

		win = document.getElementById('win') as HTMLElement;

		contextmenu.init();
		container.init();
		trader.init();
		dialogue.init();

		glob.is_hovering = is_hovering;

		setTimeout(() => {
			//message.message("Welcome", 1000);
		}, 1000);

	}

	export function tick() {
		if (!started)
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
			character.modal?.checker(event);
			container.modal?.checker(event);
			trader.modal?.checker(event);
			dialogue.modal?.checker(event);
			contextmenu.modal?.checker(event);
			descriptor.modal?.checker(event);
		}
	}

	export function is_hovering() {
		return character.modal?.hovering ||
			container.modal?.hovering ||
			trader.modal?.hovering ||
			dialogue.modal?.hovering ||
			contextmenu.modal?.hovering ||
			descriptor.modal?.hovering;
	}

	class modal {
		element
		title
		content
		hovering
		polyfill: any[] = []
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
		constructor(title?: string) {
			this.element = document.createElement('div') as HTMLElement
			this.element.className = 'modal';

			if (app.mobile) {
			}
			else {
				this.element.onmouseover = () => { this.hovering = true; document.querySelectorAll('.stats')[0].innerHTML = 'mouse over' }
				this.element.onmouseleave = () => { this.hovering = false; document.querySelectorAll('.stats')[0].innerHTML = 'mouse leave' }
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
		update(title?: string) {
			if (title)
				this.title.innerHTML = title;
		}
		reposition(pos: vec2) {
			const round = pts.floor(pos);
			this.element.style.top = round[1];
			this.element.style.left = round[0];
		}
		deletor() {
			this.element.remove();
			if (this.hovering)
				glob.hovering--;
		}
		float(anchor: lod.obj, add: vec2 = [0, 0]) {

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

	export class trader {
		static tradeWith?: lod.obj
		static tradeWithCur?: lod.obj
		static secondContent
		static traderInventoryElement?
		static yourInventoryElement?
		static traderLayout?
		static traderStamp = 0
		static yourStamp = 0
		static modal?: modal
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
			this.modal?.deletor();
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
				this.modal = new modal('Trader',);
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
			if (!this.traderInventoryElement) {
				this.traderInventoryElement = document.createElement('div');
				this.modal?.polyfill.push(this.traderInventoryElement);
				this.traderInventoryElement.className = 'inventory';
				this.traderInventoryElement.style.width = '50%';
				this.traderLayout.append(this.traderInventoryElement);
			}
			let pawn = this.tradeWithCur as pawns.pawn;

			const inventory = pawn.inventory!;

			if (inventory && this.traderStamp != inventory.stamp || force) {
				console.log('refresh trader inven');

				this.traderInventoryElement.innerHTML = ``;

				for (let tuple of inventory.tuples) {
					if (tuple[0] == 'money')
						continue;
					let button = document.createElement('div');
					this.modal?.polyfill.push(button);
					//button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
					button.innerHTML += tuple[0];
					button.className = 'item';
					if (tuple[1] > 1) {
						button.innerHTML += ` <span>×${tuple[1]}</span>`
					}
					button.onclick = () => {
						client.wantToBuy = tuple[0];
					}

					let extra = document.createElement('span');
					button.append(extra);

					const rate = client.get_rate(tuple[0]);
					let buy = rate[1];
					extra.innerHTML = `&nbsp; - ${buy}ct`;
					this.modal?.polyfill.push(extra);

					this.traderInventoryElement.append(button);

					this.traderStamp = inventory.stamp;
				}
			}
		}
		static render_your_inventory(force) {
			if (!this.yourInventoryElement) {
				this.yourInventoryElement = document.createElement('div');
				this.modal?.polyfill.push(this.yourInventoryElement);
				this.yourInventoryElement.className = 'inventory';
				this.yourInventoryElement.style.width = '50%';
				this.traderLayout.append(this.yourInventoryElement);
			}
			let you = pawns.you;

			const inventory = you.inventory!;

			if (inventory && this.yourStamp != inventory.stamp || force) {
				this.yourInventoryElement.innerHTML = ``;

				for (let tuple of inventory.tuples) {
					if (tuple[0] == 'money')
						continue;
					let button = document.createElement('div');
					this.modal?.polyfill.push(button);
					//button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
					button.innerHTML += tuple[0];
					button.className = 'item';
					if (tuple[1] > 1) {
						button.innerHTML += ` <span>×${tuple[1]}</span>`
					}
					button.onclick = () => {
						client.wantToSell = tuple[0];
					}

					let extra = document.createElement('span');
					this.modal?.polyfill.push(extra);
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
				this.modal.float(this.tradeWithCur!, [0, 0]);
				this.render_trader_inventory(false);
				this.render_your_inventory(false);
			}
		}
	}

	export class character {
		static open = false
		static anchor: lod.obj
		static modal?: modal
		static inventoryElement
		static inventoryStamp = 0
		static render_inventory(force) {

			if (!this.inventoryElement) {
				this.inventoryElement = document.createElement('div');
				this.inventoryElement.className = 'inventory';
				this.modal?.content.append(character.inventoryElement);
			}
			const inventory = pawns.you!.inventory;

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
						button.innerHTML += ` <span>×${tuple[1]}</span>`
					}
					button.className = 'item';
					this.inventoryElement.append(button);

					this.inventoryStamp = inventory.stamp;
				}
			}
		}
		static call_once(open: boolean) {
			this.open = open;
			if (open && !this.modal) {
				this.modal = new modal('you',);
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
				this.modal?.deletor();
				this.modal = undefined;
				this.inventoryElement = undefined;
			}
		}
		static tick() {
			if (this.open) {
				this.modal?.float(pawns.you!, [15, 20]);
				this.render_inventory(false);
			}
		}
	}

	export class you {
		static modal?: modal
		static call(open: boolean) {
			if (open && !this.modal) {
				this.modal = new modal('you');
				this.modal.element.classList.add('you');
				this.modal.content.remove();
			}
			else if (!open && this.modal) {
				this.modal?.deletor();
				this.modal = undefined;
			}
		}
		static tick() {
			if (pawns.you && !pawns.you.isActive()) {
				this.call(true);
				this.modal!.float(pawns.you, [-5, 5]);
				console.log('call and float');

			}
			else {
				this.call(false);
			}
		}
	}

	export class contextmenu {
		static focus?: superobject
		static focusCur?: lod.obj
		static modal?: modal
		static buttons: any = []
		static options: { options: [name: string, condition: () => boolean, action: () => any][] } = { options: [] }

		static reset() {
			this.buttons = []
			this.options.options = [];
		}
		static end_close_others() {
			trader.end();
			dialogue.end();
		}
		static end() {
			this.modal?.deletor();
			this.modal = undefined;
			this.focusCur = undefined;
		}
		static init() {
			hooks.register('viewMClick', (view) => {
				this.modal?.deletor();
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
					this.focus = hovering_sprites.sprites[0].vars.binded as superobject;

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
					this.focus!.superobject_setup_context_menu();
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
			this.modal?.deletor();
			//this.focusCur = undefined;
		}
		static call_once() {
			this.end_close_others();

			this.modal = new modal(this.focus!.title);
			this.modal.content.innerHTML = '';
			this.modal.element.classList.add('contextmenu');

			for (let option of this.options.options) {
				let button = document.createElement('div');
				this.modal.polyfill.push(button);
				button.innerHTML = option[0] + "&nbsp;"
				//if (tuple[1] > 1) {
				//	button.innerHTML += ` <span>×${tuple[1]}</span>`
				//}
				button.className = 'option';
				const lambda = (e) => {
					if (option[1]()) {
						this.modal?.deletor();
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

	export class descriptor {
		static focus?: lod.obj
		static focusCur?: lod.obj
		static modal?: modal
		static timer = 0
		static call_once(text: string = 'Examined') {
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
			if (this.modal !== undefined) {
				this.modal.float(this.focusCur!, [0, 0]);
			}
			if (Date.now() - this.timer > 4 * 1000) {
				this.modal?.deletor();
				this.modal = undefined;
			}
		}
	}

	export class dialogue {
		static talkingTo?: pawns.pawn
		static talkingToCur?: pawns.pawn
		static modal?: modal
		static where = 0;
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
			this.modal?.deletor();
			this.modal = undefined;
			this.talkingToCur = undefined;
		}
		static change() {
			const which = 1;

			this.modal!.content.innerHTML = ''; // reset

			let pawnImage = document.createElement('div');
			this.modal?.polyfill.push(pawnImage);

			pawnImage.className = 'pawnimage';
			this.modal!.content.append(pawnImage);

			let textArea = document.createElement('div');
			this.modal?.polyfill.push(textArea);

			if (this.talkingToCur!.dialogue[this.where])
				textArea.innerHTML = this.talkingToCur!.dialogue[this.where] + "&nbsp;";
			this.modal!.content.append(textArea);

			//const next = this.talkingToCur!.dialogue[this.where[1]][1];
			const next = this.talkingToCur!.dialogue[this.where + 1];
			if (next) {
				let button = document.createElement('div');
				this.modal?.polyfill.push(button);

				button.innerHTML = '>>'
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

	export class container {
		static focus?: superobject
		static focusCur?: superobject
		//static obj?: lod.obj
		static stamp = 0
		static modal?: modal
		static inventoryElement?
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
			this.modal?.deletor();
			this.modal = undefined;
			this.focusCur = undefined;
			this.inventoryElement = undefined;
		}
		static update_inventory_view(force) {
			if (!this.modal)
				return;

			if (!this.inventoryElement) {
				this.inventoryElement = document.createElement('div');
				this.modal.polyfill.push(this.inventoryElement);
				this.inventoryElement.className = 'inventory';
				this.modal.content.append(this.inventoryElement);
			}

			const cast = this.focus as objects.crate;
			const inventory = cast.inventory;

			if (this.stamp != inventory.stamp || force) {
				this.stamp = inventory.stamp;

				this.inventoryElement.innerHTML = ``;

				for (let tuple of inventory.tuples) {
					let item = document.createElement('div');
					this.modal?.polyfill.push(item);

					item.innerHTML = tuple[0];
					if (tuple[1] > 1) {
						item.innerHTML += ` <span>×${tuple[1]}</span>`;
					}
					item.className = 'item';
					this.inventoryElement.append(item);

					item.onclick = (e) => {
						console.log('clicked');
						client.wantToGrab = [cast.id, tuple[0]] as any;
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
				this.modal.content.innerHTML = ''

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

	export class areatag {
		static element
		static tag?: areas.area
		static tagCur?: areas.area
		static call_step() {
			if (this.tag != this.tagCur) {
				if (this.element)
					this.element.remove();
				this.tagCur = this.tag;
				this.element = document.createElement('div');
				this.element.className = 'area';
				this.element.innerHTML = ` ${this.tagCur?.name || ''} `;
				win.append(this.element);
				// remove the current element after 2s
				const element = this.element;
				setTimeout(() => {
					element.classList.add('fade');
					setTimeout(() => {
						element.remove();
					}, 2000)
				}, 2000)
			}

		}
	}

	interface imessage {

	}

	export class message {
		duration = 5
		static messages: any[] = []
		static message(message: string, duration: number) {
			this.messages.push({ message: message, duration: duration });
		}
		static tick() {
			if (this.messages.length) {
				let shift = this.messages.shift();

				let element = document.createElement('div');
				element.className = 'message';
				element.innerHTML = shift.message;

				document.getElementById('messages')!.append(element);

				setTimeout(() => {
					element.classList.add('fade');
				}, shift.duration);

				setTimeout(() => {
					element.remove();
				}, shift.duration + 2000);
			}
		}
	}

}

export default win;