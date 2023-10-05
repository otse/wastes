import { default as THREE, OrthographicCamera, Color } from "three";

import aabb2 from "../aabb2"
import colormap from "../colormap"
import lod, { numbers } from "../lod"
import pts from "../pts"
import ren from "../renderer"
import shadows from "../shadows";
import sprite, { hovering_sprites } from "../sprite"
import tiles from "../tiles"
import wastes from "../wastes"

export class superobject extends lod.obj {
	isSuper = true
	static focus: superobject
	title = ''
	examine = ''
	paintTimer = 0
	paintedRed = false
	pixel?: colormap.pixel
	tile?: tiles.tile
	cell: vec2 = [0, 0]
	hints?: any
	//calc = 0 // used for tree leaves
	constructor(counts: numbers.tally) {
		super(counts);
	}
	override rebound() {
		this.tile = tiles.get(pts.round(this.wpos));
		super.rebound();
	}
	onhit() {
		const sprite = this.shape as sprite;
		if (sprite) {
			sprite.material.color.set('red');
			this.paintedRed = true;
		}
	}
	override hide() {
		console.log('superobject hide');
		hovering_sprites.unhover(this.shape as sprite);
		super.hide();
	}
	nettick() {
	}
	set_shadow_amount = (input) => {
		const sprite = this.shape as sprite;
		sprite.shadowAmount = shadows.get_amount(pts.round(this.wpos));
	}
	hovering_pass() {
		const sprite = this.shape as sprite;
		if (sprite.mousing(wastes.gview.mrpos)) {
			hovering_sprites.hover(sprite);
		}
		else {
			hovering_sprites.unhover(sprite);
		}
	}
	tick() {
		//this.superobject_hovering_pass();
		if (this.paintedRed) {
			this.paintTimer += ren.delta;
			if (this.paintTimer > 1) {
				const sprite = this.shape as sprite;
				this.paintedRed = false;
				this.paintTimer = 0;
			}
		}
		this.obj_manual_update();
	}
	//update(): void {
	//	this.tiled();
	//	super.update();
	//}
	/*
	this function stacks with z and height
	
	*/
	stack(fallthru: string[] = []) {
		let calc = 0;
		let stack = this.sector!.stacked(pts.round(this.wpos));
		calc += this.z; // this fixes a bug
		for (let obj of stack) {
			if (obj.is_type(fallthru))
				continue;
			if (obj == this)
				break;
			calc += obj.z + obj.height;
		}
		this.calcz = calc;
		const sprite = this.shape as sprite;
		if (sprite)
			sprite.rup = calc;
	}
	superobject_setup_context_menu() { // override me
	}
}