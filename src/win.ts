import { default as THREE, BoxGeometry } from "three";
import app from "./app";

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

		inventory.tick();
	}

	class modal {
		element
		title
		content
		constructor(name = 'modal', position = [0, 0]) {
			this.element = document.createElement('div') as HTMLElement
			this.element.className = 'modal';
			this.element.style.top = position[1];
			this.element.style.left = position[0];
			//this.element.append('inventory')

			this.title = document.createElement('div');
			this.title.innerHTML = name;
			this.element.append(this.title);
			
			this.content = document.createElement('div');
			this.content.innerHTML = 'stuff';
			this.element.append(this.content);

		}
		deletor() {
			inventory.modal.element.remove();
		}
	}

	class inventory {
		static toggle = false
		static modal: modal
		static handle() {
			inventory.toggle = !inventory.toggle;
			if (inventory.toggle) {
				inventory.modal = new modal('inventory', [100, 200]);
				win.append(inventory.modal.element)
			}
			else {
				inventory.modal.deletor();
			}
		}
		static tick() {

		}
	}
}

export default win;