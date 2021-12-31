import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector2, Vector3, Color, RedFormat } from "three";

import app from "./app";

import pts from "./pts";
import ren from "./renderer";

import lod, { Numbers } from "./lod";
import wastes from "./wastes";
import hooks from "./hooks";

// the view manages what it sees


export class View {
	zoom = 0.5
	wpos: vec2 = [0, 0]
	rpos: vec2 = [0, 0]
	mpos: vec2 = [0, 0]
	mwpos: vec2 = [0, 0]
	mrpos: vec2 = [0, 0]
	static make() {
		return new View;
	}
	chart(big: vec2) {
	}
	constructor() {
		lod.galaxy = new lod.Galaxy(10);
		this.rpos = lod.galaxy.project(this.wpos);
	}
	add(obj: lod.Obj) {
		lod.galaxy.add(obj);
	}
	remove(obj: lod.Obj) {
		obj.sector?.remove(obj);
	}
	tick() {
		this.move();
		this.chase();
		this.mouse();
		this.stats();
		this.wpos = lod.galaxy.unproject(this.rpos);
		lod.galaxy.update(this.wpos);
	}
	mouse() {
		let mouse = app.mouse();
		mouse = pts.subtract(mouse, pts.divide([ren.w, ren.h], 2));
		mouse = pts.mult(mouse, ren.ndpi);
		mouse[1] = -mouse[1];
		this.mrpos = pts.divide(pts.add(mouse, this.rpos), this.zoom);
		this.mwpos = lod.galaxy.unproject(this.mrpos);
		// now..
		if (app.button(2) >= 1) {
			hooks.call('viewClick', this);
		}
	}
	move() {
		let pan = 10;
		const zoomFactor = 1 / 10;
		if (app.key('x'))
			pan *= 2;
		if (app.key('w'))
			this.rpos = pts.add(this.rpos, [0, pan]);
		if (app.key('s'))
			this.rpos = pts.add(this.rpos, [0, -pan]);
		if (app.key('a'))
			this.rpos = pts.add(this.rpos, [-pan, 0]);
		if (app.key('d'))
			this.rpos = pts.add(this.rpos, [pan, 0]);
		if (app.key('r') == 1)
			this.zoom -= zoomFactor;
		if (app.key('f') == 1)
			this.zoom += zoomFactor;
		//this.rpos = lod.galaxy.project(this.wpos);
		const min = .1;
		const max = 1;
		this.zoom = this.zoom > max ? max : this.zoom < min ? min : this.zoom;
	}
	chase() {
		const time = ren.delta;
		pts.mult([0, 0], 0);
		//let ply = PRY.ply.rpos;
		//this.rpos = pts.add(pts.mult(pts.subtract(ply, this.rpos), time * 5), this.rpos);
		//this.rpos = pts.mult(this.rpos, this.zoom);
		let inv = pts.inv(this.rpos);
		ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
	}
	show = true
	stats() {
		if (app.key('h') == 1)
			this.show = !this.show;
		let crunch = ``;
		crunch += `DPI_UPSCALED_RT: ${ren.DPI_UPSCALED_RT}<br />`;
		//crunch += `MODELER: ${wests.CRPG}<br />`
		crunch += '<br />';

		crunch += `dpi: ${ren.ndpi}<br />`;
		crunch += `fps: ${ren.fps} / ${ren.delta.toPrecision(3)}<br />`;
		crunch += '<br />';

		crunch += `textures: ${ren.renderer.info.memory.textures}<br />`;
		crunch += `programs: ${ren.renderer.info.programs.length}<br />`;
		crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
		crunch += '<br />';

		//crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
		//crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
		crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
		crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
		crunch += '<br />';

		crunch += `view wpos: ${pts.to_string(pts.floor(this.wpos))}<br />`;
		crunch += `view bigpos: ${pts.to_string(lod.galaxy.big(this.wpos))}<br />`;
		crunch += `view zoom: ${this.zoom.toPrecision(2)}<br />`;
		crunch += '<br />';

		//crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
		crunch += `sectors: ${Numbers.Sectors[0]} / ${Numbers.Sectors[1]}<br />`;
		crunch += `game objs: ${Numbers.Objs[0]} / ${Numbers.Objs[1]}<br />`;
		crunch += `sprites: ${Numbers.Sprites[0]} / ${Numbers.Sprites[1]}<br />`;
		crunch += `trees: ${Numbers.Trees[0]} / ${Numbers.Trees[1]}<br />`;
		crunch += `tiles: ${Numbers.Tiles[0]} / ${Numbers.Tiles[1]}<br />`;
		crunch += '<br />';

		crunch += `controls: WASD, X to go fast, middlemouse to pan<br />`;

		let element = document.querySelectorAll('.stats')[0] as any
		element.innerHTML = crunch;
		element.style.visibility = this.show ? 'visible' : 'hidden';
	}
}


export default View;