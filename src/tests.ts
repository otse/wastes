import lod from "./lod";
import wastes from "./wastes";
import ren from "./renderer";
import Sprite from "./sprite";
import sprites from "./sprites";


export namespace tests {
	export function start()
	{
		BigMouseRock.start();
	}
	
	export function tick()
	{
		BigMouseRock.tick();
	}

	export class BigMouseRock {
		static obj: lod.Obj;
		static start() {
			const mouseAsteroid = false;
			if (mouseAsteroid) {
				this.obj = new lod.Obj({});
				this.obj.shape = new Sprite({ binded: this.obj, tuple: sprites.asteroid });
				this.obj.show();
				let sprite = this.obj.shape as Sprite;
				ren.scene.add(sprite.mesh);
			}
		}
		static tick() {
			if (this.obj) {
				this.obj.rpos = wastes.view.mrpos;
				this.obj.shape?.update();
				let sprite = this.obj.shape as Sprite;
			}
		}
	}
}

export default tests;