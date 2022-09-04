import { Color, Mesh, BoxGeometry, PlaneGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Shader, Matrix3, Vector2 } from "three";
import aabb2 from "./aabb2";

import lod, { numbers } from "./lod";
import pts from "./pts";
import ren, { THREE } from "./renderer";
import sprites from "./sprites";
import tiles from "./tiles";
import wastes from "./wastes";

interface SpriteParameters {
	binded: lod.obj,
	tuple: sprites.tuple,
	cell?: vec2,
	color?: vec4,
	opacity?: number
	orderBias?: number
	mask?: boolean,
	negativeMask?: boolean
	masked?: boolean
};

export namespace sprite {
	export type params = sprite['vars'];
};

const show_wire_frames = false;

// hovering sprites was made for contextmenu to get a more accurate sprite
export namespace hovering_sprites {
	export var sprites: sprite[] = []
	export function hover(sprite: sprite) {
		let i = sprites.indexOf(sprite);
		if (i == -1)
			sprites.push(sprite);
	}
	export function unhover(sprite: sprite) {
		let i = sprites.indexOf(sprite);
		if (i != -1)
			sprites.splice(i, 1);
	}
	export function sort_closest_to_mouse() {
		sprites.sort((a: sprite, b: sprite) => {
			const dist_a = pts.distsimple(wastes.gview.mrpos, a.aabbScreen.center());
			const dist_b = pts.distsimple(wastes.gview.mrpos, b.aabbScreen.center());
			if (dist_a < dist_b)
				return -1;
			else
				return 1;
		})
	}
};

export class sprite extends lod.shape {
	static masks: sprite[] = []
	writez = true
	dimetric = true
	aabbScreen: aabb2
	subsize: vec2 = [0, 0]
	rup = 0
	rup2 = 0
	rleft = 0
	calc: vec2 = [0, 0]
	mesh: Mesh
	meshMask: Mesh
	wireframe: Mesh
	material: MeshLambertMaterial
	geometry: PlaneGeometry
	roffset: vec2 = [0, 0]
	myUvTransform: Matrix3
	constructor(
		public readonly vars: SpriteParameters
	) {
		super(vars.binded, numbers.sprites);
		if (!this.vars.cell)
			this.vars.cell = [0, 0];
		if (!this.vars.orderBias)
			this.vars.orderBias = 0;
		if (!this.vars.opacity)
			this.vars.opacity = 1;
		this.myUvTransform = new Matrix3;
		this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
	}
	bound() {
		let size = this.vars.binded.size;

		if (pts.together(this.subsize))
			size = this.subsize;

		let calc = this.calc;

		this.aabbScreen = new aabb2([0, 0], size);
		calc = pts.subtract(calc, pts.divide(size, 2));

		//calc = pts.add(calc, [this.rleft, this.rup + this.rup2]);
		this.aabbScreen.translate(calc);
	}
	mousedSquare(mouse: Vec2) {
		if (this.aabbScreen?.test(new aabb2(mouse, mouse)))
			return true;
	}
	override dispose() {
		if (!this.mesh)
			return;
		hovering_sprites.unhover(this);
		this.geometry?.dispose();
		this.material?.dispose();
		this.mesh.parent?.remove(this.mesh);
		if (this.vars.mask)
			this.meshMask.parent?.remove(this.meshMask);
		if (show_wire_frames)
			this.wireframe.parent?.remove(this.wireframe);
	}
	override shape_manual_update() {
		if (!this.mesh)
			return;
		const obj = this.vars.binded;
		let calc = obj.rpos;

		if (this.dimetric)
			// move bottom left corner
			calc = pts.add(obj.rpos, pts.divide(obj.size, 2));
		//else
		//	calc = pts.add(obj.rpos, [0, obj.size[1]]);

		calc = pts.add(calc, [this.rleft, this.rup + this.rup2]);

		this.calc = calc;

		this.bound();

		if (this.mesh) {
			this.retransform();
			this.mesh.position.fromArray([...calc, 0]);
			// Not rounding gives us much better depth
			let pos = obj.wpos; // pts.round(obj.wpos);
			// Experimental z elevation based bias!
			let zBasedBias = 0;
			//zBasedBias = this.vars.binded.z / 3;
			this.mesh.renderOrder = -pos[1] + pos[0] + this.vars.orderBias! + zBasedBias;
			this.mesh.rotation.z = this.vars.binded.ro;
			this.mesh.updateMatrix();

			if (this.vars.mask) {
				this.meshMask.position.fromArray([...calc, 0]);
				this.meshMask.renderOrder = -pos[1] + pos[0] + this.vars.orderBias!;
				this.meshMask.updateMatrix();
			}
			if (show_wire_frames) {
				this.wireframe.position.fromArray([...calc, 0]);
				this.wireframe.renderOrder = this.mesh.renderOrder + 10;
				this.wireframe.updateMatrix();
			}
		}
	}
	retransform() {
		this.myUvTransform.copy(sprites.get_uv_transform(this.vars.cell!, this.vars.tuple));
	}
	override create() {
		//console.log('create');

		const obj = this.vars.binded;

		this.retransform();

		this.geometry = new PlaneGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
		let color;
		if (this.vars.binded!.sector!.color) {
			color = new Color(this.vars.binded.sector!.color);
		}
		else {
			const c = this.vars.color || [255, 255, 255, 255];
			color = new Color(`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`);
		}
		let defines = {} as any;
		if (this.vars.masked) {
			defines.MASKED = 1;
		}
		this.material = SpriteMaterial({
			map: ren.load_texture(`${this.vars.tuple[3]}.png`, 0),
			transparent: true,
			color: color,
			opacity: this.vars.opacity,
			depthWrite: false,
			depthTest: false,
		}, {
			myUvTransform: this.myUvTransform,
			masked: this.vars.masked
		}, defines);
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		if (this.vars.mask) {
			this.meshMask = this.mesh.clone();
			if (this.vars.negativeMask) {
				this.meshMask.material = this.material.clone();
				this.meshMask.material.blending = THREE.CustomBlending;
				this.meshMask.material.blendEquation = THREE.ReverseSubtractEquation;
				
			}
		}
		// this.vars.binded.sector?.group.add(this.mesh);
		ren.groups.axisSwap.add(this.mesh);

		if (this.vars.mask)
			ren.sceneMask.add(this.meshMask);

		if (show_wire_frames) {
			this.wireframe = new Mesh(this.geometry, new MeshLambertMaterial({ wireframe: true }));
			this.wireframe.frustumCulled = false;
			this.wireframe.matrixAutoUpdate = false;
			ren.groups.axisSwap.add(this.wireframe);
		}

		this.shape_manual_update();
	}
};

export function SpriteMaterial(parameters: MeshLambertMaterialParameters, uniforms: any, defines: any = {}) {
	let material = new MeshLambertMaterial(parameters)
	material.customProgramCacheKey = function () {
		return 'spritemat';
	}
	material.name = "spritemat";
	material.defines = defines;
	material.onBeforeCompile = function (shader: Shader) {

		shader.uniforms.myUvTransform = { value: uniforms.myUvTransform }
		if (uniforms.masked) {
			shader.uniforms.tMask = { value: ren.targetMask.texture }
			console.log('add tmask');
		}
		shader.vertexShader = shader.vertexShader.replace(
			`#include <common>`,
			`#include <common>
			varying vec2 myPosition;
			uniform mat3 myUvTransform;
			`
		);
		shader.vertexShader = shader.vertexShader.replace(
			`#include <worldpos_vertex>`,
			`#include <worldpos_vertex>
			vec4 worldPosition = vec4( transformed, 1.0 );
			worldPosition = modelMatrix * worldPosition;

			myPosition = (projectionMatrix * mvPosition).xy / 2.0 + vec2(0.5, 0.5);
			`
		);
		shader.vertexShader = shader.vertexShader.replace(
			`#include <uv_vertex>`,
			`
			#ifdef USE_UV
			vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
			#endif
			`
		);
		shader.fragmentShader = shader.fragmentShader.replace(
			`#include <map_pars_fragment>`,
			`
			#include <map_pars_fragment>
			varying vec2 myPosition;
			uniform sampler2D tMask;
			`
		);
		shader.fragmentShader = shader.fragmentShader.replace(
			`#include <map_fragment>`,
			`
			#include <map_fragment>
			#ifdef MASKED
			vec4 texelColor = texture2D( tMask, myPosition );
			
			texelColor.rgb = mix(texelColor.rgb, vec3(0.15, 0.3, 0.15), 0.7);
			
			if (texelColor.a > 0.5)
			diffuseColor.rgb = texelColor.rgb;
			#endif
			`
		);
	}
	return material;
}

export default sprite;