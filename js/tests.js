import lod from "./lod";
import wastes from "./wastes";
import sprite from "./sprite";
import sprites from "./sprites";
export var tests;
(function (tests) {
    function start() {
        mouserock.start();
    }
    tests.start = start;
    function tick() {
        mouserock.tick();
    }
    tests.tick = tick;
    class mouserock {
        static start() {
            const mouseAsteroid = true;
            if (mouseAsteroid) {
                this.obj = new lod.obj();
                this.obj.shape = new sprite({ binded: this.obj, tuple: sprites.asteroid });
                //this.obj.show();
                //let daisy = this.obj.shape as sprite;
                //ren.scene.add(daisy.mesh);
            }
        }
        static tick() {
            var _a;
            if (this.obj) {
                this.obj.rpos = wastes.gview.mrpos;
                (_a = this.obj.shape) === null || _a === void 0 ? void 0 : _a.shape_manual_update();
                let sprite = this.obj.shape;
            }
        }
    }
    tests.mouserock = mouserock;
})(tests || (tests = {}));
export default tests;
