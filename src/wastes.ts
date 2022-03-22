import lod from "./lod";
import testing_chamber from "./testing_chamber";
import tests from "./tests";
import view from "./view";
import tiles from "./tiles";
import objects from "./objects";
import modeler from "./modeler";
import { sprites } from "./sprites";
import tree from "./tree";
import shear from "./shear";
import collada from "./collada";
import pawns from "./pawn";
import win from "./win";
import rooms from "./rooms";


export namespace wastes {

	export const size = 24;

	export var gview: view;

	export var SOME_OTHER_SETTING = false;
	export var HIDE_ROOFS = false;

	var started = false;

	export var heightmap: objects.colormap
	export var objectmap: objects.colormap
	export var buildingmap: objects.colormap
	export var roommap: objects.colormap
	export var treemap: objects.colormap
	export var colormap: objects.colormap
	export var texturemap: objects.colormap

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

	function starts() {
		lod.register();
		if (window.location.href.indexOf("#testingchamber") != -1) {
			gview = view.make();
			testing_chamber.start();
			tests.start();
		}
		else if (window.location.href.indexOf("#modeler") != -1) {
			modeler.start();
		}
		else if (window.location.href.indexOf("#shear") != -1) {
			shear.start();
		}
		else if (window.location.href.indexOf("#collada") != -1) {
			collada.start();
		}
		//else if (window.location.href.indexOf("#tree") != -1) {
		//	tree.start();
		//}
		else {
			gview = view.make();
			objects.register();
			tiles.register();
			sprites.start();
			tiles.start();
			objects.start();
			rooms.start();
			win.start();
			
			pawns.make();
		}
	}

	function start() {
		if (started)
			return;
		started = true;
		console.log(' wastes starting ');
		starts();
	}

	export function init() {
		console.log(' wastes init ');
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
		gview?.tick();
		tests.tick();
		testing_chamber.tick();
		modeler.tick();
		tiles.tick();
		shear.tick();
		collada.tick();
		objects.tick();
		rooms.tick();
		win.tick();
	}

}

export default wastes;