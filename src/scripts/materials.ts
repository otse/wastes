import { default as THREE, Group, MeshPhongMaterial, Material, Texture } from 'three';
import Renderer from '../renderer';

namespace materialsScript {
    var pool: { [name: string]: Material } = {};

    export function start() {
        store(['brick', 'cobbles', 'crate', 'floor']);
    }

    export function store(names: string[]) {
        for (let name of names) {
            let material = new MeshPhongMaterial();
            material.map = Renderer.load_texture(`textures swamped/${name}.jpg`);
            material.map.center.set(0, 0);
            pool[name] = material;
        }
    }
    
    export function has(name: string): Texture {
        return pool[name];
    }
}

export default materialsScript;