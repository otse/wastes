import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, PlaneGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";
import aabb2 from "../aabb2";

import app from "../app";
import { client } from "../client";
import collada from "../collada";
import dialogues from "../dialogue";
import GLOB from "../glob";
import lod, { numbers } from "../lod";

import objects from "./objects";
import { superobject } from "./superobject";
import pts from "../pts";
import ren from "../renderer";
import shadows from "../shadows";
import sprite, { hovering_sprites, SpriteMaterial } from "../sprite";
import sprites from "../sprites";
import tiles from "../tiles";
import wastes from "../wastes";
import win from "../win";


export namespace zombies {

	type inventory = { stamp: number, tuples: [string, number][] }

	export class zombie extends superobject {
		inventory?: inventory
		netwpos: vec2 = [0, 0]
		dead = false
		netangle = 0
		subtype
		//inventory: objects.container
		outfit = ['#444139', '#3b4339', '#3b4339', '#3b4039']
		group
		mesh
		target
		scene
		camera
		created = false
		constructor() {
			super(numbers.pawns);
			this.type = 'zombie';
			this.height = 24;
			//this.inventory = new objects.container;
			//this.inventory.add('money');
		}
		override create() {

			this.tiled();

			this.size = pts.divide([50, 40], 1);

			let shape = new sprite({
				binded: this,
				tuple: sprites.test100,
				cell: this.cell,
				//opacity: .5,
				orderBias: 1.0,
				mask: true
			});
			shape.subsize = [20, 40];
			shape.rleft = -this.size[0] / 4;
			shape.show();

			if (!this.created) {
				this.created = true;

				// Set scale to increase pixels exponentially
				const scale = 1;

				// make wee guy target
				//this.group = new THREE.Group
				let size = pts.mult(this.size, scale);

				this.target = ren.make_render_target(size[0], size[1]);

				this.camera = ren.make_orthographic_camera(size[0], size[1]);

				this.scene = new Scene()
				//this.scene.background = new Color('gray');
				this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
				this.scene.position.set(0, 0, 0);
				this.scene.scale.set(scale, scale, scale);

				let amb = new AmbientLight('white');
				this.scene.add(amb);

				let sun = new DirectionalLight(0xffffff, 0.5);
				// left up right
				sun.position.set(-wastes.size, wastes.size * 1.5, wastes.size / 2);
				//sun.add(new AxesHelper(100));

				this.scene.add(sun);
				this.scene.add(sun.target);
			}

			const spritee = this.shape as sprite;
			spritee.material.map = this.target.texture;


		}
		try_move_to(pos: vec2) {
			let venture = pts.add(this.wpos, pos);
			if (!objects.is_solid(venture))
				this.wpos = venture;

		}
		override obj_manual_update() {
			this.tiled();
			//this.stack();
			super.obj_manual_update();
		}
		override superobject_setup_context_menu() {
			win.contextmenu.reset();
			if (this.examine) {
				win.contextmenu.options.options.push(["Examine", () => {
					return true;
				}, () => {
					win.descriptor.focus = this;
					win.descriptor.call_once(this.examine);
					//win.contextmenu.focus = undefined;
				}]);
			}
		}
		groups: any = {}
		meshes: any = {}
		made = false
		make() {
			if (this.made)
				return;
			this.made = true;

			const headSize = 5.5;
			const gasMaskSize = 2.5;
			const legsSize = 4;
			const legsHeight = 12.5;
			const legsUp = 2.5;
			const armsSize = 3;
			const armsHeight = 12;
			const armsAngle = .0;
			const bodyThick = 5;
			const bodyWidth = 8;
			const bodyHeight = 12;

			let boxHead = new BoxGeometry(headSize, headSize, headSize, 1, 1, 1);
			let materialHead = new MeshLambertMaterial({
				color: this.outfit[0]
			});

			let boxGasMask = new BoxGeometry(gasMaskSize, gasMaskSize, gasMaskSize, 1, 1, 1);
			let materialGasMask = new MeshLambertMaterial({
				color: this.outfit[0]
			});

			let boxBody = new BoxGeometry(bodyWidth, bodyHeight, bodyThick, 1, 1, 1);
			let materialBody = new MeshLambertMaterial({
				color: this.outfit[1]
			});

			let boxArms = new BoxGeometry(armsSize, armsHeight, armsSize, 1, 1, 1);
			let materialArms = new MeshLambertMaterial({
				color: this.outfit[2]
			});

			let boxLegs = new BoxGeometry(legsSize, legsHeight, legsSize, 1, 1, 1);
			let materialLegs = new MeshLambertMaterial({
				color: this.outfit[3]
			});

			// https://www.andersriggelsen.dk/glblendfunc.php
			let planeWater = new PlaneGeometry(wastes.size * 2, wastes.size * 2);
			let materialWater = new MeshLambertMaterial({
				color: new THREE.Color('rgba(32, 64, 64, 255)'),
				opacity: 0.4,
				transparent: true,
				blending: THREE.CustomBlending,
				blendEquation: THREE.AddEquation,
				blendSrc: THREE.DstAlphaFactor,
				blendDst: THREE.OneMinusDstAlphaFactor
			})

			this.meshes.water = new Mesh(planeWater, materialWater);
			this.meshes.water.rotation.x = -Math.PI / 2;
			this.meshes.water.position.y = -bodyHeight * 1.25;
			this.meshes.water.visible = false;

			this.meshes.head = new Mesh(boxHead, materialHead);
			this.meshes.gasMask = new Mesh(boxGasMask, materialGasMask);
			this.meshes.body = new Mesh(boxBody, materialBody);

			this.meshes.arml = new Mesh(boxArms, materialArms);
			this.meshes.armr = new Mesh(boxArms, materialArms);

			this.meshes.legl = new Mesh(boxLegs, materialLegs);
			this.meshes.legr = new Mesh(boxLegs, materialLegs);

			this.groups.head = new Group;
			this.groups.gasMask = new Group;
			this.groups.body = new Group;
			this.groups.arml = new Group;
			this.groups.armr = new Group;
			this.groups.legl = new Group;
			this.groups.legr = new Group;
			this.groups.ground = new Group;
			this.groups.basis = new Group;

			this.groups.head.add(this.meshes.head);
			this.groups.gasMask.add(this.meshes.gasMask);
			this.groups.body.add(this.meshes.body);
			this.groups.arml.add(this.meshes.arml);
			this.groups.armr.add(this.meshes.armr);
			this.groups.legl.add(this.meshes.legl);
			this.groups.legr.add(this.meshes.legr);

			this.groups.head.add(this.groups.gasMask);

			this.groups.body.add(this.groups.head);
			this.groups.body.add(this.groups.arml);
			this.groups.body.add(this.groups.armr);
			this.groups.body.add(this.groups.legl);
			this.groups.body.add(this.groups.legr);
			this.groups.ground.add(this.groups.body);

			this.groups.basis.add(this.groups.ground);
			this.groups.basis.add(this.meshes.water);

			this.groups.head.position.set(0, bodyHeight / 2 + headSize / 2, 0);
			this.groups.gasMask.position.set(0, -headSize / 2, headSize / 1.5);
			this.groups.gasMask.rotation.set(-Math.PI / 4, 0, 0);
			this.groups.body.position.set(0, bodyHeight, 0);

			//this.meshes.armr.position.set(0, armsSize / 2, 0);
			this.groups.armr.position.set(-bodyWidth / 2 - armsSize / 2, bodyHeight / 2 - armsSize / 2, 0);
			this.groups.armr.rotation.set(0, 0, -armsAngle);
			this.meshes.armr.position.set(0, -armsHeight / 2 + armsSize / 2, 0);

			this.groups.arml.position.set(bodyWidth / 2 + armsSize / 2, bodyHeight / 2 - armsSize / 2, 0);
			this.groups.arml.rotation.set(0, 0, armsAngle);
			this.meshes.arml.position.set(0, -armsHeight / 2 + armsSize / 2, 0);

			this.groups.legl.position.set(-legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legl.position.set(0, -legsHeight / 2, 0);

			this.groups.legr.position.set(legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legr.position.set(0, -legsHeight / 2, 0);

			this.groups.ground.position.set(0, -bodyHeight * 1.0, 0);
			//mesh.rotation.set(Math.PI / 2, 0, 0);

			this.scene.add(this.groups.basis);
		}
		render() {
			ren.renderer.setRenderTarget(this.target);
			ren.renderer.clear();
			ren.renderer.render(this.scene, this.camera);
		}
		animateBodyParts() {
			this.walkSmoother = wastes.clamp(this.walkSmoother, 0, 1);

			if (!this.dead || app.key("j")) {
				const legsSwoop = 0.8;
				const armsSwoop = 0.5;
				const rise = 0.5;

				this.swoop += ren.delta * 2.0;

				const swoop1 = Math.cos(Math.PI * this.swoop);
				const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);

				this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
				this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
				this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
				this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
				this.groups.ground.position.x = 0;
				this.groups.ground.position.y = -12 + swoop1 * swoop2 * rise * this.walkSmoother;
				this.groups.ground.rotation.y = -this.angle + Math.PI / 2;

				this.groups.armr.rotation.x = -Math.PI / 2 * this.walkSmoother;
				this.groups.arml.rotation.x = -Math.PI / 2 * this.walkSmoother;
				//if (this.aiming) {

				const sprite = this.shape as sprite;
				if (this.tile?.type == 'shallow water') {
					//sprite.vars.orderBias = 0.25
					this.meshes.water.visible = true;
				}
				else {
					//sprite.vars.orderBias = 1.0;
					this.meshes.water.visible = false;
				}
			}
			else {
				// dead
				this.groups.legl.rotation.x = -0.1;
				this.groups.legr.rotation.x = 0.1;
				this.groups.arml.rotation.x = 0.1;
				this.groups.armr.rotation.x = -0.1;
				this.groups.ground.position.y = -12;
				this.groups.ground.position.x = -12;

				this.groups.ground.rotation.x = Math.PI / 2;
				this.groups.ground.rotation.y = 0;
				this.groups.ground.rotation.z = -Math.PI / 2;

				const sprite = this.shape as sprite;
				sprite.vars.orderBias = 1.05;
			}

			this.render();
		}
		swoop = 0
		angle = 0
		walkSmoother = 0
		randomWalker = 0
		nettick() {

			if (this.type == 'you')
				return;

			//this.wpos = tiles.hovering!.wpos;

			if (!pts.together(this.netwpos))
				this.netwpos = this.wpos;

			// tween netwpos into wpos
			let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren.delta * 2);
			this.wpos = pts.add(this.wpos, tween);

			this.sector?.swap(this);

			if (this.netangle - this.angle > Math.PI)
				this.angle += Math.PI * 2;
			if (this.angle - this.netangle > Math.PI)
				this.angle -= Math.PI * 2;

			let tweenAngle = (this.netangle - this.angle) * 0.1;

			this.angle += tweenAngle;

			const movement = pts.together(pts.abs(tween));
			if (movement > 0.005) {
				//console.log('movement > 0.25');

				this.walkSmoother += ren.delta * 5;
			}
			else {
				this.walkSmoother -= ren.delta * 2.5;
			}

		}
		override tick() {

			if (!this.shape)
				return;

			//if (this.type == 'you')
			//	this.wpos = tiles.hovering!.wpos;

			this.make();

			this.animateBodyParts();

			this.tiled();
			//this.tile?.paint();
			this.sector?.swap(this);

			// shade the pawn

			let input = [1, 1, 1] as vec3;

			const sprite = this.shape as sprite;

			// We could have been nulled due to a hide, dispose
			if (sprite) {
				input = this.hovering_pass();
				
				if (this.tile && this.tile.hasDeck == false) {
					this.set_shadow(input);
				}
			}

			if (this.type == 'you') {
				//this.wpos = tiles.hovering!.wpos;
			}

			this.stack(['pawn', 'zombie', 'you', 'tree', 'chicken', 'shelves', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
			super.obj_manual_update();
		}
		//tick() {
		//}
	}


}

export default zombies;