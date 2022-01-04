import lod from "./lod";
import Sprite from "./sprite";
import wastes from "./wastes";
import pts from "./pts";
import hooks from "./hooks";

namespace testing_chamber {

	export var started = false;

	export function start() {
		console.log(' start testing chamber ');

		console.log('placing squares on game area that should take up 1:1 pixels on screen...');
		console.log('...regardless of your os or browsers dpi setting');

		wastes.view.zoom = 1;
		wastes.view.wpos = [0, 0];
		wastes.view.rpos = lod.unproject([0, 0]);

		hooks.register('sectorShow', (x) => {
			console.log('(testing chamber) show sector');
			return false;
		});

		hooks.register('viewClick', (view) => {
			console.log(' asteorid! ')
			let ping = new Asteroid;
			ping.wpos = pts.add(wastes.view.mwpos, [-1, -1]);
			lod.add(ping);
			return false;
		});

		lod.SectorSpan = 4;
		lod.grid = new lod.Grid(1, 1);
		lod.project = function(unit: vec2) { return pts.mult(unit, 100); }
		lod.unproject = function(pixel: vec2) { return pts.divide(pixel, 100); }

		for (let y = 0; y < 10; y++) {
			for (let x = 0; x < 10; x++) {
				let square = Square.make();
				square.wpos = [x, y];
				lod.add(square);
			}
		}

		started = true;
	}

	export function tick() {
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
				bindObj: this,
				img: 'tex/pngwing.com'
			});
		}
		tick() {
			this.wpos[0] += this.float[0];
			this.wpos[1] -= this.float[1];
			this.rz += this.rate;
			super.update();
			this.sector?.swap(this);
		}
	}

	export class Square extends lod.Obj {
		static make() {
			return new Square;
		}
		constructor() {
			super(undefined);
			console.log('square');
		}
		create() {
			console.log('create');
			this.size = [100, 100];
			let shape = new Sprite({
				bindObj: this,
				img: 'tex/test100'
			});
		}
		tick() {
			let shape = this.shape as Sprite;
			if (this.mousedSquare(wastes.view.mrpos))
				shape.mesh.material.color.set('green');
			else
				shape.material.color.set('white');
		}
	}
}

export default testing_chamber;