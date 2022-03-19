import { default as THREE, LoadingManager, Group, AxesHelper, DirectionalLight, MeshLambertMaterial } from "three";

import { ColladaLoader } from '../node_modules/three/examples/jsm/loaders/ColladaLoader.js';

import ren from './renderer';
import wastes from "./wastes";

namespace collada {

	export var started = false;

	export function register() {

	}

	export function start() {

		started = true;

		document.title = 'collada'

		var elf;

		const loadingManager = new LoadingManager(function () {

			//ren.scene.add(elf);

		});

		const loader = new ColladaLoader(loadingManager);
		loader.load('collada/model.dae', function (collada) {

			//wastes.gview.zoomIndex = 0;

			elf = collada.scene;
			let group = new Group;
			group.rotation.set(0, -Math.PI / 2, 0);
			group.position.set(wastes.size, 0, 0);
			group.add(elf);

			//console.log(elf);

			function fix(material: MeshLambertMaterial) {
				//material.color = new THREE.Color('red');
				material.minFilter = material.magFilter = THREE.LinearFilter;
			}
			
			function traversal(object) {
				if (object.material) {
					if (!object.material.length)
						fix(object.material);
					else
						for (let material of object.material)
							fix(material);
				}
			}

			elf.traverse(traversal);

			//group.add(new AxesHelper(300));
			console.log(elf.scale);

			elf.scale.multiplyScalar(60);
			//elf.rotation.set(-Math.PI / 2, 0, 0);
			elf.position.set(1, 0, 0);

			ren.scene.add(group);

			let sun = new DirectionalLight(0xffffff, 0.35);
			sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
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

export default collada;