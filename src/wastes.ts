import lod from "./lod";
import testing_chamber from "./testing_chamber";
import tests from "./tests";
import View from "./view";
import tiles from "./tiles";
import objects from "./objects";


export namespace wastes {

	export const size = 24;

	export var view: View;

	export var SOME_OTHER_SETTING = false;

	export const tileSize = lod.Unit;

	var started = false;

	export function sample(a) {
		return a[Math.floor(Math.random() * a.length)];
	}

	export function clamp(val, min, max) {
		return val > max ? max : val < min ? min : val;
	}

	export enum RESOURCES {
		RC_UNDEFINED = 0,
		POPULAR_ASSETS,
		CANT_FIND,
		READY,
		COUNT
	};

	let time;
	let resources_loaded = 0b0;
	export function resourced(word: string) {
		resources_loaded |= 0b1 << RESOURCES[word];
		try_start();
	}

	function try_start() {
		let count = 0;
		for (let i = 0; i < RESOURCES.COUNT; i++)
			if (resources_loaded & 0b1 << i) count++;
		if (count == RESOURCES.COUNT)
			start();
	}

	const MAX_WAIT = 500;
	function reasonable_waiter() {
		if (time + MAX_WAIT < new Date().getTime()) {
			console.warn(` passed reasonable wait time for resources `);
			start();
		}
	}
	
	export function critical(mask: string) {
		// Couldn't load
		console.error('resource', mask);
	}

	function registers() {
		lod.register();
		tiles.register();
		objects.register();
	}

	function starts() {
		tests.start();
		tiles.start();
		objects.start();
		if (window.location.href.indexOf("#testingchamber") != -1) {
			//CRPG = false
			testing_chamber.start();
		}
	}

	function start() {
		if (started)
			return;
		started = true;
		console.log(' wastes starting ');
		view = View.make();
		registers();
		starts();
	}

	export function init() {
		console.log(' wests init ');
		time = new Date().getTime();
		resourced('RC_UNDEFINED');
		resourced('POPULAR_ASSETS');
		resourced('READY');
		window['wastes'] = wastes;
	}

	export function tick() {
		if (!started) {
			reasonable_waiter()
			return
		}
		view.tick();
		tests.tick();
		//lands.tick();
	}

}

export default wastes;