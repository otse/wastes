import { Group } from 'three';
import app from "../app";
import wastes from '../wastes';
import pts from "../pts";
import ren from "../renderer";
// scripts have a .start, .tick
var panningScript;
(function (panningScript) {
    const enabled = true;
    const isometric = [0, 0]; // [-Math.PI / 4, Math.PI / 3]
    function start() {
        if (!enabled)
            return;
        panningScript.center = new Group;
        panningScript.yawGroup = new Group;
        panningScript.pitchGroup = new Group;
        panningScript.center.add(panningScript.yawGroup);
        //center.add(new AxesHelper(100))
        panningScript.yawGroup.add(panningScript.pitchGroup);
        panningScript.pitchGroup.add(ren.camera);
        ren.groups.axisSwap.add(panningScript.center);
    }
    panningScript.start = start;
    var begin = [0, 0];
    var last = [0, 0]; // isometric
    var before = [0, 0];
    function tick() {
        if (!enabled)
            return;
        if (app.button(1) == 1) {
            begin = app.mouse();
            before = last;
        }
        if (app.button(1) >= 1) {
            console.log('hold');
            let dif = pts.subtract(begin, app.mouse());
            dif = pts.divide(dif, 250);
            dif = pts.add(dif, before);
            last = pts.clone(dif);
        }
        else {
            last = isometric;
        }
        panningScript.yawGroup.rotation.z = last[0];
        panningScript.pitchGroup.rotation.x = last[1];
        panningScript.center.position.fromArray([...wastes.view.rpos, 0]);
        ren.camera.scale.set(wastes.view.zoom / 1, wastes.view.zoom / 1, wastes.view.zoom / 1);
        ren.camera.updateProjectionMatrix();
    }
    panningScript.tick = tick;
})(panningScript || (panningScript = {}));
export default panningScript;
