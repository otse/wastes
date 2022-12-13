import pts from "./pts";

// https://www.khanacademy.org/computer-programming/swept-aabb-test/4966664161263616
// https://jsfiddle.net/Hatchet/ccjrg9b0/

enum TEST {
	Outside,
	Inside,
	Overlap
}

class aabb2 {
	static readonly TEST = TEST
	min: vec2
	max: vec2
	velocity: vec2
	size: vec2
	static dupe(bb: aabb2) {
		return new aabb2(bb.min, bb.max)
	}
	constructor(a: vec2, b: vec2) {
		this.min = this.max = <vec2>[...a]
		if (b) {
			this.extend(b)
		}
		this.velocity = [0, 0]
	}
	recalculate_size() {
		this.size = this.diagonal()
	}
	extend(v: vec2) {
		this.min = pts.min(this.min, v)
		this.max = pts.max(this.max, v)
		this.recalculate_size();
	}
	diagonal(): vec2 {
		return pts.subtract(this.max, this.min)
	}
	center(): vec2 {
		return pts.add(this.min, pts.mult(this.diagonal(), 0.5))
	}
	translate(v: vec2) {
		this.min = pts.add(this.min, v)
		this.max = pts.add(this.max, v)
	}
	test(b: aabb2) {
		if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
			this.max[1] < b.min[1] || this.min[1] > b.max[1])
			return 0
		if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
			this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
			return 1
		return 2
	}
	overlap(b: aabb2) {
		let min = [Math.max(this.min[0], b.min[0]), Math.max(this.min[1], b.min[1])] as vec2;
		let max = [Math.min(this.max[0], b.max[0]), Math.min(this.max[1], b.max[1])] as vec2;
		const overlap = new aabb2(min, max);
		return overlap;
	}
	sweptAABB(movingRect: aabb2, stationaryRect: aabb2) {
		var closeX, farX, closeY, farY, normalX, normalY;

		if (movingRect.velocity[0] > 0) {
			closeX = stationaryRect.min[0] - (movingRect.min[0] + movingRect.size[0]);
			farX = (stationaryRect.min[0] + stationaryRect.size[0]) - movingRect.min[0];
		} else {
			closeX = (stationaryRect.min[0] + stationaryRect.size[0]) - movingRect.min[0];
			farX = stationaryRect.min[0] - (movingRect.min[0] + movingRect.size[0]);
		}

		if (movingRect.velocity[1] > 0) {
			closeY = stationaryRect.min[1] - (movingRect.min[1] + movingRect.size[1]);
			farY = (stationaryRect.min[1] + stationaryRect.size[1]) - movingRect.min[1];
		} else {
			closeY = (stationaryRect.min[1] + stationaryRect.size[1]) - movingRect.min[1];
			farY = stationaryRect.min[1] - (movingRect.min[1] + movingRect.size[1]);
		}

		// find time of collision and time of leaving for each axis (if statement is to prevent divide by zero)
		var xEntry, yEntry;
		var xExit, yExit;

		if (movingRect.velocity[0] === 0) {
			xEntry = -Infinity;
			xExit = Infinity;
		} else {
			xEntry = closeX / movingRect.velocity[0];
			xExit = farX / movingRect.velocity[0];
		}

		if (movingRect.velocity[1] === 0) {
			yEntry = -Infinity;
			yExit = Infinity;
		} else {
			yEntry = closeY / movingRect.velocity[1];
			yExit = farY / movingRect.velocity[1];
		}

		// find the earliest/latest times of collision
		var entryTime = Math.max(xEntry, yEntry);
		var exitTime = Math.min(xExit, yExit);

		// if there was no collision
		if (entryTime > exitTime || xEntry < 0 && yEntry < 0 || xEntry > 1 || yEntry > 1) {
			normalX = 0;
			normalY = 0;
			entryTime = 1;
			return {
				collisionTime: entryTime,
				normalX: normalX,
				normalY: normalY
			};
		} else { // if there was a collision
			// calculate normal of collided surface
			if (xEntry > yEntry) {
				if (closeX < 0) {
					normalX = 1;
					normalY = 0;
				} else {
					normalX = -1;
					normalY = 0;
				}
			} else {
				if (closeY < 0) {
					normalX = 0;
					normalY = 1;
				} else {
					normalX = 0;
					normalY = -1;
				}
			}

			// return the time of collision
			return {
				collisionTime: entryTime,
				normalX: normalX,
				normalY: normalY
			};
		}
	}
	random_point(): vec2 {
		const width = this.max[0] - this.min[0];
		const length = this.max[1] - this.min[1];
		return [this.min[0] + width * Math.random(), this.min[1] + length * Math.random()];
	}
	ray(r: { dir: vec2; org: vec2 }) {
		// r.dir is unit direction vector of ray
		let dirfrac: any = {};
		dirfrac.x = 1.0 / r.dir[0];
		dirfrac.y = 1.0 / r.dir[1];
		// lb is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
		// r.org is origin of ray
		let t1 = (this.min[0] - r.org[0]) * dirfrac.x;
		let t2 = (this.max[0] - r.org[0]) * dirfrac.x;
		let t3 = (this.min[1] - r.org[1]) * dirfrac.y;
		let t4 = (this.max[1] - r.org[1]) * dirfrac.y;

		let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
		let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

		let t;

		// if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
		if (tmax < 0) {
			t = tmax;
			return false;
		}

		// if tmin > tmax, ray doesn't intersect AABB
		if (tmin > tmax) {
			t = tmax;
			return false;
		}

		t = tmin;
		return true;
	}
}

export default aabb2;