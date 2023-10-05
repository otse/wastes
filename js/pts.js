;
class pts {
    static pt(a) {
        return { x: a[0], y: a[1] };
    }
    static clone(zx) {
        return [zx[0], zx[1]];
    }
    static make(n, m) {
        return [n, m];
    }
    static to_string(a) {
        const pr = (b) => b != undefined ? `, ${b}` : '';
        return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
    }
    static to_string_fixed(a) {
        const pr = (b) => b != undefined ? `, ${b}` : '';
        return `${a[0].toFixed(1)}, ${a[1].toFixed(1)}` + pr(a[2]) + pr(a[3]);
    }
    static func(bb, callback) {
        let y = bb.min[1];
        for (; y <= bb.max[1]; y++) {
            let x = bb.max[0];
            for (; x >= bb.min[0]; x--) {
                callback([x, y]);
            }
        }
    }
    static project(a) {
        return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
    }
    static unproject(a) {
        return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
    }
    static equals(a, b) {
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
    static floor(a) {
        return [Math.floor(a[0]), Math.floor(a[1])];
    }
    static ceil(a) {
        return [Math.ceil(a[0]), Math.ceil(a[1])];
    }
    static round(a) {
        return [Math.round(a[0]), Math.round(a[1])];
    }
    static inv(a) {
        return [-a[0], -a[1]];
    }
    static mult(a, n, m) {
        return [a[0] * n, a[1] * (m || n)];
    }
    static mults(a, b) {
        return [a[0] * b[0], a[1] * b[1]];
    }
    static divide(a, n, m) {
        return [a[0] / n, a[1] / (m || n)];
    }
    static divides(a, b) {
        return [a[0] / b[0], a[1] / b[1]];
    }
    static subtract(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }
    static add(a, b) {
        return [a[0] + b[0], a[1] + b[1]];
    }
    static addn(a, b) {
        return [a[0] + b, a[1] + b];
    }
    static abs(a) {
        return [Math.abs(a[0]), Math.abs(a[1])];
    }
    static min(a, b) {
        return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
    }
    static max(a, b) {
        return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    }
    static together(zx) {
        return zx[0] + zx[1];
    }
    static uneven(a, n = -1) {
        let b = pts.clone(a);
        if (b[0] % 2 != 1) {
            b[0] += n;
        }
        if (b[1] % 2 != 1) {
            b[1] += n;
        }
        return b;
    }
    static even(a, n = -1) {
        let b = pts.clone(a);
        if (b[0] % 2 != 0) {
            b[0] += n;
        }
        if (b[1] % 2 != 0) {
            b[1] += n;
        }
        return b;
    }
    static angle(a, b) {
        return -Math.atan2(a[0] - b[0], a[1] - b[1]);
    }
    // https://vorg.github.io/pex/docs/pex-geom/Vec2.html
    //static dist(a: vec2, b: vec2): number {
    //	let dx = b[0] - a[0];
    //	let dy = b[1] - a[1];
    //	return Math.sqrt(dx * dx + dy * dy);
    //}
    static distsimple(a, b) {
        let c = pts.abs(pts.subtract(a, b));
        return Math.max(c[0], c[1]);
    }
    ;
}
export default pts;
