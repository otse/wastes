import lod from "./lod";
import wests from "./wastes";
import ren from "./renderer";
import Sprite from "./sprite";


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
				this.obj.shape = new Sprite({ bind: this.obj, img: 'pngwing.com' });
				this.obj.show();
				let sprite = this.obj.shape as Sprite;
				ren.scene.add(sprite.mesh);
			}
		}
		static tick() {
			if (this.obj) {
				this.obj.rpos = wests.view.mrpos;
				this.obj.shape?.update();
				let sprite = this.obj.shape as Sprite;
			}
		}
	}
}

export default tests;