import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector2, Vector3, Color, RedFormat } from "three";

import App from "./app";

import pts from "./pts";
import ren from "./renderer";

import lod, { Counts } from "./lod";
import wests from "./wastes";
import hooks from "./hooks";

// the view manages what it sees


export class View {
	galaxy: lod.Galaxy
	zoom = .3
	wpos: vec2 = [5, 5]
	rpos: vec2 = [0, 0]
	mpos: vec2 = [0, 0]
	mwpos: vec2 = [0, 0]
	mrpos: vec2 = [0, 0]
	static make() {
		return new View
	}
	chart(big: vec2) {
	}
	constructor() {
		this.galaxy = new lod.Galaxy(10)
		this.rpos = pts.mult(this.wpos, lod.Unit)
	}
	add(obj: lod.Obj) {
		let sector = this.galaxy.atwpos(obj.wpos)
		sector.add(obj)
	}
	remove(obj: lod.Obj) {
		obj.sector?.remove(obj)
	}
	tick() {
		this.move();
		this.chase();
		this.mouse();
		this.stats();
		let wpos = lod.Galaxy.unproject(this.rpos);
		this.galaxy.update(wpos);
	}
	mouse() {
		let mouse = App.mouse();
		mouse = pts.subtract(mouse, pts.divide([ren.w, ren.h], 2));
		mouse = pts.mult(mouse, ren.ndpi);
		mouse[1] = -mouse[1];
		this.mrpos = pts.divide(pts.add(mouse, this.rpos), this.zoom);
		this.mwpos = lod.Galaxy.unproject(this.mrpos);
		// now..
		if (App.button(2) >= 1) {
			hooks.call('viewClick', this);
		}
	}
	move() {
		let pan = 3;
		const zoomFactor = 1 / 10;
		if (App.key('x')) pan *= 3;
		if (App.key('w')) this.rpos[1] += pan;
		if (App.key('s')) this.rpos[1] -= pan;
		if (App.key('a')) this.rpos[0] -= pan;
		if (App.key('d')) this.rpos[0] += pan;
		if (App.key('r') == 1) this.zoom -= zoomFactor;
		if (App.key('f') == 1) this.zoom += zoomFactor;
		const min = .1;
		const max = 1;
		this.zoom = this.zoom > max ? max : this.zoom < min ? min : this.zoom;
		this.wpos = lod.Galaxy.unproject(this.rpos);
		let inv = pts.inv(this.rpos);
		//Renderer.camera.scale.fromArray([this.zoom, this.zoom, this.zoom]);
		//ren.groups.dimetric.scale.fromArray([this.zoom, this.zoom, this.zoom])
		//Renderer.groups.dimetric.matrixAutoUpdate = false;
		//Renderer.groups.dimetric.updateMatrixWorld();
		//ren.groups.dimetric.position.set(inv[0], inv[1], 0)
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
		if (App.key('h') == 1)
			this.show = ! this.show;
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
		crunch += `view bigpos: ${pts.to_string(lod.Galaxy.big(this.wpos))}<br />`;
		crunch += `view zoom: ${this.zoom.toPrecision(2)}<br />`;
		crunch += '<br />';

		//crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
		crunch += `sectors: ${Counts.Sectors[0]} / ${Counts.Sectors[1]}<br />`;
		crunch += `game objs: ${Counts.Objs[0]} / ${Counts.Objs[1]}<br />`;
		crunch += `sprites: ${Counts.Sprites[0]} / ${Counts.Sprites[1]}<br />`;
		crunch += `trees: ${Counts.Trees[0]} / ${Counts.Trees[1]}<br />`;
		crunch += `tiles: ${Counts.Tiles[0]} / ${Counts.Tiles[1]}<br />`;
		crunch += '<br />';

		crunch += `controls: WASD, X to go fast, middlemouse to pan<br />`;

		let element = document.querySelectorAll('.stats')[0] as any
		element.innerHTML = crunch;
		element.style.visibility = this.show ? 'visible' : 'hidden';
	}
}


export default View;