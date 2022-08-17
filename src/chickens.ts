import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, PlaneGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";
import aabb2 from "./aabb2";

import app from "./app";
import collada from "./collada";
import GLOB from "./glob";
import lod, { numbers } from "./lod";

import objects from "./objects";
import pts from "./pts";
import ren from "./renderer";
import shadows from "./shadows";
import sprite, { SpriteMaterial } from "./sprite";
import sprites from "./sprites";
import tiles from "./tiles";
import wastes from "./wastes";
import win from "./win";


export namespace chickens {

	export function start() {
		//let chicken = new chickens.chicken;
		//chicken.wpos = [46, 49];
		//lod.add(chicken);

		/*let chicken2 = new chickens.chicken;
		chicken2.wpos = [42, 53];
		lod.add(chicken2);*/
	}

	export class chicken extends objects.objected {
		netwpos: vec2 = [0, 0]
		netangle = 0
		group
		mesh
		target
		scene
		camera
		created = false
		pecking = false
		sitting = false
		constructor() {
			super(numbers.chickens);
			this.type = 'chicken';
			this.height = 24;
		}
		override create() {

			this.tiled();

			this.size = pts.divide([25, 30], 1);
			//this.subsize = [25, 40];

			let shape = new sprite({
				binded: this,
				tuple: sprites.test100,
				//opacity: 0.5,
				orderBias: 1.0,
			});
			shape.dimetric = false;
			shape.rleft = this.size[0] / 2;
			shape.rup2 = this.size[1] / 2;

			shape.show();

			if (!this.created) {
				this.created = true;

				console.log('creating chicken');

				// Set scale to increase pixels exponentially
				const scale = 1;

				// make wee guy target
				//this.group = new THREE.Group
				let size = pts.mult(this.size, scale);

				this.target = ren.make_render_target(size[0], size[1]);
				this.camera = ren.make_orthographic_camera(size[0], size[1]);

				this.scene = new Scene()
				//this.scene.background = new Color('#333');
				this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
				this.scene.scale.set(scale, scale, scale);

				this.scene.add(new AmbientLight('white'));

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
		override update() {
			this.tiled();
			this.stack();
			super.update();
		}
		//override setup_context() {
		//	win.contextmenu.reset();
		//}
		groups: any = {}
		meshes: any = {}
		made = false
		make() {
			if (this.made)
				return;
			this.made = true;

			const headWidth = 2.5;
			const headHeight = 5;
			const headLength = 2.5;

			const combWidth = 1;
			const combHeight = 2;
			const combLength = 2;

			const beakWidth = 1.5;
			const beakHeight = 1.5;
			const beakLength = 2;

			const legsWidth = 1;
			const legsHeight = 3;
			const legsLength = 1;

			const armsWidth = 1;
			const armsLength = 5;
			const armsHeight = 3;
			const armsAngle = .0;

			const bodyWidth = 4;
			const bodyHeight = 4;
			const bodyLength = 7;

			const feetWidth = 1.5;
			const feetHeight = 1;
			const feetLength = 1.5;

			let boxHead = new BoxGeometry(headWidth, headHeight, headLength);
			let materialHead = new MeshLambertMaterial({
				color: '#787a7a'
			});

			let boxComb = new BoxGeometry(combWidth, combHeight, combLength);
			let materialComb = new MeshLambertMaterial({
				color: '#a52c2c'
			});

			let boxBeak = new BoxGeometry(beakWidth, beakHeight, beakLength);
			let materialBeak = new MeshLambertMaterial({
				color: '#7f805f'
			});

			let boxBody = new BoxGeometry(bodyWidth, bodyHeight, bodyLength);
			let materialBody = new MeshLambertMaterial({
				color: '#787a7a'
			});

			let boxArms = new BoxGeometry(armsWidth, armsHeight, armsLength);
			let materialArms = new MeshLambertMaterial({
				color: '#787a7a'
			});

			let boxLegs = new BoxGeometry(legsWidth, legsHeight, legsLength);
			let boxFeet = new BoxGeometry(feetWidth, feetHeight, feetLength);
			let materialLegs = new MeshLambertMaterial({
				color: '#7f805f'
			});

			let planeWater = new PlaneGeometry(wastes.size * 2, wastes.size * 2);
			let materialWater = new MeshLambertMaterial({
				color: new THREE.Color('rgba(32, 64, 64, 255)'),
				opacity: 0.4,
				transparent: true,
				blending: THREE.CustomBlending,
				blendEquation: THREE.AddEquation,
				blendSrc: THREE.DstAlphaFactor,
				blendDst: THREE.OneMinusSrcAlphaFactor
			})

			this.meshes.water = new Mesh(planeWater, materialWater);
			this.meshes.water.rotation.x = -Math.PI / 2;
			this.meshes.water.position.y = -bodyHeight * 1.5;
			this.meshes.water.visible = false;

			this.meshes.head = new Mesh(boxHead, materialHead);
			this.meshes.comb = new Mesh(boxComb, materialComb);
			this.meshes.beak = new Mesh(boxBeak, materialBeak);

			this.meshes.body = new Mesh(boxBody, materialBody);

			this.meshes.arml = new Mesh(boxArms, materialArms);
			this.meshes.armr = new Mesh(boxArms, materialArms);

			this.meshes.legl = new Mesh(boxLegs, materialLegs);
			this.meshes.legr = new Mesh(boxLegs, materialLegs);

			this.meshes.footl = new Mesh(boxFeet, materialLegs);
			this.meshes.footr = new Mesh(boxFeet, materialLegs);

			this.groups.neck = new Group;
			this.groups.head = new Group;
			this.groups.beak = new Group;
			this.groups.comb = new Group;
			this.groups.body = new Group;
			this.groups.arml = new Group;
			this.groups.armr = new Group;
			this.groups.legl = new Group;
			this.groups.legr = new Group;
			this.groups.footl = new Group;
			this.groups.footr = new Group;
			this.groups.ground = new Group;
			this.groups.basis = new Group;

			this.groups.neck.add(this.meshes.head);
			this.groups.head.add(this.meshes.head);
			this.groups.beak.add(this.meshes.beak);
			this.groups.comb.add(this.meshes.comb);
			this.groups.body.add(this.meshes.body);
			this.groups.arml.add(this.meshes.arml);
			this.groups.armr.add(this.meshes.armr);
			this.groups.legl.add(this.meshes.legl);
			this.groups.legr.add(this.meshes.legr);
			this.groups.footl.add(this.meshes.footl);
			this.groups.footr.add(this.meshes.footr);

			this.groups.head.add(this.groups.beak);
			this.groups.head.add(this.groups.comb);
			this.groups.neck.add(this.groups.head);
			this.groups.legl.add(this.groups.footl);
			this.groups.legr.add(this.groups.footr);

			this.groups.body.add(this.groups.neck);
			this.groups.body.add(this.groups.arml);
			this.groups.body.add(this.groups.armr);
			this.groups.ground.add(this.groups.legl);
			this.groups.ground.add(this.groups.legr);
			this.groups.ground.add(this.groups.body);

			this.groups.basis.add(this.groups.ground);
			this.groups.basis.add(this.meshes.water);

			this.groups.neck.position.set(0, bodyHeight / 2, bodyLength / 3);
			this.groups.head.position.set(0, headHeight / 2, 0);
			this.groups.comb.position.set(0, combHeight, combLength / 2);
			this.groups.beak.position.set(0, 0, beakLength);
			//this.groups.beak.rotation.set(-Math.PI / 4, 0, 0);

			this.groups.body.position.set(0, bodyHeight, 0);
			this.meshes.body.rotation.set(-0.3, 0, 0);
			this.meshes.arml.rotation.set(-0.3, 0, 0);
			this.meshes.armr.rotation.set(-0.3, 0, 0);

			this.groups.armr.position.set(-bodyWidth / 2 - armsWidth / 2, bodyHeight / 2 - armsWidth / 2, 0);
			this.groups.armr.rotation.set(0, 0, -armsAngle);
			this.meshes.armr.position.set(0, -armsHeight / 2 + armsWidth / 2, 0);

			this.groups.arml.position.set(bodyWidth / 2 + armsWidth / 2, bodyHeight / 2 - armsWidth / 2, 0);
			this.groups.arml.rotation.set(0, 0, armsAngle);
			this.meshes.arml.position.set(0, -armsHeight / 2 + armsWidth / 2, 0);

			this.groups.legl.position.set(-legsWidth / 1, bodyHeight / 2, 0);
			this.meshes.legl.position.set(0, -legsHeight / 2, 0);

			this.groups.legr.position.set(legsWidth / 1, bodyHeight / 2, 0);
			this.meshes.legr.position.set(0, -legsHeight / 2, 0);

			this.groups.footl.position.set(0, -legsHeight, feetLength / 2);
			this.groups.footr.position.set(0, -legsHeight, feetLength / 2);

			this.groups.ground.position.set(0, -bodyHeight * 3, 0);
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

			const legsSwoop = 0.6;
			const armsSwoop = 0.5;
			const headBob = 1.0;
			const riser = 0.5;

			this.swoop += ren.delta * 2.5;

			const swoop1 = Math.cos(Math.PI * this.swoop);
			const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);

			this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
			this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
			//this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
			//this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
			this.groups.head.position.z = swoop1 * swoop2 * -headBob * this.walkSmoother;
			this.groups.ground.position.y = -10 + swoop1 * swoop2 * riser * this.walkSmoother;

			this.groups.ground.rotation.y = -this.angle + Math.PI / 2;
			
			if (this.sitting || app.key('q')) {
				this.groups.legl.visible = false;
				this.groups.legr.visible = false;
				this.groups.ground.position.y -= 4;
				this.meshes.body.rotation.set(0.0, 0, 0);
				this.meshes.arml.rotation.set(0.0, 0, 0);
				this.meshes.armr.rotation.set(0.0, 0, 0);
			}
			else
			{
				this.groups.legl.visible = true;
				this.groups.legr.visible = true;
				this.meshes.body.rotation.set(-0.3, 0, 0);
				this.meshes.arml.rotation.set(-0.3, 0, 0);
				this.meshes.armr.rotation.set(-0.3, 0, 0);
			}

			if (this.pecking) {
				this.groups.neck.rotation.x = 1.0;
				this.groups.body.rotation.x = 0.6;
			}
			else {
				this.groups.neck.rotation.x = 0;
				this.groups.body.rotation.x = 0;
			}

			const sprite = this.shape as sprite;
			if (this.tile?.type == 'shallow water') {
				sprite.vars.orderBias = 0.25
				this.meshes.water.visible = true;
			}
			else
			{
				sprite.vars.orderBias = 1.0;
				this.meshes.water.visible = false;
			}

			this.render();
		}
		swoop = 0
		angle = 0
		walkSmoother = 1
		randomWalker = 0
		
		nettick() {

			//this.netangle = Math.PI / 4;
			// Net tick can happen offscreen

			//this.wpos = tiles.hovering!.wpos;
			//this.wpos = wastes.gview.mwpos;

			if (this.pecking) {
				// console.log('we are pecking');
			}

			if (!pts.together(this.netwpos))
				this.netwpos = this.wpos;

			// tween netwpos into wpos
			let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren.delta * 2);
			this.wpos = pts.add(this.wpos, tween);

			this.sector?.swap(this);

			//console.log('chicken nettick', this.wpos);

			if (this.netangle - this.angle > Math.PI)
				this.angle += Math.PI * 2;
			if (this.angle - this.netangle > Math.PI)
				this.angle -= Math.PI * 2;

			let tweenAngle = (this.netangle - this.angle) * 0.1;

			this.angle += tweenAngle;

			const movement = pts.together(pts.abs(tween));
			if (movement > 0.005) {
				//console.log('movement > 0.25');

				this.walkSmoother += ren.delta * 10;
			}
			else {
				this.walkSmoother -= ren.delta * 5;
			}

		}
		override setup_context() {
			win.contextmenu.reset();

			win.contextmenu.options.options.push(["Examine", () => {
				return true;
			}, () => {
				win.descriptor.focus = this;
				win.descriptor.call_once("Just really a chicken.");
				//win.contextmenu.focus = undefined;
			}]);

		}
		override tick() {

			// We are assumed to be onscreen

			// If we are visible
			if (!this.shape)
				return;

			//this.wpos = wastes.gview.mwpos;

			this.make();
			this.animateBodyParts();
			this.tiled();
			//this.tile?.paint();
			//this.sector?.swap(this);

			let color = [1, 1, 1, 1] as vec4;

			const sprite = this.shape as sprite;

			// We could have been nulled due to a hide, dispose


			if (sprite) {
				const setShadow = () => {
					color = shadows.calc(color, pts.round(this.wpos));
					sprite.material.color.setRGB(color[0], color[1], color[2]);
				}
				if (sprite.mousedSquare(wastes.gview.mrpos)) {
					sprite.material.color.set(GLOB.HOVER_COLOR);
					win.contextmenu.focus = this;
				}
				else if (!sprite.mousedSquare(wastes.gview.mrpos)) {
					if (win.contextmenu.focus == this)
						win.contextmenu.focus = undefined;
					setShadow();
				}
				else if (this.tile && this.tile.hasDeck == false) {
					setShadow();
				}
				else if (!this.tile) {
				}
			}
			else {
				console.warn('no chicken sprite?????');
			}

			this.stack(['pawn', 'you', 'chicken', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
			//sprite.roffset = [.5, .5];
			//this.tile!.paint();
			super.update();
		}
		//tick() {
		//}
	}


}

export default chickens;