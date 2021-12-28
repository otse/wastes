import { MeshPhongMaterial } from 'three';
import Renderer from '../renderer';
var materialsScript;
(function (materialsScript) {
    var pool = {};
    function start() {
        store(['brick', 'cobbles', 'crate', 'floor']);
    }
    materialsScript.start = start;
    function store(names) {
        for (let name of names) {
            let material = new MeshPhongMaterial();
            material.map = Renderer.load_texture(`textures swamped/${name}.jpg`);
            material.map.center.set(0, 0);
            pool[name] = material;
        }
    }
    materialsScript.store = store;
    function has(name) {
        return pool[name];
    }
    materialsScript.has = has;
})(materialsScript || (materialsScript = {}));
export default materialsScript;
