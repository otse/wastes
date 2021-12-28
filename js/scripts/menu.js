import Renderer from "../renderer";
var menuScript;
(function (menuScript) {
    menuScript.enabled = false;
    function start() {
        console.log(' menu start ');
        if (menuScript.enabled) {
            squishedDiamond.start();
        }
        window['Menu'] = menuScript;
    }
    menuScript.start = start;
    function tick() {
        if (menuScript.enabled) {
            squishedDiamond.tick();
        }
    }
    menuScript.tick = tick;
    class squishedDiamond {
        static start() {
            /*Modeler.load_obj('obj/logo', (object) => {
                squishedDiamond.object = object;
                object.scale.multiplyScalar(3);
                object.rotation.fromArray([-Math.PI / 2, 0, 0]);
                object.position.fromArray([-Renderer.w2 / 2 + 250, Renderer.h2 / 2 - 350, 0]);
                Renderer.scene.add(object);
                console.log('diamond is', object);
            });*/
        }
        static easeOutElastic(x) {
            const c4 = (2 * Math.PI) / 3;
            return x === 0
                ? 0
                : x === 1
                    ? 1
                    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
        static tick() {
            const time = 2;
            let creator = 0;
            this.timer += Renderer.delta;
            this.fpsHalver += Renderer.delta;
            if (this.timer < time) {
                let ease = this.easeOutElastic(this.timer / time);
                if (this.fpsHalver >= 0.032 * 2 + ease / 15) {
                    this.fpsHalver = 0;
                    this.spin = ease * Math.PI;
                }
                this.object.rotation.fromArray([-Math.PI / 2, 0, this.spin]);
            }
            else if (this.timer > time + 1)
                this.timer = 0;
        }
    }
    squishedDiamond.timer = 0;
    squishedDiamond.spin = 0;
    squishedDiamond.fpsHalver = 0;
    menuScript.squishedDiamond = squishedDiamond;
})(menuScript || (menuScript = {}));
export default menuScript;
