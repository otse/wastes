import { default as THREE, LoadingManager, TextureLoader, Texture, Group, Mesh, Shader, Matrix3, AxesHelper, DirectionalLight, MeshLambertMaterial, MeshLambertMaterialParameters, BoxGeometry } from "three";
import app from "./app";

import ren from './renderer';
import wastes from "./wastes";

namespace modeler {

	export var started = false;

	const textures = [
		'tex/stock/moonsand.jpg',
		'tex/stock/soilrough.jpg',
		'tex/stock/redverts.jpg',
		'tex/stock/smudplanks.jpg',
		'tex/stock/blueplanks.jpg',
		'tex/stock/crate1.jpg',
		'tex/stock/planks.jpg',
		'tex/stock/planks1.jpg',
		'tex/stock/planks5.jpg',
		'tex/stock/metalrooftiles.jpg',
		'tex/stock/concrete1.jpg',
		'tex/stock/brick2.jpg',
		'tex/stock/brick3.jpg',
		'tex/stock/brick4.jpg',
		'tex/stock/treebark1.jpg',
		'tex/stock/leaves.png',
	]

	let currentTex = 0;

	var gmesh;
	var ggroup;
	var rotation: 0 | 1 | 2 | 3 = 0;
	let heightMod = 1;
	var zooms: [index: number, current: number, options: number[]] = [0, 1, [1, 0.33, 0.25, 0.1]]

	export function register() {

	}

	export function start() {
		started = true;

		document.title = 'modeler';

		gmesh = createMesh();

		ggroup = new Group;
		ggroup.rotation.set(Math.PI / 6, Math.PI / 4, 0);

		ren.scene.add(ggroup);

		let sun = new DirectionalLight(0xffffff, 0.4);
		sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
		//sun.add(new AxesHelper(100));
		ggroup.add(sun);
		ggroup.add(sun.target);

	}

	function createMesh(size = wastes.size) {
		const width = 18, height = 18 * 2;

		let box = new BoxGeometry(width, height * heightMod, width, 1, 1, 1);

		let materials: MeshLambertMaterial[] = [];
		//let texture = ren.load_texture('tex/stock/metalrooftiles.jpg');

		let twidth = 1, tlength = 1;

		const loader = new TextureLoader();
		loader.load(
			textures[currentTex],
			function (texture: Texture) {
				console.log(texture.magFilter);
				console.log(texture.minFilter);
				//texture.magFilter = texture.minFilter = THREE.NearestFilter;
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				texture.generateMipmaps = true;

				console.log('woo');

				let alignments = [
					undefined,
					new Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1), // left
					new Matrix3().setUvTransform(0, 0, 0.5, 1, rotation * Math.PI / 2, 0, 1),  // top
					undefined,
					new Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1), // right
				]

				for (let i of [1, 2, 4]) {
					materials[i] = myboxmaterial({
						map: texture,
						transparent: true
					}, {
						myUvTransform: alignments[i]
					});
				}

				gmesh = new Mesh(box, materials);
				gmesh.position.set(3, 0, 0);
				ggroup.add(gmesh);
			}
		);


	}

	let show = true;

	export function tick() {
		if (!started)
			return;

		if (app.wheel == -1 && zooms[0] > 0)
			zooms[0] -= 1;

		if (app.wheel == 1 && zooms[0] < zooms[2].length - 1)
			zooms[0] += 1;

		zooms[1] = zooms[2][zooms[0]];

		ren.camera2.scale.set(zooms[1], zooms[1], zooms[1]);

		let rebuild = false;

		if (app.key('q') == 1) {
			rotation -= 1;
			rebuild = true;
		}
		if (app.key('e') == 1) {
			rotation += 1;
			rebuild = true;
		}

		if (app.key('arrowright') == 1) {
			rebuild = true;
			console.log('switch tex');
			if (currentTex < textures.length - 1)
				currentTex++;
		}

		if (app.key('arrowleft') == 1) {
			rebuild = true;
			console.log('switch tex');
			if (currentTex > 0)
				currentTex--;
		}

		if (app.key('arrowup') == 1) {
			heightMod += 0.1;
			rebuild = true;
		}
		if (app.key('arrowdown') == 1) {
			heightMod -= 0.1;
			rebuild = true;
		}

		rotation = rotation < 0 ? 3 : rotation > 3 ? 0 : rotation;

		if (rebuild && gmesh) {
			gmesh.geometry.dispose();
			gmesh.material[1].dispose();
			gmesh.material[2].dispose();
			gmesh.material[4].dispose();
			gmesh.parent.remove(gmesh);
			gmesh = undefined;
			createMesh();
			//ggroup.add(gmesh);
		}

		if (app.key('h') == 1)
			show = !show;
		let crunch = ``;
		crunch += `dpi: ${ren.ndpi}<br />`;
		crunch += `fps: ${ren.fps} / ${ren.delta.toPrecision(3)}<br />`;
		crunch += '<br />';

		crunch += `zoom: ${zooms[1]}<br />`;
		crunch += `rotation: ${rotation}<br />`;
		crunch += `controls: mousewheel to zoom, Q, E to rotate texture<br />`;

		let element = document.querySelectorAll('.stats')[0] as any
		element.innerHTML = crunch;
		element.style.visibility = show ? 'visible' : 'hidden';
	}

	function myboxmaterial(parameters: MeshLambertMaterialParameters, uniforms: any) {
		let material = new MeshLambertMaterial(parameters)
		material.customProgramCacheKey = function () {
			return 'boxmaterial';
		}
		material.name = "boxmaterial";
		material.onBeforeCompile = function (shader: Shader) {
			shader.defines = {};
			shader.uniforms.myUvTransform = { value: uniforms.myUvTransform }
			shader.vertexShader = shader.vertexShader.replace(
				`#include <common>`,
				`#include <common>
				uniform mat3 myUvTransform;
				`
			);
			shader.vertexShader = shader.vertexShader.replace(
				`#include <uv_vertex>`,
				`
				#ifdef USE_UV
				vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
				#endif
				`
			);
		}
		return material;
	}
}

export default modeler;