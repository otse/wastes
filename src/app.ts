import { wastes } from "./wastes"

import ren from "./renderer"
import pts from "./pts";
import glob from "./glob";
//import win from "./win"

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
	export function message(text) {
		document.querySelectorAll('.stats')[0].innerHTML = text;
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
		
		let touchStart: vec2 = [0, 0];
		function ontouchstart(e) {
			//message("ontouchstart");
			touchStart = [e.pageX, e.pageY];
			pos[0] = e.pageX;
			pos[1] = e.pageY;
			if (app.mobile)
				glob.win_propagate_events(e);
			buttons[2] = MOUSE.UP;
			//buttons[2] = MOUSE.DOWN; // rclick
			//return false;
		}
		function ontouchmove(e) {
			//message("ontouchmove");
			pos[0] = e.pageX;
			pos[1] = e.pageY;
			if (!buttons[0])
				buttons[0] = KEY.PRESS;
			//return false;
			//console.log('touch move');
			if (app.mobile)
				glob.win_propagate_events(e);
			e.preventDefault();
			return false;
		}
		function ontouchend(e) {
			//message("ontouchend");
			const touchEnd: vec2 = [e.pageX, e.pageY];
			buttons[0] = MOUSE.UP;
			buttons[2] = MOUSE.UP;

			if (pts.equals(touchEnd, touchStart) /*&& buttons[2] != MOUSE.STILL*/) {
				buttons[2] = MOUSE.DOWN;
			}/*
			else if (!pts.equals(touchEnd, touchStart)) {
				buttons[2] = MOUSE.UP;
			}
			//message("ontouchend");*/
			//return false;
		}
		function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
		function onwheel(e) { wheel = e.deltaY < 0 ? 1 : -1; }
		function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
		if (mobile) {
			document.ontouchstart = ontouchstart;
			document.ontouchmove = ontouchmove;
			document.ontouchend = ontouchend;
		}
		else {
			document.onkeydown = document.onkeyup = onkeys;
			document.onmousemove = onmousemove;
			document.onmousedown = onmousedown;
			document.onmouseup = onmouseup;
			document.onwheel = onwheel;
		}
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
	var skip = 0;
	export function loop(timestamp) {
		requestAnimationFrame(loop);
		skip++;
		//if (skip<10)
		//	return;
		skip = 0;
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