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
	export enum MOUSE {
		UP = - 1,
		OFF = 0,
		DOWN,
		STILL
	};
	export var error;
	var keys = {};
	var buttons = {};
	var pos: vec2 = [0, 0];
	export var salt = 'x';
	export var mobile = false;
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
		mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		function onmousemove(e) {
			pos[0] = e.clientX;
			pos[1] = e.clientY;
		}
		function onmousedown(e) {
			buttons[e.button] = 1;
			if (e.button == 1)
				return false
		}
		function ontouchstart(e) {
			buttons[0] = 1;
			//return false;
		}
		function ontouchmove(e) {
			pos[0] = e.clientX;
			pos[1] = e.clientY;
			//return false;
			//console.log('touch move');
			e.preventDefault();
			return false;
		}
		function ontouchend(e) {
			buttons[0] = MOUSE.UP;
			//return false;
		}
		function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
		function onwheel(e) { wheel = e.deltaY < 0 ? 1 : -1; }
		function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
		document.onkeydown = document.onkeyup = onkeys;
		document.onmousemove = onmousemove;
		document.onmousedown = onmousedown;
		document.onmouseup = onmouseup;
		document.onwheel = onwheel;
		document.ontouchstart = ontouchstart;
		document.ontouchmove = ontouchmove;
		document.ontouchend = ontouchend;
		window.onerror = onerror;
		ren.init();
		wastes.init();
		loop(0);
	}
	function process_keys() {
		for (let i in keys) {
			if (keys[i] == KEY.PRESS)
				keys[i] = KEY.WAIT;
			else if (keys[i] == KEY.UP)
				keys[i] = KEY.OFF;
		}
	}
	function process_mouse_buttons() {
		for (let b of [0, 1, 2])
			if (buttons[b] == MOUSE.DOWN)
				buttons[b] = MOUSE.STILL;
			else if (buttons[b] == MOUSE.UP)
				buttons[b] = MOUSE.OFF;
	}
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		ren.update();
		wastes.tick();
		ren.render();
		wheel = 0;

		process_keys();
		process_mouse_buttons();
	}
	export function sethtml(selector, html) {
		let element = document.querySelectorAll(selector)[0];
		element.innerHTML = html;
	}
}

window['App'] = app;

export default app;