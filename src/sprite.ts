import { Color, Mesh, BoxGeometry, PlaneBufferGeometry, MeshLambertMaterial, MeshLambertMaterialParameters, Shader, Matrix3, Vector2 } from "three";
import aabb2 from "./aabb2";

import lod, { numbers } from "./lod";
import pts from "./pts";
import ren from "./renderer";
import sprites from "./sprites";
import tiles from "./tiles";

interface SpriteParameters {
	binded: lod.obj,
	tuple: sprites.tuple,
	cell?: vec2,
	color?: vec4,
	opacity?: number
	mask?: string,
	orderBias?: number
};

export namespace sprite {
	export type params = sprite['vars'];
};

const useWireframe = false;

export class sprite extends lod.shape {
	dimetric = true
	aabbScreen: aabb2
	subsize: vec2 = [0, 0]
	rup = 0
	rup2 = 0
	rleft = 0
	calc: vec2 = [0, 0]
	mesh: Mesh
	wireframe: Mesh
	material: MeshLambertMaterial
	geometry: PlaneBufferGeometry
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

		this.aabbScreen = new aabb2([0, 0], size);
		let calc = this.calc;
		calc = pts.subtract(calc, pts.divide(size, 2));
		this.aabbScreen.translate(calc);
	}
	mousedSquare(mouse: Vec2) {
		if (this.aabbScreen?.test(new aabb2(mouse, mouse)))
			return true;
	}
	override dispose() {
		if (!this.mesh)
			return;
		this.geometry?.dispose();
		this.material?.dispose();
		this.mesh.parent?.remove(this.mesh);
		if (useWireframe)
			this.wireframe.parent?.remove(this.wireframe);
	}
	override update() {
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
			if (useWireframe) {
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

		this.geometry = new PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
		let color;
		if (this.vars.binded!.sector!.color) {
			color = new Color(this.vars.binded.sector!.color);
		}
		else {
			const c = this.vars.color || [255, 255, 255, 255];
			color = new Color(`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`);
		}
		this.material = SpriteMaterial({
			map: ren.load_texture(`${this.vars.tuple[3]}.png`, 0),
			transparent: true,
			color: color,
			opacity: this.vars.opacity
		}, {
			myUvTransform: this.myUvTransform
		});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		this.vars.binded.sector?.group.add(this.mesh);
		ren.groups.axisSwap.add(this.mesh);

		if (useWireframe) {
			this.wireframe = new Mesh(this.geometry, new MeshLambertMaterial({ wireframe: true }));
			this.wireframe.frustumCulled = false;
			this.wireframe.matrixAutoUpdate = false;
			ren.groups.axisSwap.add(this.wireframe);
		}

		this.update();
	}
};

export function SpriteMaterial(parameters: MeshLambertMaterialParameters, uniforms: any) {
	let material = new MeshLambertMaterial(parameters)
	material.customProgramCacheKey = function () {
		return 'spritemat';
	}
	material.name = "spritemat";
	material.onBeforeCompile = function (shader: Shader) {
		shader.defines = {};
		shader.uniforms.myUvTransform = { value: uniforms.myUvTransform }
		shader.vertexShader = shader.vertexShader.replace(
			`#include <common>`,
			`#include <common>
			uniform mat3 myUvTransform;
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
	}
	return material;
}

export default sprite;