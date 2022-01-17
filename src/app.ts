import { wastes } from "./wastes"

import ren from "./renderer"

namespace app {
	export enum KEY {
		OFF = 0,
		PRESS,
		WAIT,
		AGAIN,
		UP
	};
	export var error;
	var keys = {};
	var buttons = {};
	var pos: vec2 = [0, 0];
	export var salt = 'x';
	export var wheel = 0;
	export function onkeys(event) {
		const key = event.key.toLowerCase();
		if ('keydown' == event.type)
			keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
		else if ('keyup' == event.type)
			keys[key] = KEY.UP;
		if (event.keyCode == 114)
			event.preventDefault();
	}
	export function key(k: string) {
		return keys[k];
	}
	export function button(b: number) {
		return buttons[b];
	}
	export function mouse(): vec2 {
		return [...pos];
	}
	export function boot(version: string) {
		salt = version;
		function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
		function onmousedown(e) { buttons[e.button] = 1; }
		function onmouseup(e) { buttons[e.button] = 0; }
		function onwheel(e) { wheel = e.deltaY < 0 ? 1 : -1; }
		function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
		document.onkeydown = document.onkeyup = onkeys;
		document.onmousemove = onmousemove;
		document.onmousedown = onmousedown;
		document.onmouseup = onmouseup;
		document.onwheel = onwheel;
		window.onerror = onerror;
		ren.init();
		wastes.init();
		loop(0);
	}
	export function delay() {
		for (let i in keys) {
			if (KEY.PRESS == keys[i])
				keys[i] = KEY.WAIT;
			else if (KEY.UP == keys[i])
				keys[i] = KEY.OFF;
		}
	}
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		ren.update();
		wastes.tick();
		ren.render();
		wheel = 0;
		for (let b of [0, 1, 2])
			if (buttons[b] == 1)
				buttons[b] = 2;
		delay();
	}
	export function sethtml(selector, html) {
		let element = document.querySelectorAll(selector)[0];
		element.innerHTML = html;
	}
}

window['App'] = app;

export default app;