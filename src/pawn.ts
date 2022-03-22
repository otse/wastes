import { default as THREE, Scene, Color, Group, AxesHelper, Mesh, BoxGeometry, DirectionalLight, AmbientLight, PlaneBufferGeometry, MeshLambertMaterial, Shader, Matrix3, Vector2 } from "three";

import app from "./app";
import lod, { numbers } from "./lod";

import objects from "./objects";
import pts from "./pts";
import ren from "./renderer";
import sprite from "./sprite";
import sprites from "./sprites";
import tiles from "./tiles";
import wastes from "./wastes";
import win from "./win";


export namespace pawns {

	export var you: pawn | undefined = undefined;

	export const placeAtMouse = false;

	export function make() {
		let pos: vec2 = [44, 44];
		let paw = new pawn();
		paw.type = 'you';
		paw.wpos = pos;
		you = paw;
		lod.add(paw);
	}

	export function handle() {

	}

	export class pawn extends objects.objected {
		group
		mesh
		target
		scene
		camera
		constructor() {
			super(numbers.pawns);
			this.type = 'pawn';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = pts.divide([100, 100], 2);
			let shape = new sprite({
				binded: this,
				tuple: sprites.test100,
				cell: this.cell,
				order: 1.5,
			});

			// make wee guy target
			this.group = new THREE.Group
			let w = 100, h = 100;
			this.target = ren.make_render_target(w, h);
			this.camera = ren.ortographic_camera(w, h);
			this.scene = new Scene()
			this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
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
		groups: any = {}
		meshes: any = {}
		made = false
		make() {
			if (this.made)
				return;
			this.made = true;

			const mult = 1;

			const headSize = 10;

			let boxHead = new BoxGeometry(headSize * mult, headSize * mult, headSize * mult, 1, 1, 1);
			let materialHead = new MeshLambertMaterial({
				color: '#c08e77'
			});

			let boxBody = new BoxGeometry(14 * mult, 24 * mult, 8 * mult, 1, 1, 1);
			let materialBody = new MeshLambertMaterial({
				color: '#07aaa9'
			});

			let boxLegs = new BoxGeometry(6 * mult, 24 * mult, 6 * mult, 1, 1, 1);
			let materialLegs = new MeshLambertMaterial({
				color: '#433799'
			});

			this.meshes.head = new Mesh(boxHead, materialHead);
			this.meshes.body = new Mesh(boxBody, materialBody);

			this.meshes.legl = new Mesh(boxLegs, materialLegs);
			this.meshes.legr = new Mesh(boxLegs, materialLegs);

			this.groups.head = new Group;
			this.groups.body = new Group;
			this.groups.legl = new Group;
			this.groups.legr = new Group;
			this.groups.ground = new Group;

			this.groups.head.add(this.meshes.head);
			this.groups.body.add(this.meshes.body);
			this.groups.legl.add(this.meshes.legl);
			this.groups.legr.add(this.meshes.legr);

			this.groups.body.add(this.groups.head);
			this.groups.body.add(this.groups.legl);
			this.groups.body.add(this.groups.legr);
			this.groups.ground.add(this.groups.body);

			this.groups.head.position.set(0, 24 * mult / 2 + headSize / 2 * mult, 0);
			this.groups.body.position.set(0, 24 * mult, 0);

			this.groups.legl.position.set(-5 * mult, -12 * mult, 0);
			this.meshes.legl.position.set(0, -12 * mult, 0);
			
			this.groups.legr.position.set(5 * mult, -12 * mult, 0);
			this.meshes.legr.position.set(0, -12 * mult, 0);
			
			this.groups.ground.position.set(-24, -24 * mult, 0);
			//mesh.rotation.set(Math.PI / 2, 0, 0);

			this.scene.add(this.groups.ground);
		}
		render() {

			this.make();

			ren.renderer.setRenderTarget(this.target);
			ren.renderer.clear();
			ren.renderer.render(this.scene, this.camera);

			const sprite = this.shape as sprite;

			sprite.material.map = this.target.texture;

		}
		mousing = false
		containing: objects.objected
		val0 = 0
		val1 = 0
		angle
		override tick() {
			
			const swoopMod = 0.7;
			this.render();

			this.val0 += 0.01;
			const swoop1 = Math.cos(Math.PI * this.val0);
			const swoop2 = Math.cos(Math.PI * this.val0 - Math.PI );
			this.groups.legl.rotation.x = swoop1 * swoopMod;
			this.groups.legr.rotation.x = swoop2 * swoopMod;
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
				for (let y = -1; y <= 1; y++)
					for (let x = -1; x <= 1; x++) {
						let pos = pts.add(posr, [x, y]);
						let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
						let at = sector.stacked(pos);
						for (let obj of at) {
							if (obj.type == 'crate') {
								containers.push(obj as objects.objected);
							}
						}
					}

				containers.sort((a, b) => pts.distsimple(this.wpos, a.wpos) < pts.distsimple(this.wpos, b.wpos) ? -1 : 1)

				if (containers.length) {
					win.container.call(true, containers[0]);
				}
				else
					win.container.call(false);

			}

			const moveMath = true;

			if (moveMath) {
				let speed = 0.038 * ren.delta;
				let x = 0;
				let y = 0;
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
				if (x || y) {
					let angle = pts.angle([0, 0], [x, y]);
					x = speed * Math.sin(angle);
					y = speed * Math.cos(angle);
					this.angle = angle;
					this.try_move_to([x, y]);
				}
			}

			if (placeAtMouse)
				this.wpos = tiles.hovering?.wpos || [38, 44];
			this.tiled();
			//this.tile?.paint();
			this.sector?.swap(this);
			this.stack(['leaves', 'door', 'roof']);
			super.update();
		}
		//tick() {
		//}
	}


}

export default pawns;