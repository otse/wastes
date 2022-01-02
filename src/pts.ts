import aabb2 from "./aabb2";

export interface Pt { x: number; y: number };

class pts {
	static pt(a: vec2): Pt {
		return { x: a[0], y: a[1] };
	}

	static clone(zx: vec2): vec2 {
		return [zx[0], zx[1]];
	}

	static make(n: number, m: number): vec2 {
		return [n, m];
	}

	static to_string(a: vec2 | vec3 | vec4) {
		const pr = (b) => b != undefined ? `, ${b}` : '';

		return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
	}

	static func(bb: aabb2, callback: (pos: vec2) => boolean) {
		let y = bb.min[1];
		for (; y <= bb.max[1]; y++) {
			let x = bb.max[0];
			for (; x >= bb.min[0]; x--) {
				if(callback([x, y]))
					return;
			}
		}
	}

	static project(a: vec2): vec2 { // dimetric
		return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
	}
	
	static unproject(a: vec2): vec2 { // dimetric
		return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
	}

	static equals(a: vec2, b: vec2): boolean {
		return a[0] == b[0] && a[1] == b[1];
	}

	//static range(a: vec2, b: vec2): boolean {
	//	return true 
	//}
	/*
	static clamp(a: vec2, min: vec2, max: vec2): vec2 {
		const clamp = (val, min, max) =>
			val > max ? max : val < min ? min : val;
		return [clamp(a[0], min[0], max[0]), clamp(a[1], min[1], max[1])];
	}
	*/
	
	static floor(a: vec2): vec2 {
		return [Math.floor(a[0]), Math.floor(a[1])];
	}

	static ceil(a: vec2): vec2 {
		return [Math.ceil(a[0]), Math.ceil(a[1])];
	}

	static inv(a: vec2): vec2 {
		return [-a[0], -a[1]];
	}

	static mult(a: vec2, n: number, m?: number): vec2 {
		return [a[0] * n, a[1] * (m || n)];
	}

	static divide(a: vec2, n: number, m?: number): vec2 {
		return [a[0] / n, a[1] / (m || n)];
	}

	static subtract(a: vec2, b: vec2): vec2 {
		return [a[0] - b[0], a[1] - b[1]];
	}

	static add(a: vec2, b: vec2): vec2 {
		return [a[0] + b[0], a[1] + b[1]];
	}

	static addn(a: vec2, b: number): vec2 {
		return [a[0] + b, a[1] + b];
	}

	static abs(a: vec2): vec2 {
		return [Math.abs(a[0]), Math.abs(a[1])];
	}

	static min(a: vec2, b: vec2): vec2 {
		return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
	}

	static max(a: vec2, b: vec2): vec2 {
		return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
	}

	static together(zx: vec2): number {
		return zx[0] + zx[1];
	}

	// https://vorg.github.io/pex/docs/pex-geom/Vec2.html

	static dist(a: vec2, b: vec2): number {
		let dx = b[0] - a[0];
		let dy = b[1] - a[1];
		return Math.sqrt(dx * dx + dy * dy);
	}

	static distsimple(a: vec2, b: vec2) {
		let dx = Math.abs(b[0] - a[0]);
		let dy = Math.abs(b[1] - a[1]);
		return Math.max(dx, dy);
	};

}

export default pts;