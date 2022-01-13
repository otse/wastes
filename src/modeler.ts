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

			wastes.gview.zoomIndex = 0;

			
			elf = collada.scene;
			let group = new Group;
			group.rotation.set(Math.PI / 6, Math.PI / 4, 0);
			group.position.set(wastes.size, 0, 0);
			group.add(elf);
			//group.add(new AxesHelper(300));
			console.log(elf.scale);
			
			elf.scale.multiplyScalar(wastes.size);
			elf.rotation.set(-Math.PI / 2, 0, 0);
			elf.position.set(1, 0, 0);
			
			ren.scene.add(group);
			
			let sun = new DirectionalLight(0xffffff, 0.5);
			sun.position.set(-wastes.size, wastes.size * 1, wastes.size / 2);
			//sun.add(new AxesHelper(100));
			group.add(sun);
			group.add(sun.target);

			window['group'] = group;
			window['elf'] = elf;


		});

	}

	export function tick() {

	}
}

export default modeler;