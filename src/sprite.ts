import { Color, Mesh, BoxGeometry, PlaneBufferGeometry, MeshBasicMaterial, MeshBasicMaterialParameters, Shader, Matrix3, Vector2 } from "three";

import lod, { Numbers } from "./lod";
import pts from "./pts";
import ren from "./renderer";
import tiles from "./tiles";

interface SpriteParameters {
	bindObj: lod.Obj,
	img: string,
	color?: vec4,
	mask?: string,
	orderOffset?: number
};

export namespace Sprite {
	export type Parameters = Sprite['pars'];
};

export class Sprite extends lod.Shape {
	z = 0
	mesh: Mesh
	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry
	roffset: vec2 = [0, 0]
	offset: vec2 = [0, 0]
	repeat: vec2 = [1, 1]
	center: vec2 = [0, 1]
	myUvTransform: Matrix3
	constructor(
		public readonly pars: SpriteParameters
	) {
		super(pars.bindObj, Numbers.Sprites);
		this.myUvTransform = new Matrix3;
	}
	update() {
		if (!this.mesh)
			return;
		this.mesh.rotation.z = this.pars.bindObj.rz;
		const obj = this.pars.bindObj;
		
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
		const obj = this.pars.bindObj;

		this.myUvTransform.setUvTransform(
			this.offset[0], this.offset[1],
			this.repeat[0], this.repeat[1],
			0,
			this.center[0], this.center[1]);

		this.geometry = new PlaneBufferGeometry(
			this.pars.bindObj.size[0], this.pars.bindObj.size[1]);
		let color;
		if (this.pars.bindObj!.sector!.color)
		{
			color = new Color(this.pars.bindObj!.sector!.color);
		}
		else
		{
			const c = this.pars.color || [255, 255, 255, 255];
			color = new Color(`rgb(${c[0]}, ${c[1]}, ${c[2]})}`);
		}
		this.material = SpriteMaterial({
			map: ren.load_texture(`${this.pars.img}.png`, 0),
			transparent: true,
			color: color
		}, {
			myUvTransform: this.myUvTransform
		});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		this.mesh.renderOrder = -obj.wpos[1] + obj.wpos[0] + (this.pars.orderOffset || 0);
		this.update();
		const sector = this.pars.bindObj.sector;
		sector?.group.add(this.mesh);
		ren.groups.axisSwap.add(this.mesh);
	}
};

function SpriteMaterial(parameters: MeshBasicMaterialParameters, uniforms: any) {
	let material = new MeshBasicMaterial(parameters)
	material.name = "SpriteMaterial";
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

export default Sprite;