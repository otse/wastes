import { numbers } from "../lod";
import sprite from "../sprite";
import sprites from "../sprites";
import { superobject } from "./superobject";
export var fences;
(function (fences) {
    class fence extends superobject {
        constructor() {
            super(numbers.walls);
            this.type = 'wall';
            this.height = 24;
        }
        create() {
            this.rebound();
            this.size = [24, 30];
            return;
            this.cell = [255 - this.pixel.arrayRef[3], 0];
            let tuple = sprites.dscrappywalls;
            let shape = new sprite({
                binded: this,
                tuple: sprites.dfence,
                cell: this.cell,
                orderBias: .6,
            });
            fence.make();
            this.stack();
        }
        static make() {
            if (!this.made) {
                this.made = true;
                const barWidth = 2.5;
                const barHeight = 4;
                const barLength = 2.5;
            }
        }
    }
    fence.made = false;
    fences.fence = fence;
})(fences || (fences = {}));
export default fences;
