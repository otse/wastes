import lod from "./lod";
import Sprite from "./sprite";
import wastes from "./wastes";
import pts from "./pts";
import hooks from "./hooks";

namespace testing_chamber {

	export function start() {
		console.log(' start testing chamber ');

		console.log('placing squares on game area that should take up 1:1 pixels on screen...');
		console.log('...regardless of your os or browsers dpi setting');

		for (let y = 0; y < 50; y++) {
			for (let x = 0; x < 50; x++) {
				let conversion = 100 / lod.Unit;
				let square = TestingSquare.make();
				square.wpos = [x * conversion, y * conversion];
				square.create();
				wastes.view.add(square);
			}
		}

		hooks.register('viewClick', (view) => {
			console.log(' asteorid! ')
			let ping = new Asteroid
			ping.wpos = pts.add(wastes.view.mwpos, [-1, -1])
			ping.create()
			wastes.view.add(ping)
			return false
		});
	}

	export class Asteroid extends lod.Obj {
		static slowness = 12;
		rate: number
		float: vec2
		constructor() {
			super(undefined);
			this.size = [100, 100];
			this.float = pts.make(
				(Math.random() - 0.5) / Asteroid.slowness,
				(Math.random() - 0.5) / Asteroid.slowness
			);
			this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
		}
		create() {
			this.size = [200, 200];
			let shape = new Sprite({
				bind: this,
				img: 'tex/pngwing.com'
			});
			shape.dimetric = false;
		}
		tick() {
			this.wpos[0] += this.float[0];
			this.wpos[1] -= this.float[1];
			this.rz += this.rate;
			super.update();
			this.sector?.swap(this);
		}
	}

	export class TestingSquare extends lod.Obj {
		static make() {
			return new TestingSquare;
		}
		constructor() {
			super(undefined);
		}
		create() {
			this.size = [100, 100];
			let shape = new Sprite({
				bind: this,
				img: 'tex/test100'
			});
		}
		tick() {
			let shape = this.shape as Sprite;
			if (this.moused(wastes.view.mrpos))
				shape.mesh.material.color.set('green');
			else
				shape.material.color.set('white');
		}
	}
}

export default testing_chamber;