import app from "./app";
import lod, { numbers } from "./lod";

import objects from "./objects";
import pts from "./pts";
import sprite from "./sprite";
import sprites from "./sprites";
import tiles from "./tiles";


export namespace pawn {

	export var you: pawn | undefined = undefined;

	export const placeAtMouse = false;

	export function make() {
		let pos: vec2 = [44, 44];
		let paw = new pawn();
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
			this.size = [24, 53];
			let tuple = sprites.pchris;
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
		override tick() {

			const moveSideways = true;
			const moveMath = true;

			/*if (!moveSideways) {
				const speed = 0.05;
				if (app.key('arrowup'))
					this.try_move_to([0, speed]);
				if (app.key('arrowdown'))
					this.try_move_to([0, -speed]);
				if (app.key('arrowleft'))
					this.try_move_to([-speed, 0]);
				if (app.key('arrowright'))
					this.try_move_to([speed, 0]);
			}

			if (moveSideways) {
				const vertSpeed = 0.05;
				const horzSpeed = 0.05;
				if (app.key('arrowup')) {
					this.try_move_to([-vertSpeed / 2, vertSpeed / 2]);
				}
				if (app.key('arrowdown')) {
					this.try_move_to([vertSpeed / 2, -vertSpeed / 2]);
				}
				if (app.key('arrowleft')) {
					this.try_move_to([-horzSpeed / 2, -horzSpeed / 2]);
				}
				if (app.key('arrowright')) {
					this.try_move_to([horzSpeed / 2, horzSpeed / 2]);
				}
			}
			*/
			if (moveMath) {
				let speed = 0.038;
				let x = 0;
				let y = 0;
				if (app.key('arrowup')) {
					x += -1;
					y += -1;
				}
				if (app.key('arrowdown')) {
					x += 1;
					y += 1;
				}
				if (app.key('arrowleft')) {
					x += -1;
					y += 1;
				}
				if (app.key('arrowright')) {
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
			this.stack(['leaves', 'door']);
			super.update();
		}
		//tick() {
		//}
	}


}

export default pawn;