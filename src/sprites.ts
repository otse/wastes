import { Matrix3 } from "three";
import pts from "./pts";

export namespace sprites {

	export type tuple = [size: vec2, sprite: vec2, padding: number, path: string]

	export function start() {

	}

	export const test100: tuple = [[100, 100], [100, 100], 0, 'tex/test100']
	export const asteroid: tuple = [[512, 512], [512, 512], 0, 'tex/pngwing.com']
	export const shrubs: tuple = [[24, 15], [24, 15], 0, 'tex/shrubs']
	export const dtile: tuple = [[24, 12], [24, 12], 0, 'tex/dtile']
	export const dtile4: tuple = [[24, 17], [24, 17], 0, 'tex/dtileup4']
	export const dwall: tuple = [[96, 40], [24, 40], 1, 'tex/dwalls']
	export const dwallswood: tuple = [[96, 40], [24, 40], 1, 'tex/dwallswood']
	export const ddoorwood: tuple = [[96, 40], [24, 40], 1, 'tex/ddoor']

	export function get_uv_transform(cell: vec2, tuple: tuple) {
		let divide = pts.divides(tuple[1], tuple[0]);
		let offset = pts.mults(divide, cell);
		let repeat = divide;
		let center = [0, 1];
		let mat = new Matrix3;
		mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
		return mat;
	};
};

export default sprites;