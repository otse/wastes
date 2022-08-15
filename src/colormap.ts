import { THREE, Group, Mesh, Shader, BoxGeometry, ConeGeometry, CylinderGeometry, Matrix3, Matrix4, MeshLambertMaterial, MeshBasicMaterial, MeshBasicMaterialParameters, Color } from "three";

import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";

import lod, { numbers } from "./lod";
import wastes, { win, pawns } from "./wastes";
import ren from "./renderer";
import pts from "./pts";
import aabb2 from "./aabb2";
import tiles from "./tiles";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";
import app from "./app";

namespace colormap {

	export const mapSpan = 100;

	const zeroes: vec4 = [0, 0, 0, 0]

	export class pixel {
		constructor(
			public context: colormap,
			public pos: vec2,
			public arrayRef: vec4) {
				// Todo is array really a ref
		}
		left() {
			return this.context.pixel(pts.add(this.pos, [-1, 0]));
		}
		right() {
			return this.context.pixel(pts.add(this.pos, [1, 0]));
		}
		up() {
			return this.context.pixel(pts.add(this.pos, [0, 1]));
		}
		down() {
			return this.context.pixel(pts.add(this.pos, [0, -1]));
		}
		same(pixel: pixel) {
			return this.is_color(<vec3><unknown>pixel.arrayRef);
		}
		is_color(vec: vec3) {
			return vec[0] == this.arrayRef[0] && vec[1] == this.arrayRef[1] && vec[2] == this.arrayRef[2];
		}
		is_color_range(a: vec3, b: vec3) {
			return this.arrayRef[0] >= a[0] && this.arrayRef[0] <= b[0] &&
				this.arrayRef[1] >= a[1] && this.arrayRef[1] <= b[1] &&
				this.arrayRef[2] >= a[2] && this.arrayRef[2] <= b[2]
		}
		is_shallow_water() {
			return this.is_color([50, 50, 50]);
		}
		is_black() {
			return this.is_color([0, 0, 0]);
		}
		is_invalid_pixel() {
			return this.is_color([0, 0, 0]) && this.arrayRef[3] == 0;
		}
		is_white() {
			return this.is_color([255, 255, 255]);
		}
	}

	export class colormap {
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
		get(pos: vec2): vec4 | undefined {
			if (this.data[pos[1]])
				return this.data[pos[1]][pos[0]];
		}
		pixel(pos: vec2) {
			return new pixel(this, pos, this.get(pos) || [0, 0, 0, 0]);
		}
		process() {
			for (let y = 0; y < mapSpan; y++) {
				this.data[y] = [];
				for (let x = 0; x < mapSpan; x++) {
					const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
					//if (this.data[y] == undefined)
					//	this.data[y] = [];
					this.data[y][x] = data;
				}
			}
		}
	}
}

export default colormap;