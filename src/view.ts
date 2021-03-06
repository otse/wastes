import { Mesh, PlaneBufferGeometry, MeshBasicMaterial, Vector2, Vector3, Color, RedFormat } from "three";

import app from "./app";

import pts from "./pts";
import ren from "./renderer";

import lod, { numbers } from "./lod";
import wastes from "./wastes";
import hooks from "./hooks";
import tiles from "./tiles";

// the view manages what it sees

export class view {
	zoom = 0.33
	zoomIndex = 4
	zooms = [1, 0.5, 0.33, 0.2, 0.1, 0.05]
	wpos: vec2 = [40, 48]
	rpos: vec2 = [0, 0]
	mpos: vec2 = [0, 0]
	mwpos: vec2 = [0, 0]
	mrpos: vec2 = [0, 0]
	mrpos2: vec2 = [0, 0]
	static make() {
		return new view;
	}
	chart(big: vec2) {
	}
	constructor() {
		new lod.galaxy(10);
		this.rpos = lod.project(this.wpos);
	}
	remove(obj: lod.obj) {
		obj.sector?.remove(obj);
	}
	tick() {
		this.move();
		this.mouse();
		this.pan();
		this.chase();
		this.stats();
		this.wpos = lod.unproject(this.rpos);
		lod.ggalaxy.update(this.wpos);
		const zoom = wastes.gview.zoom;
		ren.camera.scale.set(zoom, zoom, zoom);
		ren.camera.updateProjectionMatrix();
	}
	begin: vec2 = [0, 0]
	before: vec2 = [0, 0]
	pan() {
		let continousMode = true;
		const panDivisor = -1;
		const continuousSpeed = -100;
		if (app.button(1) == 1) {
			let mouse = app.mouse();
			mouse[1] = -mouse[1];
			this.begin = mouse;
			this.before = pts.clone(this.rpos);
		}
		if (app.button(1) >= 1) {
			let mouse = app.mouse();
			mouse[1] = -mouse[1];
			let dif = pts.subtract(this.begin, mouse);
			if (continousMode) {
				dif = pts.divide(dif, continuousSpeed);
				this.rpos = pts.add(this.rpos, dif);
			}
			else {
				dif = pts.divide(dif, panDivisor);
				// necessary mods
				dif = pts.mult(dif, ren.ndpi);
				dif = pts.mult(dif, this.zoom);
				dif = pts.subtract(dif, this.before);
				this.rpos = pts.inv(dif);
				//this.rpos = pts.floor(this.rpos); // floor 
			}
		}
		else if (app.button(1) == -1) {
			console.log('woo');
			this.rpos = pts.floor(this.rpos);
		}
	}
	chase() {
		const smooth = false;
		if (smooth) {
			this.rpos = pts.floor(this.rpos);
		}
		// let inv = pts.inv(this.rpos);
		// ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
		ren.camera.position.set(this.rpos[0], this.rpos[1], 0);
	}
	mouse() {
		let mouse = app.mouse();
		mouse = pts.subtract(mouse, pts.divide([ren.screen[0], ren.screen[1]], 2));
		mouse = pts.mult(mouse, ren.ndpi);
		mouse = pts.mult(mouse, this.zoom);
		mouse[1] = -mouse[1];
		this.mrpos = pts.add(mouse, this.rpos);

		this.mrpos2 = pts.subtract(this.mrpos, [0, 3]); // why minus 3 ?

		this.mrpos = pts.add(this.mrpos, lod.project([.5, -.5])); // correction
		this.mwpos = lod.unproject(this.mrpos);
		//this.mwpos = pts.add(this.mwpos, [.5, -.5])
		// now..
		if (app.button(0) == 1) {
			hooks.call('viewLClick', this);
		}
		if (app.button(1) == 1) {
			hooks.call('viewMClick', this);
		}
		if (app.button(2) == 1) {
			hooks.call('viewRClick', this);
		}
	}
	move() {
		let pan = 10;
		const zoomFactor = 1 / 10;
		if (app.key('x'))
			pan *= 2;
		let add: vec2 = [0, 0];
		if (app.key('arrowup'))
			add = pts.add(add, [0, pan]);
		if (app.key('arrowdown'))
			add = pts.add(add, [0, -pan]);
		if (app.key('arrowleft'))
			add = pts.add(add, [-pan, 0]);
		if (app.key('arrowright'))
			add = pts.add(add, [pan, 0]);
		if ((app.key('f') == 1 || app.wheel == -1) && this.zoomIndex > 0)
			this.zoomIndex -= 1;
		if ((app.key('r') == 1 || app.wheel == 1) && this.zoomIndex < this.zooms.length - 1)
			this.zoomIndex += 1;
		this.zoom = this.zooms[this.zoomIndex];
		add = pts.mult(add, this.zoom);
		add = pts.floor(add);
		this.rpos = pts.add(this.rpos, add);
	}
	show = true
	stats() {
		if (app.key('h') == 1)
			this.show = !this.show;
		let crunch = ``;
		crunch += `DPI_UPSCALED_RT: ${ren.DPI_UPSCALED_RT}<br />`;
		crunch += '<br />';

		crunch += `dpi: ${ren.ndpi}<br />`;
		crunch += `fps: ${ren.fps}<br />`;
		crunch += `delta: ${ren.delta.toPrecision(6)}<br />`;
		crunch += '<br />';

		crunch += `textures: ${ren.renderer.info.memory.textures}<br />`;
		crunch += `programs: ${ren.renderer.info.programs.length}<br />`;
		//crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
		crunch += '<br />';

		//crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
		//crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
		crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
		crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
		crunch += '<br />';

		crunch += `lod grid size: ${lod.ggrid.spread * 2 + 1} / ${lod.ggrid.outside * 2 + 1}<br />`;
		crunch += `mouse tile: ${pts.to_string(tiles.hovering?.wpos || [0, 0])}<br />`;
		crunch += `view bigpos: ${pts.to_string(lod.ggalaxy.big(this.wpos))}<br />`;
		crunch += `view zoom: ${this.zoom}<br />`;
		crunch += '<br />';

		//crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
		crunch += `sectors: ${numbers.sectors[0]} / ${numbers.sectors[1]}<br />`;
		crunch += `game objs: ${numbers.objs[0]} / ${numbers.objs[1]}<br />`;
		crunch += `sprites: ${numbers.sprites[0]} / ${numbers.sprites[1]}<br />`;
		crunch += `tiles: ${numbers.tiles[0]} / ${numbers.tiles[1]}<br />`;
		crunch += `trees: ${numbers.trees[0]} / ${numbers.trees[1]}<br />`;
		crunch += `leaves: ${numbers.leaves[0]} / ${numbers.leaves[1]}<br />`;
		crunch += `floors: ${numbers.floors[0]} / ${numbers.floors[1]}<br />`;
		crunch += `walls: ${numbers.walls[0]} / ${numbers.walls[1]}<br />`;
		crunch += `roofs: ${numbers.roofs[0]} / ${numbers.roofs[1]}<br />`;
		crunch += '<br />';

		crunch += `controls: rclick for context menu, click to move or WASD, hold middlemouse to pan, scrollwheel to zoom, spacebar to toggle roofs, h to hide debug, c for character menu<br />`;

		let element = document.querySelectorAll('.stats')[0] as any;
		element.innerHTML = crunch;
		element.style.visibility = this.show ? 'visible' : 'hidden';
	}
}


export default view;