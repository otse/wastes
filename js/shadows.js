import colormap from "./colormap";
import tiles from "./tiles";
import pts from "./pts";
export var shadows;
(function (shadows) {
    // takes care of shadows cast by tree-leaves and walls
    const default_shade = 1.0;
    shadows.data = [];
    function shade(pos, amount, set = false) {
        if (!set)
            shadows.data[pos[1]][pos[0]] -= amount;
        else if (set && amount)
            shadows.data[pos[1]][pos[0]] = amount;
        if (shadows.data[pos[1]][pos[0]] < 0)
            shadows.data[pos[1]][pos[0]] = 0;
        const tile = tiles.get(pos);
        if (tile)
            tile.refresh = true;
    }
    shadows.shade = shade;
    function shade_matrix(pos, matrix, set = false) {
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                let negx = -Math.floor(matrix[y].length / 2) + x;
                let negy = -Math.floor(matrix[y].length / 2) + y;
                //console.log([negx, negy]);
                let pos2 = pts.add(pos, [negx, negy]);
                shade(pos2, matrix[y][x], set);
                //shade
            }
        }
        tiles.get(pos).refresh = true;
    }
    shadows.shade_matrix = shade_matrix;
    function get_amount(pos) {
        if (shadows.data[pos[1]])
            return shadows.data[pos[1]][pos[0]] || 0;
        else
            return default_shade;
    }
    shadows.get_amount = get_amount;
    // shades the color by multplication
    function mult_pos(a, pos) {
        const amount = get_amount(pos);
        return mult(a, amount);
    }
    shadows.mult_pos = mult_pos;
    function mult(a, amount = 1.0) {
        let b = [...a];
        b[0] *= amount;
        b[1] *= amount;
        b[2] *= amount;
        return b;
    }
    shadows.mult = mult;
    function start() {
        for (let y = 0; y < colormap.mapSpan; y++) {
            this.data[y] = [];
            for (let x = 0; x < colormap.mapSpan; x++) {
                this.data[y][x] = default_shade;
            }
        }
    }
    shadows.start = start;
    function tick() {
    }
    shadows.tick = tick;
})(shadows || (shadows = {}));
export default shadows;
