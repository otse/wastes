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

export function building_factory() {

	new building_parts();

	/*let prefab = new building;
	prefab.wpos = [45, 48];
	prefab.produce();
	lod.add(prefab);*/
}

class building_parts {
	constructor() {

		const house = collada.load_model('collada/building', 1, (model) => {
			model.rotation.set(0, 0, 0);

			//this.group.add(model);
			//this.group.position.set(0, -23, 0);
			//this.scene.add(new AxesHelper(100));
			console.log('add building to scene');

			function traversal(object) {
				if (object.name && object.name.includes("Wall")) {
					let cloned = object.clone();
					cloned.scale.multiplyScalar(0.5);

					console.log("making wall ", cloned.name, cloned);

					let prefab = new building;
					prefab.model = cloned;
					if (cloned.name.includes("Wall2")) {
						//console.log('were wall 2 mates', object);
						cloned.position.set(0, 0, 0);
						
						prefab.wpos = [47, 48];
					}
					else
						prefab.wpos = [45, 48];
					prefab.produce();
					lod.add(prefab);
				}
			}

			model.traverse(traversal);

		});
	}
}

class building extends superobject {
	model
	offset
	target
	scene
	group
	camera
	constructor() {
		super([0, 0]);

		this.size = [24, 40];
	}
	produce() {

	}
	// render this superobject
	render() {
		const sprite = this.shape as sprite;
		sprite.material.map = this.target.texture;

		ren.renderer.setRenderTarget(this.target);
		ren.renderer.clear();
		ren.renderer.render(this.scene, this.camera);
	}
	override tick() {

		this.render();

		if (app.key('arrowleft')) {
			this.scene.position.x -= 1;
			console.log('', this.scene.position.x);

		}
		if (app.key('arrowright')) {
			this.scene.position.x += 1;
			console.log('', this.scene.position.x);
		}
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
		let amb = new AmbientLight('white');
		this.scene.add(amb);

	}
	override create() {
		console.log('builing create');

		//this.size = [24, 40];

		let shape = new sprite({
			binded: this,
			tuple: sprites.test100,
			cell: [0, 0],
			orderBias: 1.0,
		});

		shape.show();

		this.set_3d();

		shape.material.map = this.target.texture;

		//const house = collada.load_model('collada/building', 18, (model) => {
		//model.rotation.set(0, 0, 0);

		this.group.add(this.model);
		this.group.position.set(0, -23, 0);
		//this.group.add(new AxesHelper(100));
		console.log('add building to scene');

		//});

		this.stack();
	}
}

class prefab extends superobject {
	constructor() {
		super([0, 0]);
	}
}

export default building;