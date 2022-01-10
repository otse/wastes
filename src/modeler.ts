import { THREE, LoadingManager, Group, AxesHelper, DirectionalLight } from "three";

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

			wastes.view.zoom = 1.0;

			let sun = new DirectionalLight(0xffffff, 0.5);
			sun.position.set(-1, 1, .5);
			ren.scene.add(sun);
			ren.scene.add(sun.target);

			elf = collada.scene;
			let group = new Group;
			group.rotation.set(Math.PI / 6, Math.PI / 4, 0);
			group.add(elf);
			//group.add(new AxesHelper(300));
			console.log(elf.scale);
			
			elf.scale.multiplyScalar(wastes.size);
			elf.rotation.set(-Math.PI / 2, 0, 0);
			elf.position.set(wastes.size, 0, 0);

			ren.scene.add(group);

			window['group'] = group;
			window['elf'] = elf;


		});

	}

	export function tick() {

	}
}

export default modeler;