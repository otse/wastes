import { Color, Mesh, BoxGeometry, PlaneBufferGeometry, MeshBasicMaterial, MeshBasicMaterialParameters, Shader, Matrix3, Vector2 } from "three";

import lod, { Numbers } from "./lod";
import pts from "./pts";
import ren from "./renderer";

interface SpriteParameters {
	bind: lod.Obj,
	img: string,
	color?: vec4,
	mask?: string,
	z?: number
};

export namespace Sprite {
	export type Parameters = Sprite['pars'];
};

export class Sprite extends lod.Shape {
	dimetric = true
	mesh: Mesh
	material: MeshBasicMaterial
	geometry: PlaneBufferGeometry
	spriteMatrix: Matrix3
	constructor(
		public readonly pars: SpriteParameters
	) {
		super(pars, Numbers.Sprites);
		this.spriteMatrix = new Matrix3;
	}
	update() {
		if (!this.mesh)
			return;

		this.mesh.rotation.z = this.pars.bind.rz;

		const obj = this.pars.bind;

		let pos = pts.add(obj.rpos, pts.divide(obj.size, 2));

		this.mesh?.position.fromArray([...pos, this.pars.z || 0]);
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

		this.geometry = new PlaneBufferGeometry(
			this.pars.bind.size[0], this.pars.bind.size[1]);

		const color = this.pars.color || [255, 255, 255, 255];

		this.material = SpriteMaterial({
			map: ren.load_texture(`${this.pars.img}.png`, 0),
			transparent: true,
			color: new Color(`rgb(${color[0]}, ${color[1]}, ${color[2]})}
			`)
		}, {
			
		});

		this.mesh = new Mesh(
			this.geometry, this.material);

		this.mesh.frustumCulled = false;
		this.mesh.matrixAutoUpdate = false;

		this.update();
		
		ren.groups.axisSwap.add(this.mesh);
	}
};

function SpriteMaterial(parameters: MeshBasicMaterialParameters, uniforms: any) {
	let material = new MeshBasicMaterial(parameters)
	material.name = "SpriteMaterial";
	material.onBeforeCompile = function (shader: Shader) {
		shader.defines = {};
		/*shader.vertexShader = shader.vertexShader.replace(
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
		);*/
	}
	return material;
}

export default Sprite;