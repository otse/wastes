import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";
import aabb2 from "./aabb2";

import app from "./app";
import collada from "./collada";
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


export namespace pawns {

	export var you: pawn;

	export var mousing: pawn | undefined;

	export function make_you() {
		let pos: vec2 = [44, 52];
		let paw = new pawn();
		paw.type = 'you';
		paw.wpos = pos;
		you = paw;
		lod.add(paw);
	}

	export function handle() {

	}

	const wasterSprite = false;

	export class pawn extends objects.objected {
		dialog = [
			[`I'm a commoner.`, 1],
			[`It can be hazardous around here. The purple for example is contaminated soil.`, 2],
			[`Stay clear from the irradiated areas, marked by dead trees.`, -1],
		]
		netwpos: vec2 = [0, 0]
		walkArea: aabb2
		pawntype = 'generic'
		trader = false
		inventory: objects.container
		items: string[] = []
		gun: string = 'revolver'
		group
		mesh
		target
		scene
		camera
		created = false
		constructor() {
			super(numbers.pawns);
			this.type = 'pawn';
			this.height = 24;
			this.inventory = new objects.container;
			this.inventory.add('money');
		}
		override create() {

			this.tiled();

			if (wasterSprite)
				this.size = pts.divide([90, 180], 5);
			else {
				this.size = pts.divide([50, 40], 1);
				this.subsize = [25, 40];
			}

			let shape = new sprite({
				binded: this,
				tuple: wasterSprite ? sprites.pchris : sprites.test100,
				cell: this.cell,
				orderBias: 1.3,
			});
			shape.rleft = -this.size[0] / 4;
			shape.show();

			if (!this.created) {
				this.created = true;

				// Set scale to increase pixels exponentially
				const scale = 10;

				// make wee guy target
				//this.group = new THREE.Group
				let size = pts.mult(this.size, scale);

				this.target = ren.make_render_target(size[0], size[1]);
				this.camera = ren.make_orthographic_camera(size[0], size[1]);

				this.scene = new Scene()
				//this.scene.background = new Color('#333');
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

			if (!wasterSprite) {
				const spritee = this.shape as sprite;
				spritee.material.map = this.target.texture;
			}

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
		override setup_context() {
			win.contextmenu.reset();
			if (this.type != 'you')
				win.contextmenu.options.options.push(["Talk to", () => {
					return pts.distsimple(you.wpos, this.wpos) < 1;
				}, () => {
					win.dialogue.talkingTo = this;
					win.dialogue.call_once();
				}]);
			if (this.pawntype == 'trader') {
				win.contextmenu.options.options.push(["Trade", () => {
					return pts.distsimple(you.wpos, this.wpos) < 1;
				}, () => { }]);
			}
			else {

				//win.contextmenu.options.options.push("See inventory");
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

			const gunBarrelHeight = 6;
			const gunBarrelSize = 3;

			const transforme = (thick, width, height, path) => {
				const sizes = [width + width + thick + width, height]
				let materials: any[] = [];

				let transforms: any[] = [];
				transforms.push(new Matrix3().setUvTransform( // left
					width * 2 / sizes[0], 0, thick / sizes[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // right
					width * 2 / sizes[0] + thick / sizes[0], 0, -thick / sizes[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // top
					width * 2 / sizes[0] + thick / sizes[0], 0, thick / sizes[0], thick / sizes[1], 0, 0, 1));
				transforms.push(new Matrix3()); // bottom ?
				transforms.push(new Matrix3().setUvTransform( // front
					0, 0, width / sizes[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // back
					width / sizes[0], 0, width / sizes[0], 1, 0, 0, 1));

				for (let i in transforms) {
					materials.push(SpriteMaterial({
						map: ren.load_texture(path, 0),
					}, {
						myUvTransform: transforms[i]
					}));
				}

				return materials;
			}

			let materialsBody = transforme(bodyThick, bodyWidth, bodyHeight, `tex/pawn/body.png`)
			let materialsArms = transforme(armsSize, armsSize, armsHeight, `tex/pawn/arms.png`)

			let boxHead = new BoxGeometry(headSize, headSize, headSize, 1, 1, 1);
			let materialHead = new MeshLambertMaterial({
				color: '#31362c'
			});

			let boxGasMask = new BoxGeometry(gasMaskSize, gasMaskSize, gasMaskSize, 1, 1, 1);
			let materialGasMask = new MeshLambertMaterial({
				color: '#31362c'
			});

			let boxBody = new BoxGeometry(bodyWidth, bodyHeight, bodyThick, 1, 1, 1);
			let materialBody = new MeshLambertMaterial({
				color: '#444139'
			});

			let boxArms = new BoxGeometry(armsSize, armsHeight, armsSize, 1, 1, 1);
			let materialArms = new MeshLambertMaterial({
				color: '#444139'
			});

			let boxLegs = new BoxGeometry(legsSize, legsHeight, legsSize, 1, 1, 1);
			let materialLegs = new MeshLambertMaterial({
				color: '#484c4c'
			});

			/*let boxGunGrip = new BoxGeometry(2, 5, 2, 1, 1, 1);
			let materialGunGrip = new MeshLambertMaterial({
				color: '#768383'
			});

			let boxGunBarrel = new BoxGeometry(2, gunBarrelHeight, 2, 1, 1, 1);
			let materialGunBarrel = new MeshLambertMaterial({
				color: '#768383'
			});*/


			this.meshes.head = new Mesh(boxHead, materialHead);
			this.meshes.gasMask = new Mesh(boxGasMask, materialGasMask);
			this.meshes.body = new Mesh(boxBody, materialBody);

			this.meshes.arml = new Mesh(boxArms, materialArms);
			this.meshes.armr = new Mesh(boxArms, materialArms);

			this.meshes.legl = new Mesh(boxLegs, materialLegs);
			this.meshes.legr = new Mesh(boxLegs, materialLegs);

			/*this.meshes.gungrip = new Mesh(boxGunGrip, materialGunGrip);
			this.meshes.gunbarrel = new Mesh(boxGunBarrel, materialGunBarrel);*/

			this.groups.head = new Group;
			this.groups.gasMask = new Group;
			this.groups.body = new Group;
			this.groups.arml = new Group;
			this.groups.armr = new Group;
			this.groups.legl = new Group;
			this.groups.legr = new Group;
			this.groups.ground = new Group;

			/*this.groups.gungrip = new Group;
			this.groups.gunbarrel = new Group;*/

			this.groups.head.add(this.meshes.head);
			this.groups.gasMask.add(this.meshes.gasMask);
			this.groups.body.add(this.meshes.body);
			this.groups.arml.add(this.meshes.arml);
			this.groups.armr.add(this.meshes.armr);
			this.groups.legl.add(this.meshes.legl);
			this.groups.legr.add(this.meshes.legr);

			this.groups.head.add(this.groups.gasMask);

			/*this.groups.gungrip.add(this.meshes.gungrip);
			this.groups.gunbarrel.add(this.meshes.gunbarrel);*/

			/*this.groups.gungrip.add(this.groups.gunbarrel);
			this.groups.armr.add(this.groups.gungrip);*/

			this.groups.body.add(this.groups.head);
			this.groups.body.add(this.groups.arml);
			this.groups.body.add(this.groups.armr);
			this.groups.body.add(this.groups.legl);
			this.groups.body.add(this.groups.legr);
			this.groups.ground.add(this.groups.body);

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

			/*this.groups.gungrip.position.set(0, -armsHeight, 0);
			this.meshes.gungrip.rotation.set(Math.PI / 2, 0, 0);
			this.meshes.gunbarrel.position.set(0, -gunBarrelHeight / 2, 0);*/

			this.groups.legl.position.set(-legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legl.position.set(0, -legsHeight / 2, 0);

			this.groups.legr.position.set(legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legr.position.set(0, -legsHeight / 2, 0);

			this.groups.ground.position.set(0, -bodyHeight * 1.0, 0);
			//mesh.rotation.set(Math.PI / 2, 0, 0);

			this.scene.add(this.groups.ground);

			const loadGunAgain = false;
			if (loadGunAgain) {
				const gun = collada.load_model('collada/revolver', (model) => {
					model.rotation.set(0, 0, Math.PI / 2);
					model.position.set(0, -armsHeight + armsSize / 2, 0);
					this.groups.armr.add(model);
				});
			}

		}
		render() {
			ren.renderer.setRenderTarget(this.target);
			ren.renderer.clear();
			ren.renderer.render(this.scene, this.camera);
		}
		aimTarget: vec2 = [0, 0]
		move() {

			let speed = 0.038 * ren.delta * 60;
			let x = 0;
			let y = 0;
			let wasd = true;

			if (this.type == 'you') {
				if (app.key('w')) {
					x += -1;
					y += -1;
				}
				if (app.key('s')) {
					x += 1;
					y += 1;
				}
				if (app.key('a')) {
					x += -1;
					y += 1;
				}
				if (app.key('d')) {
					x += 1;
					y += -1;
				}
				if (app.key('x')) {
					speed *= 5;
				}
			}

			if (this.type == 'you' && (!x && !y) && (app.button(0) >= 1 || app.key('shift')) && !win.hoveringClickableElement) {
				// Deduce x and y from click moving
				wasd = false;
				let mouse = wastes.gview.mwpos;
				let pos = this.wpos;
				pos = pts.add(pos, pts.divide([1, 1], 2));
				mouse = pts.subtract(mouse, pos);
				mouse[1] = -mouse[1];

				const dist = pts.distsimple(pos, wastes.gview.mwpos);

				if (dist > 0.5) {
					x = mouse[0];
					y = mouse[1];
				}
			}

			if (x || y) {
				// We have to deduce an angle and move that way
				// Unless we're aiming with a gun
				let angle = pts.angle([0, 0], [x, y]);
				this.angle = angle;
				x = speed * Math.sin(angle);
				y = speed * Math.cos(angle);
				if (!app.key('shift')) {
					this.walkSmoother += ren.delta * 5;
					this.try_move_to([x, y]);
				}
				else {
					this.walkSmoother -= ren.delta * 5;
				}
			}
			else if (this.type != 'you' && pts.together(this.aimTarget)) {

				let angle = pts.angle(this.wpos, this.aimTarget);
				//console.log(pts.subtract(this.wpos, this.aimTarget));

				this.angle = -angle + Math.PI;

				//this.wpos = this.aimTarget;
				//this.wpos = this.aimTarget;

				speed = 0.038 * ren.delta * 30;

				x = speed * Math.sin(this.angle);
				y = speed * Math.cos(this.angle);
				this.walkSmoother += ren.delta * 5;

				//this.wpos = [x, y];
				this.try_move_to([x, y]);

				const dist = pts.distsimple(this.wpos, this.aimTarget);

				if (dist < 0.5) {
					this.aimTarget = [0, 0];
				}
			}
			else
				this.walkSmoother -= ren.delta * 5;

			if (this.type == 'you') {
				const sprite = this.shape as sprite;

				if (app.key('v') == 1) {
					wastes.FOLLOW_CAMERA = !wastes.FOLLOW_CAMERA;
				}
				if (wastes.FOLLOW_CAMERA) {
					this.wtorpos();
					this.update();
					wastes.gview.follow = this;
				}
				else {
					wastes.gview.follow = undefined;
				}
			}

			this.walkSmoother = wastes.clamp(this.walkSmoother, 0, 1);

		}
		animateBodyParts() {
			const legsSwoop = 0.8;
			const armsSwoop = 0.5;

			this.swoop += ren.delta * 2.75;

			const swoop1 = Math.cos(Math.PI * this.swoop);
			const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);

			this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
			this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
			this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
			this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
			this.groups.ground.rotation.y = -this.angle + Math.PI / 2;

			if (this.type == 'you' && app.key('shift')) {

				this.groups.armr.rotation.x = -Math.PI / 2;

				if (app.button(0) == 1) {
					console.log('shoot');

					for (let obj of lod.ggrid.all) {
						const objected = obj as objects.objected;
						if (objected.isObjected) {
							const test = objected.tileBound.ray(
								{
									dir: [Math.sin(this.angle), Math.cos(this.angle)],
									org: this.wpos
								});
							if (test) {
								console.log('we hit something');
								objected.onhit();
							}
						}
					}
					/*let pos = this.wpos;
					let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
					let at = sector.stacked(pos);
					for (let obj of at) {
						if (obj.type == 'you') {
							wastes.HIDE_ROOFS = true;
							break;
						}
					}*/

				}
				//
			}

			this.render();
		}
		mousing = false
		swoop = 0
		angle = 0
		walkSmoother = 1
		randomWalker = 0
		nettick() {
			
			if (!pts.together(this.netwpos))
				this.netwpos = this.wpos;

			// tween netwpos into wpos
			let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), .05);
			this.wpos = pts.add(this.wpos, tween);

			const movement = pts.together(pts.abs(tween));
			if (movement > 0.005) {
				//console.log('movement > 0.25');
				
				this.walkSmoother = 1;
			}
			else
			{
				this.walkSmoother = 0;
			}
			
		}
		override tick() {

			if (!this.shape)
				return;

			this.make();

			let posr = pts.round(this.wpos);

			if (this.type != 'you' && this.walkArea) {
				if (this.randomWalker++ > 60 * 4) {
					const target = this.walkArea.random_point();
					this.aimTarget = target;
					//this.try_move_to(target);
					//console.log('wee', target);
					//this.wpos = target;
					this.randomWalker = 0;
				}
			}

			if (this.type == 'you') {
				/*
				if (this.mousedSquare(wastes.gview.mrpos) && !this.mousing) {
					this.mousing = true;
					//this.shape.mesh.material.color.set('green');
					console.log('mover');
					win.character.anchor = this;
					win.character.toggle(this.mousing);
				}
				else if (!this.mousedSquare(wastes.gview.mrpos) && this.mousing)
				{
					this.mousing = false;
					win.character.toggle(this.mousing);
				}
				*/

				let containers: objects.objected[] = [];
				let pawns: pawns.pawn[] = [];
				for (let y = -1; y <= 1; y++) {
					for (let x = -1; x <= 1; x++) {
						let pos = pts.add(posr, [x, y]);
						let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
						let at = sector.stacked(pos);
						for (let obj of at) {
							if (obj.type == 'crate') {
								containers.push(obj as objects.objected);
							}
							if (obj.type == 'pawn') {
								pawns.push(obj as pawns.pawn);
							}
						}
					}
				}

				containers.sort((a, b) => pts.distsimple(this.wpos, a.wpos) < pts.distsimple(this.wpos, b.wpos) ? -1 : 1)
				pawns.sort((a, b) => pts.distsimple(this.wpos, a.wpos) < pts.distsimple(this.wpos, b.wpos) ? -1 : 1)

				/*if (containers.length && pts.distsimple(containers[0].wpos, this.wpos) < 1.0) {
					win.container.call(true, containers[0]);
				}
				else
					win.container.call(false);*/

				if (pawns.length && pts.distsimple(pawns[0].wpos, this.wpos) < 1.5) {
					//win.contextmenu.focus = pawns[0];
				}

			}

			this.move();

			this.animateBodyParts();

			this.tiled();
			//this.tile?.paint();
			this.sector?.swap(this);

			// shade the pawn

			let color = [1, 1, 1, 1] as vec4;

			const sprite = this.shape as sprite;

			// We could have been nulled due to a hide, dispose
			if (sprite) {

				if (this.type != 'you' && this.mousedSquare(wastes.gview.mrpos2) /*&& !this.mousing*/) {
					this.mousing = true;
					sprite.material.color.set('#c1ffcd');
					//console.log('mover');
					if (this.type != 'you') {
						win.contextmenu.focus = this;
					}
					//win.character.anchor = this;
					//win.character.toggle(this.mousing);
				}
				else if (!this.mousedSquare(wastes.gview.mrpos2) && this.mousing) {
					if (win.contextmenu.focus == this)
						win.contextmenu.focus = undefined;
					//sprite.material.color.set('white');
					this.mousing = false;
					//win.character.toggle(this.mousing);
				}
				else if (!this.mousing && !this.tile!.hasDeck) {
					color = shadows.calc(color, pts.round(this.wpos));
					sprite.material.color.setRGB(color[0], color[1], color[2]);
				}
				else {
					sprite.material.color.set('white');
				}
			}

			this.stack(['pawn', 'you', 'leaves', 'door', 'roof', 'falsefront', 'panel']);
			super.update();
		}
		//tick() {
		//}
	}


}

export default pawns;