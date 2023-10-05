import lod from "../lod";
import pts from "../pts";
import ren from "../renderer";
import shadows from "../shadows";
import { hovering_sprites } from "../sprite";
import tiles from "../tiles";
import wastes from "../wastes";
export class superobject extends lod.obj {
    //calc = 0 // used for tree leaves
    constructor(counts) {
        super(counts);
        this.title = '';
        this.examine = '';
        this.isSuper = true;
        this.paintTimer = 0;
        this.paintedRed = false;
        this.cell = [0, 0];
        this.set_shadow_amount = (input) => {
            const sprite = this.shape;
            sprite.shadowAmount = shadows.get_amount(pts.round(this.wpos));
        };
    }
    rebound() {
        this.tile = tiles.get(pts.round(this.wpos));
        super.rebound();
    }
    onhit() {
        const sprite = this.shape;
        if (sprite) {
            sprite.material.color.set('red');
            this.paintedRed = true;
        }
    }
    hide() {
        console.log('superobject hide');
        hovering_sprites.unhover(this.shape);
        super.hide();
    }
    nettick() {
    }
    hovering_pass() {
        const sprite = this.shape;
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
                const sprite = this.shape;
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
    stack(fallthru = []) {
        let calc = 0;
        let stack = this.sector.stacked(pts.round(this.wpos));
        calc += this.z; // this fixes a bug
        for (let obj of stack) {
            if (obj.is_type(fallthru))
                continue;
            if (obj == this)
                break;
            calc += obj.z + obj.height;
        }
        this.calcz = calc;
        const sprite = this.shape;
        if (sprite)
            sprite.rup = calc;
    }
    superobject_setup_context_menu() {
    }
}