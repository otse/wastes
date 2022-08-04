import lod from "./lod";
import wastes from "./wastes";
import ren from "./renderer";
import sprite from "./sprite";
import sprites from "./sprites";


export namespace tests {
	export function start()
	{
		mouserock.start();
	}
	
	export function tick()
	{
		mouserock.tick();
	}

	export class mouserock {
		static obj: lod.obj;
		static start() {
			const mouseAsteroid = true;
			if (mouseAsteroid) {
				this.obj = new lod.obj();
				this.obj.shape = new sprite({ binded: this.obj, tuple: sprites.asteroid });
				//this.obj.show();
				//let daisy = this.obj.shape as sprite;
				//ren.scene.add(daisy.mesh);
			}
		}
		static tick() {
			if (this.obj) {
				this.obj.rpos = wastes.gview.mrpos;
				this.obj.shape?.update();
				let sprite = this.obj.shape as sprite;
			}
		}
	}
}

export default tests;