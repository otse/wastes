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

	export class pawn extends objects.objected {
		constructor() {
			super(numbers.pawns);
			this.type = 'pawn';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = pts.divide([19, 41], 1);
			let tuple = sprites.pchris_lowres;
			let shape = new sprite({
				binded: this,
				tuple: tuple,
				cell: this.cell,
				order: 1.5,
			});
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
		mousing = false
		containing: objects.objected
		override tick() {

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
				for (let x = -1; x <= 1; x++)
				{
					let pos = pts.add(posr, [x, y]);
					let sector = lod.ggalaxy.at(lod.ggalaxy.big(pos));
					let at = sector.stacked(pos);
					for (let obj of at) {						
						if (obj.type == 'crate')
						{
							containers.push(obj as objects.objected);
						}
					}
				}

				containers.sort((a, b) => pts.distsimple(this.wpos, a.wpos) < pts.distsimple(this.wpos, b.wpos) ? -1 : 1 )

				if (containers.length) {
					console.log(containers);
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