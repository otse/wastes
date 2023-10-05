import wastes from "./wastes";
import lod, { numbers } from "./lod";
import pts from "./pts";
import hooks from "./hooks";
import sprite from "./sprite";
import sprites from "./sprites";
import shadows from "./shadows";
export var tiles;
(function (tiles) {
    const mapSize = 100;
    const dont_show_tiles = false;
    tiles.started = false;
    var arrays = [];
    const color_gravel = [110, 122, 115];
    tiles.hovering = undefined;
    function get(pos) {
        if (arrays[pos[1]])
            return arrays[pos[1]][pos[0]];
    }
    tiles.get = get;
    function register() {
        console.log(' tiles register ');
        // this runs before the objects hooks
        hooks.register('sectorCreate', (sector) => {
            pts.func(sector.small, (pos) => {
                let x = pos[0];
                let y = pos[1];
                if (arrays[y] == undefined)
                    arrays[y] = [];
                let pixel = wastes.colormap.pixel([x, y]);
                if (pixel.arrayRef[3] == 0)
                    return;
                let tile = new tiles.tile([x, y]);
                arrays[y][x] = tile;
                lod.add(tile);
            });
            return false;
        });
    }
    tiles.register = register;
    function start() {
        tiles.started = true;
        console.log(' tiles start ');
        //lod.gworld.at(lod.world.big(wastes.gview.wpos));
    }
    tiles.start = start;
    function tick() {
        if (!tiles.started)
            return;
        for (let i = 20; i >= 0; i--) {
            // The great pretention grid
            let mrpos = pts.add(wastes.gview.mrpos, lod.project([.5, -.5]));
            let wpos = lod.unproject(pts.add(mrpos, [0, -i]));
            wpos = pts.floor(wpos);
            const tile = get(wpos);
            if (tile && tile.z + tile.height + tile.heightAdd == i) {
                if (tile.sector.isActive()) {
                    tile.hover();
                    tiles.hovering = tile;
                    break;
                }
            }
        }
    }
    tiles.tick = tick;
    const color_shallow_water = [40, 120, 130];
    const color_deep_water = [20, 100, 110];
    class tile extends lod.obj {
        constructor(wpos) {
            super(numbers.tiles);
            this.hasDeck = false;
            this.isLand = false;
            this.refresh = false;
            this.opacity = 1;
            this.superiorBias = 1;
            this.heightAdd = 0;
            this.wpos = wpos;
            let pixel = wastes.colormap.pixel(this.wpos);
            if (pixel.is_invalid_pixel()) {
                // We are fog of war
                console.log('invalid pixel');
                this.type = 'land';
                this.size = [24, 30];
                this.tuple = sprites.dgraveltiles;
                this.color = [60, 60, 60];
                this.height = 6;
                this.cell = [1, 0];
            }
            else if (pixel.is_shallow_water()) {
                // We are a shallow water
                this.type = 'shallow water';
                this.size = [24, 12];
                this.tuple = sprites.dwater;
                //this.height = -5;
                this.opacity = .5;
                this.color = color_shallow_water;
            }
            else if (pixel.is_black()) {
                // We are a deep water
                this.type = 'deep water';
                this.size = [24, 12];
                this.tuple = sprites.dwater;
                this.opacity = .5;
                this.color = color_deep_water;
                this.solid = true;
                this.rebound();
            }
            else if (!pixel.is_black()) {
                // We're a land tile
                console.log('common land tile');
                this.isLand = true;
                this.type = 'land';
                this.size = [24, 30];
                this.tuple = sprites.dgraveltiles;
                this.height = 6;
                this.cell = [1, 0];
                const use_rough_map = false;
                if (use_rough_map) {
                    let biome = wastes.roughmap.pixel(this.wpos);
                    if (biome.arrayRef[0] > 70) {
                        this.tuple = sprites.dswamptiles;
                        //this.z -= 1;
                    }
                }
                const divisor = 3;
                let height = wastes.heightmap.pixel(this.wpos);
                this.z += Math.floor(height.arrayRef[0] / divisor);
                this.z -= 3; // so we dip the water
                //this.z += Math.random() * 24;
            }
        }
        get_stack() {
            var _a;
            const objs = (_a = this.sector) === null || _a === void 0 ? void 0 : _a.objs;
        }
        /*stack(obj: lod.obj) {
            let i = this.objs.indexOf(obj);
            if (i == -1)
                this.objs.push(obj);
        }
        unstack(obj: lod.obj) {
            let i = this.objs.indexOf(obj);
            if (i > -1)
                return this.objs.splice(i, 1).length;
        }*/
        create() {
            if (this.isLand) {
                this.color = wastes.colormap.pixel(this.wpos).arrayRef;
                //this.color = shadows.mult_pos(
                //	this.color as unknown as vec3, this.wpos) as unknown as vec4;
            }
            // really great z based bias
            this.superiorBias = this.z / 6;
            //console.log('my order bias', this.z, this.myOrderBias);
            if (dont_show_tiles)
                return;
            let shape = new sprite({
                binded: this,
                tuple: this.tuple,
                cell: this.cell,
                color: this.color,
                opacity: this.opacity,
                orderBias: this.superiorBias
            });
            shape.shadowAmount = shadows.get_amount(this.wpos);
            // if we have a deck, add it to heightAdd
            let sector = lod.gworld.at(lod.world.big(this.wpos));
            let at = sector.stacked(this.wpos);
            for (let obj of at) {
                if (obj.type == 'deck' || obj.type == 'porch')
                    this.heightAdd = obj.height;
            }
            shape.rup = this.z;
        }
        //update() {}
        delete() {
        }
        hover() {
            const sprite = this.shape;
            if (!(sprite === null || sprite === void 0 ? void 0 : sprite.mesh))
                return;
            const last = tile.lastHover;
            if (last && last != this && last.sector.isActive()) {
                last.hide();
                last.show();
            }
            //sprite.mesh.material.color.set('#768383');
            tile.lastHover = this;
        }
        paint() {
            const sprite = this.shape;
            if (!sprite || !sprite.mesh)
                return;
            //sprite.mesh.material.color.set('red');
        }
        tick() {
            const sprite = this.shape;
            if (this.refresh) {
                this.refresh = false;
                this.hide();
                this.show();
            }
            sprite.shape_manual_update();
            //if (pawns.you && pts.equals(this.wpos, pts.round(pawns.you.wpos))) {
            //this.paint();
            //}
        }
    }
    tiles.tile = tile;
})(tiles || (tiles = {}));
export default tiles;
