"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pts_1 = __importDefault(require("./pts"));
var TEST;
(function (TEST) {
    TEST[TEST["Outside"] = 0] = "Outside";
    TEST[TEST["Inside"] = 1] = "Inside";
    TEST[TEST["Overlap"] = 2] = "Overlap";
})(TEST || (TEST = {}));
class aabb2 {
    constructor(a, b) {
        this.min = this.max = [...a];
        if (b) {
            this.extend(b);
        }
    }
    static dupe(bb) {
        return new aabb2(bb.min, bb.max);
    }
    extend(v) {
        this.min = pts_1.default.min(this.min, v);
        this.max = pts_1.default.max(this.max, v);
    }
    diagonal() {
        return pts_1.default.subtract(this.max, this.min);
    }
    center() {
        return pts_1.default.add(this.min, pts_1.default.mult(this.diagonal(), 0.5));
    }
    translate(v) {
        this.min = pts_1.default.add(this.min, v);
        this.max = pts_1.default.add(this.max, v);
    }
    test(b) {
        if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
            this.max[1] < b.min[1] || this.min[1] > b.max[1])
            return 0;
        if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
            this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
            return 1;
        return 2;
    }
    random_point() {
        const width = this.max[0] - this.min[0];
        const length = this.max[1] - this.min[1];
        return [this.min[0] + width * Math.random(), this.min[1] + length * Math.random()];
    }
    ray(r) {
        // r.dir is unit direction vector of ray
        let dirfrac = {};
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
aabb2.TEST = TEST;
exports.default = aabb2;
