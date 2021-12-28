import { Color, Mesh, BoxGeometry, PlaneBufferGeometry, MeshPhongMaterial, MeshPhongMaterialParameters, Shader, Matrix3, Vector2 } from "three";

import lod, { Counts } from "./lod";
import pts from "./pts";
import ren from "./renderer";

interface SpriteParameters {
	bind: lod.Obj,
	img: string,
	color?: vec4,
	mask?: string,
	offset?: vec2,
	repeat?: vec2
	center?: vec2
};

export namespace Sprite {
	export type Parameters = Sprite['properties'];
};

export class Sprite extends lod.Shape {
	dimetric = true
	mesh: Mesh | undefined
	material: MeshPhongMaterial
	geometry: PlaneBufferGeometry
	offset: vec2
	repeat: vec2
	center: vec2
	rotation
	spriteMatrix: Matrix3
	constructor(
		public readonly properties: SpriteParameters
	) {
		super(properties, Counts.Sprites);
		if (!this.properties.color)
			this.properties.color = [1, 1, 1, 1];
		this.offset = [0, 0];
		this.repeat = [1, 1];
		this.center = [0, 1];
		this.rotation = 0;
		this.spriteMatrix = new Matrix3;
	}
	update() {
		if (!this.mesh)
			return;

		let offset = this.properties.offset || [0, 0];
		let repeat = this.properties.repeat || [1, 1];
		let center = this.properties.center || [0, 1];

		this.spriteMatrix.setUvTransform(
			offset[0], offset[1],
			repeat[0], repeat[1],
			this.rotation,
			center[0], center[1]);

		this.mesh.rotation.z = this.properties.bind.rz

		const obj = this.properties.bind;

		let pos = pts.add(obj.rpos, pts.divide(obj.size, 2));

		this.mesh?.position.fromArray([...pos, 0]);
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
		let w = this.properties.bind.size[0];
		let h = this.properties.bind.size[1];
		this.geometry = new PlaneBufferGeometry(w, h)
		this.material = MySpriteMaterial({
			map: ren.load_texture(`${this.properties.img}.png`, 0),
			transparent: true,
			shininess: 0,
			color: new Color(`rgb(${this.properties.color![0]}, ${this.properties.color![1]}, ${this.properties.color![2]})}
			`)
		}, {
			spriteMatrix: this.spriteMatrix
		});
		this.mesh = new Mesh(this.geometry, this.material);
		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;
		this.update();
		//if (this.y.drawable.x.obj.sector)
		//	this.y.drawable.x.obj.sector.group.add(this.mesh);
		//else
		ren.groups.axisSwap.add(this.mesh);
		console.log('created sprite');
	}
};

function MySpriteMaterial(parameters: MeshPhongMaterialParameters, uniforms: any) {
	let material = new MeshPhongMaterial(parameters)
	material.name = "MeshPhongSpriteMat";
	material.onBeforeCompile = function (shader: Shader) {
		shader.defines = {};
		shader.uniforms.spriteMatrix = { value: uniforms.spriteMatrix }
		shader.vertexShader = shader.vertexShader.replace(
			`#define PHONG`,
			`#define PHONG
			uniform mat3 spriteMatrix;
			`
		);
		shader.vertexShader = shader.vertexShader.replace(
			`#include <uv_vertex>`,
			`#include <uv_vertex>
			#ifdef USE_UV
			vUv = ( spriteMatrix * vec3( uv, 1 ) ).xy;
			#endif
			`
		);
	}
	return material;
}

export default Sprite;