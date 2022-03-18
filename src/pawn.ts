import lod, { numbers } from "./lod";

import objects from "./objects";
import sprite from "./sprite";
import sprites from "./sprites";


export namespace pawn {

    export function make() {
        let pos: vec2 = [38, 44];
        let paw = new pawn();
        paw.wpos = pos;
		//lod.add(paw);
    }

    export class pawn extends objects.objected {
		constructor() {
			super(numbers.pawns);
			this.type = 'wall';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 50];
			let tuple = sprites.ddecidtree;
			let shape = new sprite({
				binded: this,
				tuple: tuple,
				cell: this.cell,
				order: .6,
			});
			this.stack();
		}
		adapt() {
			// change sprite to surrounding walls
		}
		//tick() {
		//}
	}
}

export default pawn;