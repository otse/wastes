import { default as THREE, BoxGeometry } from "three";

import app from "./app";
import lod from "./lod";
import pts from "./pts";

import ren from './renderer';
import wastes, { pawns } from "./wastes";
import objects from "./objects";
import areas from "./areas";
import hooks from "./hooks";

namespace win {

	var win: HTMLElement;

	var toggle_character = false;

	export var mousingClickable = false;

	export var started = false;

	export function start() {
		started = true;

		win = document.getElementById('win') as HTMLElement;

		contextmenu.init();

	}

	export function tick() {
		if (!started)
			return;

		if (app.key('c') == 1) {
			toggle_character = !toggle_character;
			character.call(toggle_character);
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
	}

	class modal {
		element
		title
		content
		constructor(title?: string) {
			this.element = document.createElement('div') as HTMLElement
			this.element.className = 'modal';
			//this.element.append('inventory')

			if (title) {
				this.title = document.createElement('div');
				this.title.innerHTML = title;
				this.title.className = 'title';
				this.element.append(this.title);
			}
			this.content = document.createElement('div');
			this.content.className = 'content';
			this.content.innerHTML = 'content';
			this.element.append(this.content);

			win.append(this.element);

		}
		update(title?: string) {
			if (title)
				this.title.innerHTML = title;
		}
		reposition(pos = ['', '']) {
			this.element.style.top = pos[1];
			this.element.style.left = pos[0];
		}
		deletor() {
			this.element.remove();
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
			this.reposition([ren.screen[0] / 2 + pos[0] + '', ren.screen[1] / 2 - pos[1] + '']);
		}
	}

	export class character {
		static open = false
		static anchor: lod.obj
		static modal?: modal
		static call(open: boolean) {
			this.open = open;
			if (open && !this.modal) {
				this.modal = new modal('you',);
				this.modal.reposition(['100px', '30%']);

				this.modal.content.innerHTML = 'stats:<br />effectiveness: 100%<br /><hr>';
				this.modal.content.innerHTML += 'inventory:<br />';
				//inventory
				const inventory = pawns.you?.inventory;
				if (inventory) {
					for (let tuple of inventory.tuples) {
						let button = document.createElement('div');
						button.innerHTML = tuple[0];
						if (tuple[1] > 1) {
							button.innerHTML += ` <span>×${tuple[1]}</span>`
						}
						button.className = 'item';
						this.modal.content.append(button);
					}
				}
			}
			else if (!open && this.modal) {
				this.modal?.deletor();
				this.modal = undefined;
			}
		}
		static tick() {
			if (this.open) {
				this.modal?.float(pawns.you!, [15, 20]);
			}
		}
	}

	type speech = [text: string, follow: number]

	const dialogues: speech[][] = [
		[
			//['I spent some of my time sewing suits for wasters.', 3]
		],
		[
			[`I'm a trader.`, 1],
			[`It can be hazardous around here. The purple for example is contaminated soil.`, 2],
			[`Stay clear from the irradiated areas, marked by dead trees.`, -1],
		],
		[
			[`I'm a vendor of sifty town.`, 1],
			[`I trade in most forms of scraps.`, 2],
			[`.`, 3]
		]
	]

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
			if (!pawns.you.isActive()) {
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
		static focus?: objects.objected
		static focusCur?: lod.obj
		static modal?: modal
		static buttons: any = []
		static options: { options: [name: string, condition: () => boolean, action: () => any][] } = { options: [] }

		static reset() {
			this.buttons = []
			this.options.options = [];
		}
		static init() {
			hooks.register('viewMClick', (view) => {
				this.modal?.deletor();
				this.focus = undefined;
				return false;
			});

			hooks.register('viewRClick', (view) => {
				console.log('contextmenu on ?', this.focus);

				if (this.focus) {
					this.focus.setup_context();
					this.focusCur = this.focus;
					this.modal?.deletor();
					this.open();
				}
				else {
					this.modal?.deletor();
					this.focusCur = undefined;
				}

				return false;
			});
		}
		static destroy() {
			this.modal?.deletor();
			//this.focusCur = undefined;
		}
		static open() {
			this.modal = new modal(this.focus!.type);
			this.modal.content.innerHTML = '';
			this.modal.element.classList.add('contextmenu');

			for (let option of this.options.options) {
				let button = document.createElement('div');
				button.innerHTML = option[0] + "&nbsp;"
				//if (tuple[1] > 1) {
				//	button.innerHTML += ` <span>×${tuple[1]}</span>`
				//}
				button.className = 'option';
				button.onclick = (e) => {
					if (option[1]()) {
						this.modal?.deletor();
						mousingClickable = false;
						option[2]();
					}
				};
				button.onmouseover = () => { mousingClickable = true; }
				button.onmouseleave = () => { mousingClickable = false; }
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
			if (this.modal && this.focusCur) {
				this.update();
				this.modal.float(this.focusCur, [0, 10]);
			}

		}
	}

	export class dialogue {
		static talkingTo?: pawns.pawn
		static talkingToCur?: pawns.pawn
		static modal?: modal
		static where = [0, 0];
		static call_once() {
			if (this.talkingTo != this.talkingToCur) {
				this.modal?.deletor();
				this.modal = undefined;
				this.talkingToCur = undefined;
			}

			if (this.talkingTo && !this.modal) {
				this.talkingToCur = this.talkingTo;
				this.modal = new modal();
				this.where[1] = 0;
				this.change();
			}
		}
		static change() {
			const which = 1;

			this.modal!.content.innerHTML = this.talkingToCur!.dialog[this.where[1]][0] + "&nbsp;"

			const next = this.talkingToCur!.dialog[this.where[1]][1];

			if (next != -1) {
				let button = document.createElement('div');
				button.innerHTML = '>>'
				button.className = 'item';
				this.modal!.content.append(button);

				button.onclick = (e) => {
					console.log('woo');
					this.where[1] = next as number;
					mousingClickable = false;
					this.change();
					//button.remove();
				};
				button.onmouseover = () => { mousingClickable = true; }
				button.onmouseleave = () => { mousingClickable = false; }
			}
		}
		static tick() {
			if (this.modal && this.talkingToCur) {
				this.modal.float(this.talkingToCur, [0, 10]);
			}
			if (this.talkingToCur && pts.distsimple(pawns.you.wpos, this.talkingToCur.wpos) > 1) {
				this.talkingToCur = undefined;
				this.modal?.deletor();
				this.modal = undefined;
			}
		}
	}

	export class container {
		static crate?: objects.objected
		static crateCur?: objects.objected
	//static obj?: lod.obj
		static modal?: modal
		static call_once() {
			if (this.crate != this.crateCur) {
				this.modal?.deletor();
				this.modal = undefined;
				this.crateCur = undefined;
			}

			if (this.crate) {
				this.crateCur = this.crate;

				this.modal = new modal('container');
				this.modal.content.innerHTML = ''

				const cast = this.crate as objects.crate;

				for (let tuple of cast.container.tuples) {
					let button = document.createElement('div');
					button.innerHTML = tuple[0];
					if (tuple[1] > 1) {
						button.innerHTML += ` <span>×${tuple[1]}</span>`
					}
					button.className = 'item';
					this.modal.content.append(button);

					button.onclick = (e) => {
						console.log('woo');
						button.remove();
						cast.container.remove(tuple[0]);
						pawns.you?.inventory.add(tuple[0]);
					};

					//this.modal.content.innerHTML += item + '<br />';
				}
			}
		}
		/*static call(open: boolean, obj?: lod.obj, refresh = false) {
			//this.anchor = obj;
			if (!this.obj) {
				this.obj = new lod.obj;
				this.obj.size = [24, 40];
				this.obj.wpos = [38, 49];
			}

			if (open && !this.modal) {
				this.modal = new modal('container');
			}
			else if (!open && this.modal) {
				this.modal?.deletor();
				this.obj = undefined;
				this.modal = undefined;
			}

			if (this.modal && obj != this.obj) {
				if (obj) {
					this.obj = obj;
					this.modal.update(obj.type + ' contents');
				}
				this.modal.content.innerHTML = ''

				const cast = this.obj as objects.crate;
				for (let tuple of cast.container.tuples) {
					let button = document.createElement('div');
					button.innerHTML = tuple[0];
					if (tuple[1] > 1) {
						button.innerHTML += ` <span>×${tuple[1]}</span>`
					}
					button.className = 'item';
					this.modal.content.append(button);

					button.onclick = (e) => {
						console.log('woo');
						button.remove();
						cast.container.remove(tuple[0]);
						pawns.you?.inventory.add(tuple[0]);
					};

					//this.modal.content.innerHTML += item + '<br />';
				}
			}
		}*/
		static tick() {
			if (this.modal && this.crateCur) {
				this.modal.float(this.crateCur);
			}
			if (this.crateCur && pts.distsimple(pawns.you.wpos, this.crateCur.wpos) > 1) {
				this.crateCur = undefined;
				this.modal?.deletor();
				this.modal = undefined;
			}
		}
	}

	export class areatag {
		static call(open: boolean, area?: areas.area, refresh = false) {
			if (open) {
				console.log('boo');

				let element = document.createElement('div');
				element.className = 'area';
				element.innerHTML = ` ${area?.name || ''} `;
				win.append(element);
				setTimeout(() => {
					element.classList.add('fade');
					setTimeout(() => {
						element.remove();
					}, 3000)
				}, 1000)
			}
		}
	}

}

export default win;