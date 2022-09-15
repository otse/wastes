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
	static focus: superobject
	id = 'an_objected_0'
	title = ''
	examine = ''
	isSuper = true
	paintTimer = 0
	paintedRed = false
	solid = true
	pixel?: colormap.pixel
	tile?: tiles.tile
	tileBound?: aabb2
	cell: vec2 = [0, 0]
	heightAdd = 0
	hints?: any
	//calc = 0 // used for tree leaves
	constructor(counts: numbers.tally) {
		super(counts);

	}
	tiled() {
		this.tile = tiles.get(pts.round(this.wpos));
		this.tileBound = new aabb2([-.5, -.5], [.5, .5]);
		this.tileBound.translate(this.wpos);
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
	set_shadow = (input) => {
		const sprite = this.shape as sprite;
		input = shadows.mix(
			input, pts.round(this.wpos));
		sprite.material.color.fromArray(input); // 0-1 based
	}
	hovering_pass() {
		const sprite = this.shape as sprite;
		let color = [1, 1, 1] as vec3;
		if (sprite.mousedSquare(wastes.gview.mrpos)) {
			color = [0.8, 0.8, 0.8];
			hovering_sprites.hover(sprite);
		}
		else {
			hovering_sprites.unhover(sprite);
		}
		return color;
	}
	tick() {
		//this.superobject_hovering_pass();
		if (this.paintedRed) {
			this.paintTimer += ren.delta;
			if (this.paintTimer > 1) {
				const sprite = this.shape as sprite;
				sprite.material.color.set('white');
				this.paintedRed = false;
				this.paintTimer = 0;
			}
		}
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
			sprite.rup = calc + this.heightAdd;
	}
	superobject_setup_context_menu() { // override me
	}
}