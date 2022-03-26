import { default as THREE, BoxGeometry } from "three";

import app from "./app";
import lod from "./lod";
import pts from "./pts";
import pawns from "./pawn";

import ren from './renderer';
import wastes from "./wastes";
import objects from "./objects";

namespace win {

	var win: HTMLElement;

	var toggle_character = false;

	export var started = false;

	export function start() {
		started = true;

		win = document.getElementById('win') as HTMLElement;

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

		character.tick();
		container.tick();
	}

	class modal {
		element
		title
		content
		constructor(name = 'modal') {
			this.element = document.createElement('div') as HTMLElement
			this.element.className = 'modal';
			//this.element.append('inventory')

			this.title = document.createElement('div');
			this.title.innerHTML = name;
			this.title.className = 'title';
			this.element.append(this.title);

			this.content = document.createElement('div');
			this.content.className = 'content';
			this.content.innerHTML = 'content';
			this.element.append(this.content);

		}
		update(name = 'modal') {
			this.title.innerHTML = name;
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
				win.append(this.modal.element)
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

	export class container {
		static obj?: lod.obj
		static modal?: modal
		static call(open: boolean, obj?: lod.obj, refresh = false) {
			//this.anchor = obj;
			if (!this.obj) {
				this.obj = new lod.obj;
				this.obj.size = [24, 40];
				this.obj.wpos = [38, 49];
			}

			if (open && !this.modal) {
				this.modal = new modal();
				win.append(this.modal.element)
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
		}
		static tick() {
			if (this.modal && this.obj) {
				this.modal.float(this.obj);
			}
		}
	}
}

export default win;