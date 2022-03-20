import { default as THREE, BoxGeometry } from "three";
import app from "./app";
import lod from "./lod";
import pts from "./pts";

import ren from './renderer';
import wastes from "./wastes";

namespace win {

	var win: HTMLElement;

	export var started = false;

	export function start() {
		started = true;

		win = document.getElementById('win') as HTMLElement;		

	}

	export function tick() {
		if (!started)
			return;

		if (app.key('i') == 1) {
			inventory.handle();
		}

		if (app.key('c') == 1) {
			container.handle();
		}

		inventory.tick();
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
	}

	class inventory {
		static toggle = false
		static modal: modal
		static handle() {
			inventory.toggle = !inventory.toggle;
			if (inventory.toggle) {
				inventory.modal = new modal('inventory', );
				inventory.modal.reposition(['100px', '30%']);
				win.append(inventory.modal.element)
				inventory.modal.content.innerHTML = 'things that u own';
			}
			else {
				inventory.modal.deletor();
			}
		}
		static tick() {
			if (inventory.toggle) {

			}
		}
	}

	class container {
		static anchor: lod.obj
		static toggle = false
		static modal: modal
		static handle(name = 'crate') {
			container.toggle = !container.toggle;
			if (container.toggle) {
				if (!this.anchor) {
					this.anchor = new lod.obj;
					this.anchor.size = [24, 40];
					this.anchor.wpos = [38, 49];
				}
				container.modal = new modal(name);
				win.append(container.modal.element)
				container.modal.content.innerHTML = 'things r in here';
			}
			else {
				container.modal.deletor();
			}
		}
		static tick() {
			if (container.toggle) {
				this.anchor.update();
				//let pos = this.anchor.rtospos([-1.5, 2.5]);
				let pos = this.anchor.rtospos();
				pos = pts.add(pos, pts.divide(this.anchor.size, 2));
				//pos = pts.add(pos, this.anchor.size);
				//let pos = this.anchor.aabbScreen.center();
				//let pos = lod.project(wastes.gview.mwpos);
				pos = pts.subtract(pos, wastes.gview.rpos);
				pos = pts.divide(pos, wastes.gview.zoom);
				pos = pts.divide(pos, ren.ndpi);
				//pos = pts.add(pos, pts.divide(ren.screenCorrected, 2));
				//pos[1] -= ren.screenCorrected[1] / 2;
				container.modal.reposition([ren.screen[0]/2+pos[0]+'', ren.screen[1]/2-pos[1]+'']);
			}
		}
	}
}

export default win;