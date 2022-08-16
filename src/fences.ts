import { numbers } from "./lod";
import { objects } from "./wastes";
import sprite from "./sprite";
import sprites from "./sprites";

export namespace fences {
	export class fence extends objects.objected {
		static camera
		static target
		static made = false
		constructor() {
			super(numbers.walls);
			this.type = 'wall';
			this.height = 24;
		}
		override create() {
			this.tiled();
			this.size = [24, 30];
			return;
			this.cell = [255 - this.pixel!.arrayRef[3], 0];
			let tuple = sprites.dscrappywalls;
			let shape = new sprite({
				binded: this,
				tuple: sprites.dfence,
				cell: this.cell,
				orderBias: .6,
			});

			fence.make();
			this.stack();
		}
		static make() {
			if (!this.made) {
				this.made = true;

				const barWidth = 2.5;
				const barHeight = 4;
				const barLength = 2.5;
			}
		}
	}
}

export default fences;
