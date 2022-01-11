import { Color, Mesh, BoxGeometry, PlaneBufferGeometry, MeshBasicMaterial, MeshBasicMaterialParameters, Shader, Matrix3, Vector2 } from "three";

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
	mask?: string,
	order?: number
};

export namespace sprite {
	export type params = sprite['vars'];
};

export class sprite extends lod.shape {
	z = 0
	mesh: Mesh
	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry
	roffset: vec2 = [0, 0]
	myUvTransform: Matrix3
	constructor(
		public readonly vars: SpriteParameters
	) {
		super(vars.binded, numbers.sprites);
		if (!this.vars.cell)
			this.vars.cell = [0, 0];
		this.myUvTransform = new Matrix3;
		this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
	}
	update() {
		if (!this.mesh)
			return;
		this.mesh.rotation.z = this.vars.binded.rz;
		const obj = this.vars.binded;

		let rpos = pts.add(obj.rpos, pts.divide(obj.size, 2));
		rpos = pts.add(rpos, pts.add(this.roffset, [0, this.z]));
		this.mesh?.position.fromArray([...rpos, 0]);
		this.mesh?.updateMatrix();
	}
	dispose() {
		if (!this.mesh)
			return;
		this.geometry?.dispose();
		this.material?.dispose();
		this.mesh.parent?.remove(this.mesh);
	}
	create() {
		const obj = this.vars.binded;

		this.myUvTransform = sprites.get_uv_transform(this.vars.cell!, this.vars.tuple);

		this.geometry = new PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
		let color;
		if (this.vars.binded!.sector!.color) {
			color = new Color(this.vars.binded.sector!.color);
		}
		else {
			const c = this.vars.color || [255, 255, 255, 255];
			color = new Color(`rgb(${c[0]}, ${c[1]}, ${c[2]})}`);
		}
		this.material = SpriteMaterial({
			map: ren.load_texture(`${this.vars.tuple[3]}.png`, 0),
			transparent: true,
			color: color
		}, {
			myUvTransform: this.myUvTransform
		});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		this.mesh.renderOrder = -obj.wpos[1] + obj.wpos[0] + (this.vars.order || 0);
		this.update();
		this.vars.binded.sector?.group.add(this.mesh);
		ren.groups.axisSwap.add(this.mesh);
	}
};

function SpriteMaterial(parameters: MeshBasicMaterialParameters, uniforms: any) {
	let material = new MeshBasicMaterial(parameters)
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