import { default as THREE, LoadingManager, TextureLoader, Texture, Group, Mesh, Shader, Matrix3, AxesHelper, DirectionalLight, MeshLambertMaterial, MeshLambertMaterialParameters, BoxGeometry } from "three";
import app from "./app";

import ren from './renderer';
import wastes from "./wastes";

namespace shear {

	export var started = false;

	var canvas, ctx;
	var spare, spareCtx;
	var room, roomCtx;

	export function start() {
		started = true;

		document.title = 'shear';

		spare = document.createElement("canvas") as HTMLCanvasElement;
		spareCtx = spare.getContext('2d')!;
		spare.width = 24;
		spare.height = 40;
		spare.style.position = 'relative';
		spare.style.zoom = '3';
		spare.style.display = 'block';

		room = document.createElement("canvas") as HTMLCanvasElement;
		roomCtx = room.getContext('2d')!;
		room.width = 300;
		room.height = 300;
		room.style.position = 'relative';
		room.style.zoom = '3';
		room.style.display = 'block';

		canvas = document.createElement("canvas") as HTMLCanvasElement;
		canvas.width = 24 * 9;
		canvas.height = 40;
		canvas.id = "shear";
		canvas.style.position = 'relative';
		canvas.style.margin = '0px auto';
		canvas.style.zoom = '3';
		ctx = canvas.getContext('2d')!;

		var walls = document.getElementById('walls')
		var goal = document.getElementById('goal')
		
		ctx.drawImage(walls, 0, 0);

		ctx.globalCompositeOperation = 'source-atop';
		ctx.drawImage(goal, 0, 0);

		ctx.drawImage(goal, 24, 0);
		ctx.drawImage(goal, 24 * 5, 0);
		ctx.drawImage(goal, 24 * 6, 0);
		spareCtx.drawImage(canvas, -24 * 5, 0);
		ctx.drawImage(spare, 24 * 2 + 6, -3);
		ctx.drawImage(spare, 24 * 3 + 6, -3);
		ctx.drawImage(spare, 24 * 7 + 6, -3);
		spareCtx.clearRect(0, 0, 24, 40);
		spareCtx.drawImage(canvas, -24 * 6, 0);
		ctx.drawImage(spare, 24 * 2 , 0);
		spareCtx.clearRect(12 + 6, 0, 24, 40);
		ctx.drawImage(spare, 24 * 3 - 6, -3);
		spareCtx.drawImage(canvas, -24 * 6, 0);
		ctx.drawImage(spare, 24 * 4 - 6, -3);
		ctx.drawImage(spare, 24 * 8 - 6, -3);
		spareCtx.clearRect(0, 0, 24, 40);
		spareCtx.drawImage(canvas, -24 * 5, 0);
		ctx.drawImage(spare, 24 * 4, 0);

		document.body.append(canvas);
		document.body.append(spare);
		document.body.append(room);

	}

	export function tick() {
		if (!started)
			return;

		let crunch = `shear`;

		let element = document.querySelectorAll('.stats')[0] as any;
		element.innerHTML = crunch;

	}

}

export default shear;