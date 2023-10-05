import { default as THREE, TextureLoader, Group, Mesh, Color, Matrix3, AmbientLight, DirectionalLight, MeshLambertMaterial, BoxGeometry } from "three";
import app from "./app";
import ren from './renderer';
import wastes from "./wastes";
var tree;
(function (tree) {
    tree.started = false;
    var gStemMesh;
    var gLeavesMesh;
    var ggroup;
    var rotation = 0;
    var rotationLeaf = 0;
    var zooms = [0, 1, [1, 0.33, 0.25, 0.1]];
    function register() {
    }
    tree.register = register;
    function start() {
        tree.started = true;
        document.title = 'tree';
        gStemMesh = createMesh();
        ggroup = new Group;
        ggroup.rotation.set(Math.PI / 6, Math.PI / 4, 0);
        ren.scene.add(ggroup);
        ren.scene.remove(ren.ambientLight);
        let am = new AmbientLight(0x777777);
        ren.scene.add(am);
        ren.scene.background = new Color('gray');
        let sun = new DirectionalLight(0xffffff, 0.5);
        sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 6);
        //sun.add(new AxesHelper(100));
        ggroup.add(sun);
        ggroup.add(sun.target);
    }
    tree.start = start;
    function createMesh(size = wastes.size) {
        let stemWidth = 18, stemHeight = 30;
        let leavesWidth = size, leavesHeight = size * 3;
        //height = size * 3;
        let stemGeometry = new BoxGeometry(stemWidth, stemHeight, stemWidth, 1, 1, 1);
        let leavesGeometry = new BoxGeometry(leavesHeight, leavesHeight, leavesHeight, 1, 1, 1);
        let materials1 = [];
        let materials2 = [];
        //let texture = ren.load_texture('tex/stock/metalrooftiles.jpg');
        let twidth = 1, tlength = 1;
        const loader = new TextureLoader();
        loader.load('tex/stock/treebark1.jpg', function (texture) {
            //texture.magFilter = texture.minFilter = THREE.NearestFilter;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.generateMipmaps = true;
            console.log('woo');
            let alignments = [
                undefined,
                new Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1),
                new Matrix3().setUvTransform(0, 0, 0.5, 1, rotation * Math.PI / 2, 0, 1),
                undefined,
                new Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1), // right
            ];
            for (let i of [1, 2, 4]) {
                materials1[i] = myboxmaterial({
                    map: texture
                }, {
                    myUvTransform: alignments[i]
                });
            }
            gStemMesh = new Mesh(stemGeometry, materials1);
            gStemMesh.position.set(1, 0, 0);
            ggroup.add(gStemMesh);
        });
        const loader2 = new TextureLoader();
        loader2.load('tex/stock/leaves.png', function (texture) {
            //texture.magFilter = texture.minFilter = THREE.NearestFilter;
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.generateMipmaps = true;
            console.log('woo2');
            let alignments = [
                undefined,
                new Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1),
                new Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1),
                undefined,
                new Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1), // right
            ];
            for (let i of [1, 2, 4]) {
                materials2[i] = myboxmaterial({
                    map: texture,
                    transparent: true
                }, {
                    myUvTransform: alignments[i]
                });
            }
            gLeavesMesh = new Mesh(leavesGeometry, materials2);
            gLeavesMesh.position.set(1, (stemHeight / 2) + (leavesHeight / 2), 0);
            ggroup.add(gLeavesMesh);
        });
    }
    let show = true;
    function tick() {
        if (!tree.started)
            return;
        if (app.wheel == -1 && zooms[0] > 0)
            zooms[0] -= 1;
        if (app.wheel == 1 && zooms[0] < zooms[2].length - 1)
            zooms[0] += 1;
        zooms[1] = zooms[2][zooms[0]];
        ren.camera2.scale.set(zooms[1], zooms[1], zooms[1]);
        let rebuild = false;
        if (app.key('q') == 1) {
            rotation -= 1;
            rebuild = true;
        }
        if (app.key('e') == 1) {
            rotation += 1;
            rebuild = true;
        }
        if (app.key('a') == 1) {
            rotationLeaf -= 1;
            rebuild = true;
        }
        if (app.key('d') == 1) {
            rotationLeaf += 1;
            rebuild = true;
        }
        rotation = rotation < 0 ? 3 : rotation > 3 ? 0 : rotation;
        function deleteMesh(mesh) {
            mesh.geometry.dispose();
            mesh.material[1].dispose();
            mesh.material[2].dispose();
            mesh.material[4].dispose();
            mesh.parent.remove(mesh);
            mesh = undefined;
        }
        if (rebuild && gStemMesh) {
            deleteMesh(gStemMesh);
            deleteMesh(gLeavesMesh);
            createMesh();
            //ggroup.add(gmesh);
        }
        if (app.key('h') == 1)
            show = !show;
        let crunch = ``;
        crunch += `dpi: ${ren.ndpi}<br />`;
        crunch += `fps: ${ren.fps} / ${ren.delta.toPrecision(3)}<br />`;
        crunch += '<br />';
        crunch += `zoom: ${zooms[1]}<br />`;
        crunch += `rotation: ${rotation}<br />`;
        crunch += `controls: mousewheel to zoom, Q, E to rotate texture<br />`;
        let element = document.querySelectorAll('.stats')[0];
        element.innerHTML = crunch;
        element.style.visibility = show ? 'visible' : 'hidden';
    }
    tree.tick = tick;
    function myboxmaterial(parameters, uniforms) {
        let material = new MeshLambertMaterial(parameters);
        material.customProgramCacheKey = function () {
            return 'boxmaterial';
        };
        material.name = "boxmaterial";
        material.onBeforeCompile = function (shader) {
            shader.defines = {};
            shader.uniforms.myUvTransform = { value: uniforms.myUvTransform };
            shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>
				uniform mat3 myUvTransform;
				`);
            shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`, `
				#ifdef USE_UV
				vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
				#endif
				`);
        };
        return material;
    }
})(tree || (tree = {}));
export default tree;
