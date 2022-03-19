import { default as THREE, BoxGeometry } from "three";
import app from "./app";

import ren from './renderer';
import wastes from "./wastes";

namespace win95 {

    export var started = false;


    export function start() {
        started = true;

    }

    export function tick() {
        if (!started)
            return;
    }
}

export default win95;