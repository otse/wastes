import pts from "./pts";
var colormap;
(function (colormap_1) {
    colormap_1.mapSpan = 100;
    const zeroes = [0, 0, 0, 0];
    class pixel {
        constructor(context, pos, arrayRef) {
            this.context = context;
            this.pos = pos;
            this.arrayRef = arrayRef;
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
        same(pixel) {
            return this.is_color(pixel.arrayRef);
        }
        is_color(vec) {
            return vec[0] == this.arrayRef[0] && vec[1] == this.arrayRef[1] && vec[2] == this.arrayRef[2];
        }
        is_color_range(a, b) {
            return this.arrayRef[0] >= a[0] && this.arrayRef[0] <= b[0] &&
                this.arrayRef[1] >= a[1] && this.arrayRef[1] <= b[1] &&
                this.arrayRef[2] >= a[2] && this.arrayRef[2] <= b[2];
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
    colormap_1.pixel = pixel;
    class colormap {
        constructor(id) {
            this.data = [];
            var img = document.getElementById(id);
            if (!img.complete)
                console.error('bad', img);
            this.canvas = document.createElement('canvas');
            this.canvas.width = colormap_1.mapSpan;
            this.canvas.height = colormap_1.mapSpan;
            this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
            //this.ctx.scale(1, 1);
            this.ctx.drawImage(img, 0, 0, img.width, img.height);
            this.process();
        }
        get(pos) {
            if (this.data[pos[1]])
                return this.data[pos[1]][pos[0]];
        }
        pixel(pos) {
            return new pixel(this, pos, this.get(pos) || [0, 0, 0, 0]);
        }
        process() {
            for (let y = 0; y < colormap_1.mapSpan; y++) {
                this.data[y] = [];
                for (let x = 0; x < colormap_1.mapSpan; x++) {
                    const data = this.ctx.getImageData(x, colormap_1.mapSpan - 1 - y, 1, 1).data;
                    //if (this.data[y] == undefined)
                    //	this.data[y] = [];
                    this.data[y][x] = data;
                }
            }
        }
    }
    colormap_1.colormap = colormap;
})(colormap || (colormap = {}));
export default colormap;
