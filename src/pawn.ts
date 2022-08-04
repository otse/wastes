import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";

import app from "./app";
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

	export const placeAtMouse = false;

	export function make_you() {
		let pos: vec2 = [44, 44];
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
		pawntype = 'generic'
		trader = false
		inventory: objects.container
		items: string[] = []
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
			else
				this.size = pts.divide([50, 75], 2);

			let shape = new sprite({
				binded: this,
				tuple: wasterSprite ? sprites.pchris : sprites.test100,
				cell: this.cell,
				orderBias: 1.3,
			});

			if (!this.created) {

				// set scene scale to 1, 1, 1 and w h both to 50
				// for a 1:1 pawn, otherwise set to 2, 2, 2 and 100

				const scale = 1;
				this.created = true;
				// make wee guy target
				//this.group = new THREE.Group
				let w = this.size[0] * scale;
				let h = this.size[1] * scale;
				this.target = ren.make_render_target(w, h);
				this.camera = ren.ortographic_camera(w, h);
				this.scene = new Scene()
				//this.scene.background = new Color('#333');
				this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
				this.scene.position.set(0, 0, 0);
				this.scene.scale.set(scale, scale, scale);
				//this.scene.background = new Color('salmon');

				let amb = new AmbientLight('white');
				this.scene.add(amb);

				let sun = new DirectionalLight(0xffffff, 0.5);
				// left up right
				sun.position.set(-wastes.size, wastes.size * 1.5, wastes.size / 2);
				//sun.add(new AxesHelper(100));

				this.scene.add(sun);
				this.scene.add(sun.target);
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

			const mult = .5;

			const headSize = 11 * mult;
			const gasMaskSize = 5 * mult;
			const legsSize = 8 * mult;
			const legsHeight = 25 * mult;
			const legsUp = 5 * mult;
			const armsSize = 6 * mult;
			const armsHeight = 22 * mult;
			const armsAngle = .0;
			const bodyThick = 10 * mult;
			const bodyWidth = 16 * mult;
			const bodyHeight = 24 * mult;

			/*const bodyTexture = [29, 12];
			let materialsBody: any[] = [];
			{
				let mat = new Matrix3;

				let transforms: any[] = [];
				transforms.push(new Matrix3().setUvTransform( // left
					bodyWidth * 2 / bodyTexture[0], 0, bodyThick / bodyTexture[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // right
					bodyWidth * 2 / bodyTexture[0] + bodyThick / bodyTexture[0], 0, -bodyThick / bodyTexture[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // top
					bodyWidth * 2 / bodyTexture[0] + bodyThick / bodyTexture[0], 0, bodyWidth / bodyTexture[0], bodyThick / bodyTexture[1], 0, 0, 1));
				transforms.push(new Matrix3()); // bottom ?
				transforms.push(new Matrix3().setUvTransform( // front
					0, 0, bodyWidth / bodyTexture[0], 1, 0, 0, 1));
				transforms.push(new Matrix3().setUvTransform( // back
					bodyWidth / bodyTexture[0], 0, bodyWidth / bodyTexture[0], 1, 0, 0, 1));

				for (let i in transforms) {
					materialsBody.push(SpriteMaterial({
						map: ren.load_texture(`tex/pawn/body.png`, 0),
					}, {
						myUvTransform: transforms[i]
					}));
				}
			}*/

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

			this.groups.head.position.set(0, bodyHeight / 2 + headSize / 2, 0);
			this.groups.gasMask.position.set(0, -headSize / 2, headSize / 1.5);
			this.groups.gasMask.rotation.set(-Math.PI / 4, 0, 0);
			this.groups.body.position.set(0, bodyHeight, 0);

			this.groups.arml.position.set(-bodyWidth / 2 - armsSize / 2, bodyHeight / 2, 0);
			this.groups.arml.rotation.set(0, 0, -armsAngle);
			this.meshes.arml.position.set(0, -armsHeight / 2, 0);

			this.groups.armr.position.set(bodyWidth / 2 + armsSize / 2, bodyHeight / 2, 0);
			this.groups.armr.rotation.set(0, 0, armsAngle);
			this.meshes.armr.position.set(0, -armsHeight / 2, 0);

			this.groups.legl.position.set(-legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legl.position.set(0, -legsHeight / 2, 0);

			this.groups.legr.position.set(legsSize / 2, -bodyHeight / 2, 0);
			this.meshes.legr.position.set(0, -legsHeight / 2, 0);

			this.groups.ground.position.set(0, -bodyHeight, 0);
			//mesh.rotation.set(Math.PI / 2, 0, 0);

			this.scene.add(this.groups.ground);
		}
		render() {

			this.make();

			ren.renderer.setRenderTarget(this.target);
			ren.renderer.clear();
			ren.renderer.render(this.scene, this.camera);

			const sprite = this.shape as sprite;

			if (!wasterSprite)
				sprite.material.map = this.target.texture;

		}
		mousing = false
		swoop = 0
		angle = 0
		animSpeed = 1
		override tick() {

			const sprite = this.shape as sprite;

			if (this.mousedSquare(wastes.gview.mrpos2) && !this.mousing) {
				this.mousing = true;
				sprite.material.color.set('#c1ffcd');
				console.log('mover');
				if (this.type != 'you') {
					win.contextmenu.focus = this;
				}
				//win.character.anchor = this;
				//win.character.toggle(this.mousing);
			}
			else if (!this.mousedSquare(wastes.gview.mrpos2) && this.mousing) {
				if (win.contextmenu.focus == this)
					win.contextmenu.focus = undefined;
				sprite.material.color.set('white');
				this.mousing = false;
				//win.character.toggle(this.mousing);
			}


			const legsSwoop = 0.8;
			const armsSwoop = 0.5;
			this.render();

			this.swoop += 0.04;
			const swoop1 = Math.cos(Math.PI * this.swoop);
			const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);
			this.groups.legl.rotation.x = swoop1 * legsSwoop * this.animSpeed;
			this.groups.legr.rotation.x = swoop2 * legsSwoop * this.animSpeed;
			this.groups.arml.rotation.x = swoop2 * armsSwoop * this.animSpeed;
			this.groups.armr.rotation.x = swoop1 * armsSwoop * this.animSpeed;
			this.groups.ground.rotation.y = -this.angle + Math.PI / 2;

			let posr = pts.round(this.wpos);

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

			const moveMath = true;

			if (moveMath) {
				let speed = 0.038 * ren.delta;
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
						speed *= 10;
					}
					if ((!x && !y) && app.button(0) >= 1) {
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
						//move = true;
					}
				}
				if (x || y) {
					let angle = pts.angle([0, 0], [x, y]);
					if (!win.mousingClickable || wasd) {
						this.animSpeed += 0.1;
						this.angle = angle;
						x = speed * Math.sin(angle);
						y = speed * Math.cos(angle);
						this.try_move_to([x, y]);
					}
					else
						this.animSpeed = 0;
				}
				else
					this.animSpeed -= 0.1;
				// Normalize
				if (this.animSpeed > 1)
					this.animSpeed = 1;
				else if (this.animSpeed < 0) {
					this.animSpeed = 0;
					this.swoop = 0;
				}
			}

			if (placeAtMouse)
				this.wpos = tiles.hovering?.wpos || [38, 44];
			this.tiled();
			//this.tile?.paint();
			this.sector?.swap(this);

			// shade the pawn
			let color = [1, 1, 1, 1] as vec4;
			color = shadows.calc(color, pts.round(this.wpos));
			
			sprite.material.color.setRGB(color[0], color[1], color[2]);
			
			this.stack(['pawn', 'you', 'leaves', 'door', 'roof', 'falsefront', 'panel']);
			super.update();
		}
		//tick() {
		//}
	}


}

export default pawns;