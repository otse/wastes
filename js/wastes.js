import lod from "./lod";
import testing_chamber from "./testing_chamber";
import tests from "./tests";
import view from "./view";
import tiles from "./tiles";
import objects from "./objects/objects";
import modeler from "./modeler";
import sprites from "./sprites";
import shear from "./shear";
import collada from "./collada";
import pawns from "./objects/pawns";
import win from "./win";
import rooms from "./rooms";
import areas from "./areas";
import shadows from "./shadows";
import client from "./client";
import chickens from "./objects/chickens";
import fences from "./objects/fences";
import glob from "./glob";
import guns from "./objects/guns";
import app from "./app";
export { win, pawns, objects, fences }; // fixes creepy rollup error
export var wastes;
(function (wastes) {
    wastes.size = 24;
    wastes.SOME_OTHER_SETTING = false;
    wastes.HIDE_ROOFS = false;
    wastes.FOLLOW_CAMERA = true;
    var started = false;
    function sample(a) {
        return a[Math.floor(Math.random() * a.length)];
    }
    wastes.sample = sample;
    function clamp(val, min, max) {
        return val > max ? max : val < min ? min : val;
    }
    wastes.clamp = clamp;
    let RESOURCES;
    (function (RESOURCES) {
        RESOURCES[RESOURCES["RC_UNDEFINED"] = 0] = "RC_UNDEFINED";
        RESOURCES[RESOURCES["POPULAR_ASSETS"] = 1] = "POPULAR_ASSETS";
        //CANT_FIND,
        RESOURCES[RESOURCES["REVOLVER"] = 2] = "REVOLVER";
        RESOURCES[RESOURCES["RIFLE"] = 3] = "RIFLE";
        RESOURCES[RESOURCES["LASER_MUSKET"] = 4] = "LASER_MUSKET";
        RESOURCES[RESOURCES["READY"] = 5] = "READY";
        RESOURCES[RESOURCES["COUNT"] = 6] = "COUNT";
    })(RESOURCES = wastes.RESOURCES || (wastes.RESOURCES = {}));
    ;
    let time;
    let resources_loaded = 0b0;
    function resourced(word) {
        resources_loaded |= 0b1 << RESOURCES[word];
        try_start();
    }
    wastes.resourced = resourced;
    function try_start() {
        let count = 0;
        for (let i = 0; i < RESOURCES.COUNT; i++)
            if (resources_loaded & 0b1 << i)
                count++;
        if (count == RESOURCES.COUNT)
            start();
    }
    const MAX_WAIT = 1500;
    function reasonable_waiter() {
        if (time + MAX_WAIT < new Date().getTime()) {
            console.warn(` passed reasonable wait time for resources `);
            start();
        }
    }
    function critical(mask) {
        // Couldn't load
        console.error('resource', mask);
    }
    wastes.critical = critical;
    function starts() {
        app.message('swipe to move');
        lod.register();
        if (window.location.href.indexOf("#testingchamber") != -1) {
            wastes.gview = view.make();
            testing_chamber.start();
        }
        else if (window.location.href.indexOf("#modeler") != -1) {
            modeler.start();
        }
        else if (window.location.href.indexOf("#shear") != -1) {
            shear.start();
        }
        else if (window.location.href.indexOf("#collada") != -1) {
            collada.start();
        }
        else {
            wastes.gview = view.make();
            objects.register();
            tiles.register();
            sprites.start();
            shadows.start();
            tiles.start();
            objects.start();
            rooms.start();
            areas.start();
            win.start();
            tests.start();
            client.start();
            chickens.start();
            wastes.gview.center = new lod.obj();
            wastes.gview.center.wpos = [44, 52];
        }
    }
    function start() {
        if (started)
            return;
        started = true;
        console.log(' wastes starting ');
        glob.HOVER_COLOR = '#95ca90';
        starts();
    }
    function init() {
        console.log(' wastes init ');
        time = new Date().getTime();
        resourced('RC_UNDEFINED');
        resourced('POPULAR_ASSETS');
        resourced('READY');
        window['wastes'] = wastes;
        guns.init();
    }
    wastes.init = init;
    function tick() {
        if (!started) {
            reasonable_waiter();
            return;
        }
        tests.tick();
        testing_chamber.tick();
        modeler.tick();
        tiles.tick();
        shear.tick();
        collada.tick();
        client.tick();
        objects.tick();
        wastes.gview === null || wastes.gview === void 0 ? void 0 : wastes.gview.tick();
        rooms.tick();
        areas.tick();
        win.tick();
    }
    wastes.tick = tick;
})(wastes || (wastes = {}));
export default wastes;
