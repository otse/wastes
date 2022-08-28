import lod from "./lod";
import testing_chamber from "./testing_chamber";
import tests from "./tests";
import view from "./view";
import tiles from "./tiles";
import objects from "./objects/objects";
import modeler from "./modeler";
import sprites from "./sprites";
import shear from "./shear";
import collada from "./collada";
import pawns from "./objects/pawns";
import win from "./win";
import rooms from "./rooms";
import areas from "./areas";
import colormap from "./colormap";
import shadows from "./shadows";
import aabb2 from "./aabb2";
import client from "./client";
import chickens from "./objects/chickens";
import fences from "./objects/fences";
import GLOB from "./glob";

export { win, pawns, objects, fences }; // fixes creepy rollup error


export namespace wastes {

	export const size = 24;

	export var gview: view;

	export var SOME_OTHER_SETTING = false;
	export var HIDE_ROOFS = false;
	export var FOLLOW_CAMERA = true;

	var started = false;

	export var heightmap: colormap.colormap
	export var objectmap: colormap.colormap
	export var buildingmap: colormap.colormap
	export var roofmap: colormap.colormap
	export var treemap: colormap.colormap
	export var colormap: colormap.colormap
	export var roughmap: colormap.colormap

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

	const MAX_WAIT = 250;
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
		else {
			gview = view.make();
			objects.register();
			tiles.register();

			sprites.start();
			shadows.start();
			tiles.start();
			objects.start();
			rooms.start();
			areas.start();
			win.start();
			tests.start();
			client.start();

			chickens.start();

			gview.center = new lod.obj();
			gview.center.wpos = [44, 52];

			/*
				[`I'm on duty.`, 1],
				[`I protect the civilized area here. It may not look that civil at first glance.`, 2],
				[`But undernearth the filth theres beauty to behold.`, 3],
				[`Just don't misbehave.`, -1]
			*/
		}
	}

	function start() {
		if (started)
			return;
		started = true;
		console.log(' wastes starting ');

		GLOB.HOVER_COLOR = '#95ca90';
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
		client.tick();
		objects.tick();
		rooms.tick();
		areas.tick();
		win.tick();
	}

}

export default wastes;