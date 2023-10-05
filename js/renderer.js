import { default as THREE, OrthographicCamera, PerspectiveCamera, Clock, Scene, WebGLRenderer, TextureLoader, WebGLRenderTarget, ShaderMaterial, Mesh, PlaneGeometry, Color, NearestFilter, RGBAFormat, Group, AmbientLight } from 'three';
import app from './app';
import pts from './pts';
export { THREE };
const fragmentBackdrop = `
varying vec2 vUv;
//uniform float time;
void main() {
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 );
}`;
const fragmentPost = `
float saturation = 2.0;

uniform int compression;

// 24 is best
// 32 is nice
// 48 is mild
float factor = 24.0;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);

}

// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	//clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	
	if (compression == 1) {
	mainImage(clr, vUv, clr);
	}

	//vec3 original_color = clr.rgb;
	//vec3 lumaWeights = vec3(.25,.50,.25);
	//vec3 grey = vec3(dot(lumaWeights,original_color));
	//clr = vec4(grey + saturation * (original_color - grey), 1.0);
	
	gl_FragColor = clr;
}`;
const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
/*
masking theory

render trees to fullscreen target
render pawns to fullscreen target
if pawns underlap trees
underlap defines as two gray pixels
render it grey

theory 2
render pawns to fullscreen target
pass a uv offset to treeleaves
if pawn overlaps, render behind-grey
*/
// three quarter
var ren;
(function (ren) {
    ren.DPI_UPSCALED_RT = true;
    ren.ndpi = 1;
    ren.delta = 0;
    let groups;
    (function (groups) {
    })(groups = ren.groups || (ren.groups = {}));
    //export var ambientLight: AmbientLight
    //export var directionalLight: DirectionalLight
    function update() {
        ren.delta = ren.clock.getDelta();
        if (ren.delta > 1)
            ren.delta = 0.016;
        //delta *= 60.0;
        //filmic.composer.render();
    }
    ren.update = update;
    var reset = 0;
    var frames = 0;
    // https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
    function calc() {
        const s = Date.now() / 1000;
        frames++;
        if (s - reset >= 1) {
            reset = s;
            ren.fps = frames;
            frames = 0;
        }
        ren.memory = window.performance.memory;
    }
    ren.calc = calc;
    let alternate = true;
    function render() {
        const allowColorDepthToggle = true;
        if (allowColorDepthToggle)
            if (app.key('z') == 1)
                ren.materialPost.uniforms.compression.value = !ren.materialPost.uniforms.compression.value;
        /*alternate = ! alternate;
        if (alternate) {
            return;
        }*/
        calc();
        ren.renderer.setRenderTarget(ren.targetMask);
        ren.renderer.clear();
        ren.renderer.render(ren.sceneMask, ren.camera);
        ren.renderer.setRenderTarget(ren.target);
        ren.renderer.clear();
        ren.renderer.render(ren.scene, ren.camera);
        //scene.overrideMaterial = new THREE.MeshDepthMaterial();
        ren.renderer.setRenderTarget(null);
        ren.renderer.clear();
        ren.renderer.render(ren.scene2, ren.camera2);
    }
    ren.render = render;
    function init() {
        console.log('renderer init');
        ren.clock = new Clock();
        THREE.ColorManagement.enabled = false;
        THREE.Object3D.DefaultMatrixAutoUpdate = true;
        groups.axisSwap = new Group;
        groups.axisSwap.frustumCulled = false;
        groups.axisSwap.matrixAutoUpdate = false;
        groups.axisSwap.matrixWorldAutoUpdate = false;
        ren.scene = new Scene();
        ren.scene.frustumCulled = false;
        ren.scene.matrixAutoUpdate = false;
        ren.scene.matrixWorldAutoUpdate = false;
        ren.scene.add(groups.axisSwap);
        ren.scene.background = new Color('#333');
        //scene.background.fromArray(([51/255,51/255,51/255, 1]));
        ren.scene2 = new Scene();
        ren.scene2.matrixAutoUpdate = false;
        ren.sceneMask = new Scene();
        //sceneMask.background = new Color('#fff');
        ren.sceneMask.add(new AmbientLight(0xffffff, 1));
        ren.ambientLight = new AmbientLight(0xffffff, 1);
        ren.scene.add(ren.ambientLight);
        if (ren.DPI_UPSCALED_RT)
            ren.ndpi = window.devicePixelRatio;
        ren.target = new WebGLRenderTarget(1024, 1024, {
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat
        });
        ren.targetMask = ren.target.clone();
        ren.renderer = new WebGLRenderer({ antialias: false });
        ren.renderer.setPixelRatio(ren.ndpi);
        ren.renderer.setSize(100, 100);
        ren.renderer.autoClear = true;
        ren.renderer.setClearColor(0xffffff, 0.0);
        ren.renderer.outputColorSpace = THREE.RGBColorSpace;
        //renderer.setClearAlpha(1.0);
        document.body.appendChild(ren.renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        ren.materialPost = new ShaderMaterial({
            uniforms: {
                tDiffuse: { value: ren.target.texture },
                compression: { value: 1 }
            },
            vertexShader: vertexScreen,
            fragmentShader: fragmentPost,
            depthWrite: false
        });
        onWindowResize();
        ren.quadPost = new Mesh(ren.plane, ren.materialPost);
        ren.quadPost.matrixAutoUpdate = false;
        //quadPost.position.z = -100;
        ren.scene2.add(ren.quadPost);
        window.ren = ren;
    }
    ren.init = init;
    ren.screen = [0, 0];
    ren.screenCorrected = [0, 0];
    function onWindowResize() {
        ren.screen = [window.innerWidth, window.innerHeight];
        //screen = pts.divide(screen, 2);
        ren.screen = pts.floor(ren.screen);
        //screen = pts.even(screen, -1);
        //screen = [800, 600];
        ren.screenCorrected = pts.clone(ren.screen);
        if (ren.DPI_UPSCALED_RT) {
            //screen = pts.floor(screen);
            ren.screenCorrected = pts.mult(ren.screen, ren.ndpi);
            ren.screenCorrected = pts.floor(ren.screenCorrected);
            ren.screenCorrected = pts.even(ren.screenCorrected, -1);
        }
        console.log(`
		window inner ${pts.to_string(ren.screen)}\n
		      new is ${pts.to_string(ren.screenCorrected)}`);
        ren.target.setSize(ren.screenCorrected[0], ren.screenCorrected[1]);
        ren.targetMask.setSize(ren.screenCorrected[0], ren.screenCorrected[1]);
        ren.plane = new PlaneGeometry(ren.screenCorrected[0], ren.screenCorrected[1]);
        if (ren.quadPost)
            ren.quadPost.geometry = ren.plane;
        const cameraMode = 0;
        if (cameraMode) {
            ren.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
            //camera.zoom = camera.aspect; // scales "to fit" rather than zooming out
            ren.camera.position.z = 800;
        }
        else {
            ren.camera = make_orthographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
        }
        ren.camera2 = make_orthographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
        ren.camera2.updateProjectionMatrix();
        ren.renderer.setSize(ren.screen[0], ren.screen[1]);
    }
    let mem = [];
    function load_texture(file, mode = 1, cb, key) {
        if (mem[key || file])
            return mem[key || file];
        let texture = new TextureLoader().load(file + `?v=${app.salt}`, cb);
        texture.generateMipmaps = false;
        texture.center.set(0, 1);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        if (mode) {
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearFilter;
        }
        else {
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
        }
        mem[key || file] = texture;
        return texture;
    }
    ren.load_texture = load_texture;
    function make_render_target(w, h) {
        const o = {
            minFilter: NearestFilter,
            magFilter: NearestFilter,
            format: RGBAFormat
        };
        let target = new WebGLRenderTarget(w, h, o);
        return target;
    }
    ren.make_render_target = make_render_target;
    function make_orthographic_camera(w, h) {
        let camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -100, 100);
        camera.updateProjectionMatrix();
        return camera;
    }
    ren.make_orthographic_camera = make_orthographic_camera;
    function erase_children(group) {
        while (group.children.length > 0)
            group.remove(group.children[0]);
    }
    ren.erase_children = erase_children;
})(ren || (ren = {}));
export default ren;
