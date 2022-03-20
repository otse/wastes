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
	var toggle_container = false;

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
			character.toggle(toggle_character);
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
			this.element.append(this.title);

			this.content = document.createElement('div');
			this.content.innerHTML = 'content';
			this.element.append(this.content);

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
		static modal: modal
		static toggle(open) {
			this.open = open;
			if (this.open) {
				this.modal = new modal('you',);
				this.modal.reposition(['100px', '30%']);
				win.append(this.modal.element)
				this.modal.content.innerHTML = 'stats:<br />effectiveness: 100%';
			}
			else {
				this.modal.deletor();
			}
		}
		static tick() {
			if (this.open) {
				this.modal.float(pawns.you!, [15, 20]);
			}
		}
	}

	export class container {
		static open = false
		static anchor: lod.obj
		static modal: modal
		static call(open, attach?: lod.obj) {
			//this.anchor = obj;
			if (!this.anchor) {
				this.anchor = new lod.obj;
				this.anchor.size = [24, 40];
				this.anchor.wpos = [38, 49];
			}
			if (attach) {
				this.anchor = attach;
			}
			if (open && open != this.open) {
				this.open = open;
				this.modal = new modal(this.anchor.type);
				win.append(this.modal.element)
				this.modal.content.innerHTML = 'things:<br/>';

				const cast = this.anchor as objects.container;
				for (let item of cast.items) {
					this.modal.content.innerHTML += item + '<br />';
				}
			}
			else if (!open && open != this.open) {
				this.open = open;
				container.modal.deletor();
			}
		}
		static tick() {
			if (this.open) {
				this.modal.float(this.anchor);
			}
		}
	}
}

export default win;