import { default as THREE, BoxGeometry } from "three";
import aabb2 from "./aabb2";
import app from "./app";
import pawns from "./objects/pawns";

import ren from './renderer';
import wastes from "./wastes";
import win from "./win";

namespace areas {

	export interface area {
		name: string
		bound: aabb2
	}

	let areas: area[] = [];

	let currentArea: area | undefined;

	export var started = false;

	export function start() {
		started = true;

		areas.push({ name: "Trashy Vendor", bound: new aabb2([35.5, 46.5], [42.5, 52.5]) });

	}

	export function tick() {
		if (!started)
			return;

		let pos = wastes.gview.center.wpos;

		let here = new aabb2(pos, pos);

		if (currentArea) {
			if (currentArea && currentArea.bound.test(here) == aabb2.TEST.Outside) {
				currentArea = undefined;
				console.log('outside');
			}
		}
		else {
			for (let area of areas) {
				if (area.bound.test(here) == aabb2.TEST.Inside) {
					console.log('inside');
					currentArea = area;
					win.areatag.tag = area;
					win.areatag.call_step();
				}
				else if (win.areatag.tagCur == area) {
					win.areatag.tagCur = undefined;
				}
			}
		}

	}
}

export default areas;