import { Matrix3 } from "three";
import pts from "./pts";

export namespace sprites {

	export type tuple = [totalSize: vec2, singleSize: vec2, padding: number, path: string]

	export function start() {

	}

	export const test100: tuple = [[100, 100], [100, 100], 0, 'tex/test100']
	export const asteroid: tuple = [[512, 512], [512, 512], 0, 'tex/pngwing.com']
	export const shrubs: tuple = [[24, 15], [24, 15], 0, 'tex/shrubs']
	export const dtile: tuple = [[24, 12], [24, 12], 0, 'tex/dtile']
	export const dtile4: tuple = [[24, 17], [24, 17], 0, 'tex/dtileup4']
	export const ddecidtree: tuple = [[24, 50], [24, 50], 0, 'tex/dtreetrunk']
	export const dtreeleaves: tuple = [[24, 31], [24, 31], 0, 'tex/dtreeleaves']
	export const dgrass: tuple = [[96, 30], [24, 31], 0, 'tex/dgrass']
	export const dwheat: tuple = [[96, 30], [24, 31], 0, 'tex/dwheat']
	export const dswamptiles: tuple = [[96, 30], [24, 30], 0, 'tex/dswamptiles']
	export const dgraveltiles: tuple = [[96, 30], [24, 30], 0, 'tex/dgraveltiles']
	export const dtilesand: tuple = [[24, 17], [24, 17], 0, 'tex/dtilesand']
	export const dwall: tuple = [[96, 40], [24, 40], 0, 'tex/dwalls']
	export const ddeck: tuple = [[72, 17], [24, 17], 0, 'tex/ddeck']
	export const dtree1: tuple = [[121, 147], [121, 147], 0, 'tex/dtree1b']
	export const droof: tuple = [[72, 17], [24, 17], 0, 'tex/droof']
	export const dcrate: tuple = [[24, 40], [24, 40], 0, 'tex/dcrate']
	export const drustywalls: tuple = [[288, 40], [24, 40], 0, 'tex/drustywalls']
	export const dscrappywalls: tuple = [[216, 40], [24, 40], 0, 'tex/dscrappywalls']
	export const dscrappywalls2: tuple = [[216, 40], [24, 40], 0, 'tex/dscrappywalls2']
	export const druddywalls: tuple = [[288, 40], [24, 40], 0, 'tex/druddywalls']
	export const ddoorwood: tuple = [[96, 40], [24, 40], 0, 'tex/ddoor']
	export const dacidbarrel: tuple = [[24, 35], [24, 35], 0, 'tex/dacidbarrel']
	export const dfalsefronts: tuple = [[192, 40], [24, 40], 0, 'tex/dfalsefronts']

	export const pchris: tuple = [[24, 53], [24, 53], 0, 'tex/pawn/pchris']

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