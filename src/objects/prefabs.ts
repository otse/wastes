import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, PlaneGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";

//import lod, { numbers } from "./lod";
//import { objects } from "./wastes";
import lod from "../lod";
import objects from "./objects";
import { superobject } from "./superobject";
import sprite from "../sprite";
import sprites from "../sprites";
import collada from "../collada";
import ren from "../renderer";
import app from "../app";
import pts from "../pts";
import wastes from "../wastes";
import shadows from "../shadows";

/*
this file is a success attempt at piecing apart a sketchup building
it however isn't more convenient than making buildings with colormaps

the code deserves to stay around
*/

export function building_factory() {

	new building_parts('watertower', [41, 42]);
	//new building_parts('building', [40, 48]);

	/*let prefab = new building;
	prefab.wpos = [45, 48];
	prefab.produce();
	lod.add(prefab);*/
}

class building_parts {
	constructor(path, corner: vec2 = [41, 42]) {

		const house = collada.load_model('collada/'+path, 1, (model) => {
			model.rotation.set(0, 0, 0);

			//this.group.add(model);
			//this.group.position.set(0, -23, 0);
			//this.scene.add(new AxesHelper(100));
			console.log('add building to scene');

			function convert(object, target, array, bias) {
				if (object.name && object.name.includes(target)) {
					let cloned = object.clone();
					cloned.scale.multiplyScalar(0.43);

					let z = 0;
					//console.log("making wall ", cloned.name, cloned);
					let height = object.name.split(target)[1];
					if (height.includes("_")) {
						const split = height.split("_");
						height = parseInt(split[0]);
						z = parseInt(split[1]);
						console.log('Z is', z);
					}
					else {
						height = parseInt(height);
					}
					console.log(`${target} height ${height}`);

					let thing = new prefab;
					array.push(thing);
					thing.model = cloned;
					thing.type = target;
					thing.bias = bias;
					thing.height = height;
					thing.z = z;
					//
					cloned.position.set(0, 0, 0);
					let pos: vec2 = [object.position.x, object.position.y];
					pos = pts.divide(pos, 39.37008);
					pos = pts.round(pos);
					pos = [-pos[1], pos[0]];
					//console.log("prefab pos", pos);
					pos = pts.add(pos, corner);
					//console.log('original position is', object.position, pos);
					thing.wpos = pos;
					lod.add(thing);
				}
			}

			let walls: prefab[] = [];
			let roofs: prefab[] = [];
			let floors: prefab[] = [];

			function traverse_floors(object) {
				convert(object, "floor", floors, .4);
			}

			function traverse_walls(object) {
				convert(object, "wall", walls, 1.0);
			}

			function traverse_roofs(object) {
				convert(object, "roof", roofs, 1.6);
			}

			model.traverse(traverse_floors);

			model.traverse((object) => {
				if (object.name && object.name.includes('door')) {
					console.log('this a door');

					let pos: vec2 = [object.position.x, object.position.y];
					pos = pts.divide(pos, 39.37008);
					pos = pts.round(pos);
					pos = [-pos[1], pos[0]];
					pos = pts.add(pos, corner);

					let door = new objects.door;
					door.cell = [1, 0];
					door.wpos = pos;

					lod.add(door);

					console.log('placing door');


				}
			});

			model.traverse(traverse_walls);
			model.traverse(traverse_roofs);

		});
	}
}

class prefab extends superobject {
	model
	offset
	bias
	target
	scene
	group
	camera
	sun
	constructor() {
		super([0, 0]);

		this.size = [24, 40];
	}
	// render this superobject

	rendered = 0
	render() {

		this.rendered++;

		// assume after 60 frames we've rendered this prefab with textures
		if (this.rendered > 60)
			return;

		const sprite = this.shape as sprite;
		sprite.material.map = this.target.texture;

		ren.renderer.setRenderTarget(this.target);
		ren.renderer.clear();
		ren.renderer.render(this.scene, this.camera);
	}
	override tick() {

		this.render();

		if (this.type == 'wall') {
			shadows.shade_matrix(this.wpos, [
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, .8, 0, 0],
				[0, 0, 0, .8, 0],
				[0, 0, 0, 0, .8]], true);
			//console.log('bo');
			
		}

		/*
		if (app.key('7')) {
			this.sun.position.x -= 1;
		}
		if (app.key('9')) {
			this.sun.position.x += 1;
		}
		if (app.key('4')) {
			this.sun.position.y -= 1;
		}
		if (app.key('6')) {
			this.sun.position.y += 1;
		}
		if (app.key('1')) {
			this.sun.position.z -= 1;
		}
		if (app.key('3')) {
			this.sun.position.z += 1;
		}
		*/
		//console.log('sun', this.sun.position);

	}
	set_3d() {

		// Set scale to increase pixels exponentially
		const scale = 1;

		let size = pts.mult(this.size, scale);

		this.target = ren.make_render_target(size[0], size[1]);
		this.camera = ren.make_orthographic_camera(size[0], size[1]);
		this.scene = new Scene()
		this.group = new Group()
		//this.group.add(new AxesHelper(25));
		this.scene.add(this.group);
		this.scene.scale.set(scale, scale, scale);
		//this.scene.background = new Color('gray');
		this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
		this.group.rotation.set(-Math.PI / 2, 0, 0);
		this.scene.position.set(0, 0, 0);
		let amb = new AmbientLight('#777');
		this.scene.add(amb);

		this.sun = new DirectionalLight(0xffffff, 0.3);
		const size2 = 10;
		this.sun.position.set(-size2, 0, size2 / 2);
		//sun.add(new AxesHelper(100));
		this.group.add(this.sun);
		this.group.add(this.sun.target);
		//sun.target.add(new AxesHelper);

	}
	override create() {
		//console.log('builing create');

		//this.size = [24, 40];

		let shape = new sprite({
			binded: this,
			tuple: sprites.test100,
			cell: [0, 0],
			orderBias: this.bias,
			masked: true,
			maskColor: [0.3, 0.3, 0.3]
		});

		shape.show();

		this.rendered = 0;

		this.set_3d();

		shape.material.map = this.target.texture;

		//const house = collada.load_model('collada/building', 18, (model) => {
		//model.rotation.set(0, 0, 0);

		this.group.add(this.model);
		this.group.position.set(0, -23, 0);
		//this.group.add(new AxesHelper(100));
		//console.log('add building to scene');

		//});

		this.stack();
		//console.log('after stack', this.shape);

	}
}

export default prefab;