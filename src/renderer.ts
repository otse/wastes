import { default as THREE, OrthographicCamera, PerspectiveCamera, Clock, Scene, WebGLRenderer, Texture, TextureLoader, WebGLRenderTarget, ShaderMaterial, Mesh, PlaneBufferGeometry, Color, NearestFilter, RGBAFormat, Group, Renderer as ren, AmbientLight, DirectionalLight } from 'three';

import app from './app';
import pts from './pts';
import wastes from './wastes';

export { THREE };

const fragmentBackdrop = `
varying vec2 vUv;
//uniform float time;
void main() {
	gl_FragColor = vec4( 0.5, 0.5, 0.5, 1.0 );
}`

const fragmentPost = `
float saturation = 2.0;

uniform int compression;

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
	clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	
	/*
	vec3 original_color = clr.rgb;
	vec3 lumaWeights = vec3(.25,.50,.25);
	vec3 grey = vec3(dot(lumaWeights,original_color));
	vec4 outt = vec4(grey + saturation * (original_color - grey), 1.0);
	*/
	vec4 outt;
	gl_FragColor = clr;
	if (compression == 1) {
	mainImage(clr, vUv, gl_FragColor);
	}
	//gl_FragColor = outt;
}`


const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

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

namespace ren {

	export const DPI_UPSCALED_RT = true

	export var ndpi = 1
	export var delta = 0

	export var clock: Clock

	export namespace groups {
		export var axisSwap: Group
		export var tiles: Group
	}
	export var scene: Scene
	export var scene2: Scene
	export var sceneMask: Scene

	export var camera: PerspectiveCamera
	export var camera2: OrthographicCamera

	export var target: WebGLRenderTarget
	export var targetMask: WebGLRenderTarget
	export var renderer: WebGLRenderer

	export var ambientLight: AmbientLight
	export var directionalLight: DirectionalLight

	export var materialBg: ShaderMaterial
	export var materialPost: ShaderMaterial

	export var quadPost: Mesh

	//export var ambientLight: AmbientLight
	//export var directionalLight: DirectionalLight

	export function update() {

		delta = clock.getDelta();

		if (delta > 2)
			delta = 0.016;

		//delta *= 60.0;
		//filmic.composer.render();
	}

	var reset = 0;
	var frames = 0;

	export var fps;
	export var memory;

	// https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
	export function calc() {
		const s = Date.now() / 1000;
		frames++;
		if (s - reset >= 1) {
			reset = s;
			fps = frames;
			frames = 0;
		}

		memory = (<any>window.performance).memory;
	}
	let alternate = true;
	export function render() {

		const allowColorDepthToggle = true;

		if (allowColorDepthToggle)
			if (app.key('z') == 1)
				materialPost.uniforms.compression.value = !materialPost.uniforms.compression.value;

		/*alternate = ! alternate;
		if (alternate) {
			return;
		}*/
		calc();

		renderer.setRenderTarget(targetMask);
		renderer.clear();
		renderer.render(sceneMask, camera);

		renderer.setRenderTarget(target);
		renderer.clear();
		renderer.render(scene, camera);

		//scene.overrideMaterial = new THREE.MeshDepthMaterial();

		renderer.setRenderTarget(null);
		renderer.clear();
		renderer.render(scene2, camera2);

	}

	export var plane

	export function init() {

		console.log('renderer init')

		clock = new Clock()

		THREE.Object3D.DefaultMatrixAutoUpdate = true;

		groups.axisSwap = new Group;
		groups.axisSwap.matrixAutoUpdate = false;
		groups.axisSwap.matrixWorldAutoUpdate = false;
		groups.tiles = new Group;

		scene = new Scene();
		scene.matrixAutoUpdate = false;
		scene.matrixWorldAutoUpdate = false;

		groups.axisSwap.add(groups.tiles);
		//groups.axisSwap.scale.set(1, -1, 1);
		scene.add(groups.axisSwap);
		scene.background = new Color('#333');
		
		scene2 = new Scene();
		scene2.matrixAutoUpdate = false;

		sceneMask = new Scene();
		//sceneMask.background = new Color('#fff');
		sceneMask.add(new AmbientLight(0xffffff, 1));

		ambientLight = new AmbientLight(0xffffff, 1);
		scene.add(ambientLight);

		if (DPI_UPSCALED_RT)
			ndpi = window.devicePixelRatio;

		target = new WebGLRenderTarget(1024, 1024,
			{
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat
			});
		targetMask = target.clone();

		renderer = new WebGLRenderer({ antialias: false });
		renderer.setPixelRatio(ndpi);
		renderer.setSize(100, 100);
		renderer.autoClear = true;
		renderer.setClearColor(0xffffff, 0.0);
		//renderer.setClearAlpha(1.0);

		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', onWindowResize, false);

		materialPost = new ShaderMaterial({
			uniforms: {
				tDiffuse: { value: target.texture },
				compression: { value: 1 }
			},
			vertexShader: vertexScreen,
			fragmentShader: fragmentPost,
			depthWrite: false
		});

		onWindowResize();

		quadPost = new Mesh(plane, materialPost);
		quadPost.matrixAutoUpdate = false;
		//quadPost.position.z = -100;

		scene2.add(quadPost);

		(window as any).ren = ren;

	}

	export var screen: vec2 = [0, 0];
	export var screenCorrected: vec2 = [0, 0];

	function onWindowResize() {
		screen = [window.innerWidth, window.innerHeight];
		//screen = pts.divide(screen, 2);
		screen = pts.floor(screen);
		//screen = pts.even(screen, -1);
		//screen = [800, 600];
		screenCorrected = pts.clone(screen);
		if (DPI_UPSCALED_RT) {
			//screen = pts.floor(screen);
			screenCorrected = pts.mult(screen, ndpi);
			screenCorrected = pts.floor(screenCorrected);
			screenCorrected = pts.even(screenCorrected, -1);
		}
		console.log(`
		window inner ${pts.to_string(screen)}\n
		      new is ${pts.to_string(screenCorrected)}`);

		target.setSize(screenCorrected[0], screenCorrected[1]);
		targetMask.setSize(screenCorrected[0], screenCorrected[1]);

		plane = new PlaneBufferGeometry(screenCorrected[0], screenCorrected[1]);

		if (quadPost)
			quadPost.geometry = plane;

		const cameraMode = 0;

		if (cameraMode) {
			camera = new PerspectiveCamera(
				70, window.innerWidth / window.innerHeight, 1, 1000);
			//camera.zoom = camera.aspect; // scales "to fit" rather than zooming out
			camera.position.z = 800;
		}
		else {
			camera = make_orthographic_camera(screenCorrected[0], screenCorrected[1]);
		}

		camera2 = make_orthographic_camera(screenCorrected[0], screenCorrected[1]);
		camera2.updateProjectionMatrix();
		renderer.setSize(screen[0], screen[1]);
	}

	let mem = []

	export function load_texture(file: string, mode = 1, cb?, key?: string): Texture {
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

	export function make_render_target(w, h) {
		const o = {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			format: RGBAFormat
		};
		let target = new WebGLRenderTarget(w, h, o);
		return target;
	}

	export function make_orthographic_camera(w, h) {
		let camera = new OrthographicCamera(w / - 2, w / 2, h / 2, h / - 2, -100, 100);
		camera.updateProjectionMatrix();
		return camera;
	}

	export function erase_children(group: Group) {
		while (group.children.length > 0)
			group.remove(group.children[0]);
	}
}

export default ren;