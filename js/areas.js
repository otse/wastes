import aabb2 from "./aabb2";
import wastes from "./wastes";
import win from "./win";
var areas;
(function (areas_1) {
    let areas = [];
    let currentArea;
    areas_1.started = false;
    function start() {
        areas_1.started = true;
        areas.push({ name: "Trashy Vendor", bound: new aabb2([35.5, 46.5], [42.5, 52.5]) });
    }
    areas_1.start = start;
    function tick() {
        if (!areas_1.started)
            return;
        let pos = wastes.gview.center.wpos;
        let here = new aabb2(pos, pos);
        if (currentArea) {
            if (currentArea && currentArea.bound.test(here) == aabb2.TEST.Outside) {
                currentArea = undefined;
                console.log('outside');
            }
        }
        else {
            for (let area of areas) {
                if (area.bound.test(here) == aabb2.TEST.Inside) {
                    console.log('inside');
                    currentArea = area;
                    win.areatag.tag = area;
                    win.areatag.call_step();
                }
                else if (win.areatag.tagCur == area) {
                    win.areatag.tagCur = undefined;
                }
            }
        }
    }
    areas_1.tick = tick;
})(areas || (areas = {}));
export default areas;
