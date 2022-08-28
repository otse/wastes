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

		var myScene;

		const loadingManager = new LoadingManager(function () {

			//ren.scene.add(elf);

		});

		const loader = new ColladaLoader(loadingManager);
		loader.load('collada/model.dae', function (collada) {

			//wastes.gview.zoomIndex = 0;

			myScene = collada.scene;
			let group = new Group;
			group.rotation.set(0, -Math.PI / 2, 0);
			group.position.set(wastes.size, 0, 0);
			group.add(myScene);

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

			myScene.traverse(traversal);

			//group.add(new AxesHelper(300));
			console.log(myScene.scale);

			const zoom = 90; // 60 hires, 30 lowres
			myScene.scale.multiplyScalar(zoom);
			//elf.rotation.set(-Math.PI / 2, 0, 0);
			myScene.position.set(1, 0, 0);

			ren.scene.add(group);

			let sun = new DirectionalLight(0xffffff, 0.35);
			sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
			//sun.add(new AxesHelper(100));
			group.add(sun);
			group.add(sun.target);

			window['group'] = group;
			window['elf'] = myScene;


		});

	}

	export function load_model(path, zoom, then: (model) => any) {

		var myScene;
		
		const loadingManager = new LoadingManager(function () {
		});

		const loader = new ColladaLoader(loadingManager);
		loader.load(path + '.dae', function (collada) {

			//wastes.gview.zoomIndex = 0;

			myScene = collada.scene;
			let group = new Group;
			//group.rotation.set(0, -Math.PI / 2, 0);
			//group.position.set(wastes.size, 0, 0);
			//group.add(myScene);

			//console.log(elf);

			function fix(material: MeshLambertMaterial) {
				//material.color = new THREE.Color('red');
				material.minFilter = material.magFilter = THREE.LinearFilter;
				material.side = THREE.DoubleSide;
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

			myScene.traverse(traversal);

			//group.add(new AxesHelper(300));
			//console.log(myScene.scale);

			// 1 / 0.0254
			//const zoom = 30;
			myScene.scale.multiplyScalar(zoom);

			//elf.rotation.set(-Math.PI / 2, 0, 0);
			//myScene.position.set(1, 0, 0);

			//ren.scene.add(group);

			/*let sun = new DirectionalLight(0xffffff, 0.35);
			sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
			//sun.add(new AxesHelper(100));
			group.add(sun);
			group.add(sun.target);

			window['group'] = group;
			window['elf'] = myScene;
			*/

			then(myScene);

		});

		return myScene;
	}

	export function tick() {

	}
}

export default collada;