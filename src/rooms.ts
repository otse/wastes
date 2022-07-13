import { default as THREE, BoxGeometry } from "three";
import aabb2 from "./aabb2";
import app from "./app";

import ren from './renderer';
import wastes from "./wastes";

namespace rooms {

    let room = new aabb2([41, 42], [30, 30]);

    export var started = false;

    export function start() {
        started = true;


    }

    export function tick() {
        if (!started)
            return;
    }
}

export default rooms;