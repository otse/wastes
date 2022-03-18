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
		let pos: vec2 = [38, 44];
		let paw = new pawn();
		paw.wpos = pos;
		you = paw;
		lod.add(paw);
	}

	export class pawn extends objects.objected {
		constructor() {
			super(numbers.pawns);
			this.type = 'wall';
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
		override update() {
			const speed = 0.05;

			if (app.key('arrowup'))
				this.wpos = pts.add(this.wpos, [0, speed]);
			if (app.key('arrowdown'))
				this.wpos = pts.add(this.wpos, [0, -speed]);
			if (app.key('arrowleft'))
				this.wpos = pts.add(this.wpos, [-speed, 0]);
			if (app.key('arrowright'))
				this.wpos = pts.add(this.wpos, [speed, 0]);

			this.stack(['tree leaves', 'door']);
			super.update();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		override tick() {
			//console.log('tt');
			if (placeAtMouse)
				this.wpos = tiles.hovering?.wpos || [38, 44];
			this.sector?.swap(this);
			this.update();
			//this.update();
		}
		//tick() {
		//}
	}


}

export default pawn;