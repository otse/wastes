import { THREE, Group, Mesh, Shader, BoxGeometry, ConeGeometry, CylinderGeometry, Matrix3, Matrix4, MeshLambertMaterial, MeshBasicMaterial, MeshBasicMaterialParameters, Color } from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";

import lod, { Numbers } from "./lod";
import wastes from "./wastes";
import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import tiles from "./tiles";
import hooks from "./hooks";
import Sprite from "./sprite";

namespace objectmaps {

	const mapSpan = 100

	export var objectmap: ObjectMap
	export var treemap: ObjectMap
	export var colormap: ObjectMap

	export function register() {

		console.log(' objects register ');

		objectmap = new ObjectMap('objectmap');
		treemap = new ObjectMap('treemap');
		colormap = new ObjectMap('colormap');

		/*lod.SectorHooks.OnShow.register((sector: lod.Sector) => {
			objectmap.loop(sector.small, (pos, color) => {
				if (color[0] == 254) {
					let wall = new Wall()
					wall.wpos = [pos[0], pos[1]]
					wests.view.add(wall)
				}
			})
			return false
		})*/
		const treeTreshold = 50;

		hooks.register('sectorCreate', (x) => {
			let sector = x as lod.Sector
			pts.func(sector.small, (pos) => {
				const color = treemap.bit(pos);
				if (color[0] > treeTreshold) {					
					let shrubs = new Shrubs();
					shrubs.wpos = pos;
					shrubs.create();
					wastes.view.add(shrubs);
					console.log('shrubs');
					
				}
				return false;
			})
			return false;
		})

		hooks.register('sectorCreate', (x) => {
			let sector = x as lod.Sector
			pts.func(sector.small, (pos) => {
				const clr = objectmap.bit(pos)
				if (clr[0] == 255 && clr[1] == 255 && clr[2] == 255) {
					console.log('make a shack');
					let shack = new House();
					shack.wpos = pos;
					shack.create();
					wastes.view.add(shack);
				}
				return false;
			})
			return false;
		})
	}

	export function start() {

		console.log(' objects start ');

	}

	export class ObjectMap {
		readonly bits: vec4[][] = []
		canvas
		ctx
		constructor(id: string) {
			var img = document.getElementById(id) as any;
			this.canvas = document.createElement('canvas')!;
			this.canvas.width = mapSpan;
			this.canvas.height = mapSpan;
			this.ctx = this.canvas.getContext('2d')!;
			//this.ctx.scale(1, 1);
			this.ctx.drawImage(img, 0, 0, img.width, img.height);
			this.process();
		}
		bit(pos: vec2): vec4 {
			return this.bits[pos[1]] ? this.bits[pos[1]][pos[0]] || [0, 0, 0, 0] : [0, 0, 0, 0];
		}
		process() {
			for (let y = 0; y < mapSpan; y++) {
				this.bits[y] = [];
				for (let x = 0; x < mapSpan; x++) {
					const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
					if (this.bits[y] == undefined)
						this.bits[y] = [];
					this.bits[y][x] = data;
				}
			}
		}
	}

	export class House extends lod.Obj {
		constructor() {
			super(undefined);
		}
		create() {
			this.size = [20, 22];
			let shape = new Sprite({
				bind: this,
				img: 'tex/house',
				z: 2
			});
		}
		//tick() {
		//}
	}

	export class Shrubs extends lod.Obj {
		constructor() {
			super(undefined);
		}
		create() {
			this.size = [16, 14];
			let shape = new Sprite({
				bind: this,
				img: 'tex/shrubs',
				z: 1
			});
		}
		//tick() {
		//}
	}
}

export default objectmaps;