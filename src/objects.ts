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

namespace objects {

	const mapSpan = 100;

	export function register() {

		console.log(' objects register ');

		wastes.heightmap = new ColorMap('heightmap');
		wastes.objectmap = new ColorMap('objectmap');
		wastes.treemap = new ColorMap('treemap');
		wastes.colormap = new ColorMap('colormap');

		const treeTreshold = 50;

		hooks.register('sectorCreate', (x) => {
			let sector = x as lod.Sector
			pts.func(sector.small, (pos) => {
				let pixel = wastes.treemap.pixel(pos);
				if (pixel.array[0] > treeTreshold) {
					let shrubs = new Shrubs();
					shrubs.pixel = pixel;
					shrubs.wpos = pos;
					lod.add(shrubs);
				}
			})
			return false;
		})

		hooks.register('sectorCreate', (x) => {
			let sector = x as lod.Sector
			pts.func(sector.small, (pos) => {
				let pixel = wastes.objectmap.pixel(pos);
				if (pixel.is_white()) {
					let wall = new Wall();
					wall.pixel = pixel;
					wall.wpos = pos;
					lod.add(wall);
				}
			})
			return false;
		})
	}

	export function start() {

		console.log(' objects start ');

	}

	const zeroes: vec4 = [0, 0, 0, 0]

	class Pixel {
		constructor(
			public context: ColorMap,
			public pos: vec2,
			public array: vec4) {
		}
		left() {
			this.context.pixel(pts.add(this.pos, [-1, 0]));
		}
		right() {
			this.context.pixel(pts.add(this.pos, [1, 0]));
		}
		up() {
			this.context.pixel(pts.add(this.pos, [0, 1]));
		}
		down() {
			this.context.pixel(pts.add(this.pos, [0, -1]));
		}
		equals(vec: vec3) {
			return vec[0] == this.array[0] && vec[1] == this.array[1] && vec[2] == this.array[2];
		}
		is_black() {
			return this.equals([0, 0, 0]);
		}
		is_white() {
			return this.equals([255, 255, 255]);
		}
		purple_water() {
			return [63, 63, 127];
		}
	}

	export class ColorMap {
		readonly data: vec4[][] = []
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
		get(pos: vec2) {
			if (this.data[pos[1]])
				return this.data[pos[1]][pos[0]];
			return zeroes;
		}
		pixel(pos: vec2): Pixel {
			return new Pixel(this, pos, this.get(pos));
		}
		process() {
			for (let y = 0; y < mapSpan; y++) {
				this.data[y] = [];
				for (let x = 0; x < mapSpan; x++) {
					const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
					if (this.data[y] == undefined)
						this.data[y] = [];
					this.data[y][x] = data;
				}
			}
		}
	}

	export class TiledObj extends lod.Obj {
		pixel: Pixel | undefined
		constructor(x, y: Numbers.Tally) {
			super(x, y);
		}
		update(): void {
			if (this.shape) {
				const tile = tiles.get(this.wpos);
				if (tile)
					(<Sprite>this.shape).z = tile.z;
			}
			super.update();
		}
	}
	export class Wall extends TiledObj {
		constructor() {
			super(undefined, Numbers.Walls);
		}
		create() {
			this.size = [24, 40]; 
			let shape = new Sprite({
				bindObj: this,
				img: 'tex/dwall',
				orderOffset: .5
			});
		}
		adapt() {
			// change sprite to surrounding walls
		}
		//tick() {
		//}
	}

	export class Shrubs extends TiledObj {
		constructor() {
			super(undefined, Numbers.Trees);
		}
		create() {
			this.size = [24, 15];
			let shape = new Sprite({
				bindObj: this,
				img: 'tex/shrubs',
				orderOffset: .5
			});
		}

		//tick() {
		//}
	}
}

export default objects;