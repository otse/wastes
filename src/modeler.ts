import { THREE, LoadingManager, Group, AxesHelper } from "three";

import { ColladaLoader } from '../node_modules/three/examples/jsm/loaders/ColladaLoader.js';

import ren from './renderer';
import wastes from "./wastes";

namespace modeler {

	export var started = false;

	export function register() {

	}

	export function start() {
		started = true;

		var elf;

		const loadingManager = new LoadingManager(function () {

			//ren.scene.add(elf);

		});

		const loader = new ColladaLoader(loadingManager);
		loader.load('./modeler/collada/diner.dae', function (collada) {

			elf = collada.scene;
			let group = new Group;
			group.rotation.set(Math.PI / 6, Math.PI / 4, 0)
			group.add(elf);
			elf.scale.set(2, 2, 2);
			elf.add(new AxesHelper(100));
			elf.rotation.set(-Math.PI / 2, 0, 0);

			ren.scene.add(group);

			window['group'] = group;
			window['elf'] = elf;


		});

	}

	export function tick() {

	}
}

export default modeler;