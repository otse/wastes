import { Matrix3 } from "three";
import pts from "./pts";
export var sprites;
(function (sprites) {
    function start() {
    }
    sprites.start = start;
    sprites.test100 = [[100, 100], [100, 100], 0, 'tex/test100'];
    sprites.asteroid = [[512, 512], [512, 512], 0, 'tex/pngwing.com'];
    sprites.dfence = [[72, 30], [24, 30], 0, 'tex/dfence'];
    sprites.shrubs = [[24, 15], [24, 15], 0, 'tex/shrubs'];
    sprites.dtile = [[24, 12], [24, 12], 0, 'tex/dtile'];
    sprites.dwater = [[24, 12], [24, 12], 0, 'tex/8bit/dwater'];
    sprites.dtile4 = [[24, 17], [24, 17], 0, 'tex/dtileup4'];
    sprites.dgrass = [[96, 30], [24, 31], 0, 'tex/dgrass'];
    sprites.dwheat = [[96, 30], [24, 31], 0, 'tex/dwheat'];
    sprites.dpanel = [[48, 10], [8, 10], 0, 'tex/dpanel'];
    sprites.dswamptiles = [[96, 30], [24, 30], 0, 'tex/dswamptiles'];
    sprites.dtilesand = [[24, 17], [24, 17], 0, 'tex/dtilesand'];
    sprites.dgraveltiles = [[96, 30], [24, 30], 0, 'tex/8bit/dgraveltiles'];
    sprites.ddeadtreetrunk = [[24, 50], [24, 50], 0, 'tex/8bit/dtreetrunkdead'];
    sprites.ddecidtreetrunk = [[24, 50], [24, 50], 0, 'tex/8bit/dtreetrunk'];
    sprites.dtreeleaves = [[24, 31], [24, 31], 0, 'tex/8bit/dtreeleaves'];
    sprites.dvines = [[24, 31], [24, 31], 0, 'tex/8bit/dvines'];
    sprites.dvines2 = [[24, 31], [24, 31], 0, 'tex/8bit/dvines2'];
    sprites.dvines3 = [[24, 31], [24, 31], 0, 'tex/8bit/dvines3'];
    //export const dwall: tuple = [[96, 40], [24, 40], 0, 'tex/dwalls']
    sprites.dporch = [[72, 17], [24, 17], 0, 'tex/8bit/dporch'];
    sprites.drails = [[72, 17], [24, 17], 0, 'tex/8bit/drails'];
    sprites.ddeck = [[72, 17], [24, 17], 0, 'tex/8bit/ddeck'];
    sprites.droof = [[72, 17], [24, 17], 0, 'tex/8bit/droof'];
    sprites.dcrate = [[24, 40], [24, 40], 0, 'tex/8bit/dcrate'];
    sprites.dshelves = [[20, 31], [20, 31], 0, 'tex/8bit/dshelves'];
    sprites.ddoor = [[192, 40], [24, 40], 0, 'tex/8bit/ddoor'];
    sprites.dsquarebarrel = [[24, 26], [24, 26], 0, 'tex/8bit/dsquarebarrel'];
    sprites.dwoodywalls = [[264, 40], [24, 40], 0, 'tex/8bit/dwoodywalls'];
    sprites.dplywoodwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dcommonwalls'];
    sprites.dovergrownwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dovergrownwalls'];
    sprites.dderingerwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dsideroomwalls'];
    sprites.dmedievalwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dmedievalwalls'];
    sprites.dscrappywalls = [[264, 40], [24, 40], 0, 'tex/dscrappywalls'];
    //export const dscrappywalls2: tuple = [[216, 40], [24, 40], 0, 'tex/dscrappywalls2']
    sprites.druddywalls = [[288, 40], [24, 40], 0, 'tex/druddywalls'];
    sprites.dacidbarrel = [[24, 35], [24, 35], 0, 'tex/dacidbarrel'];
    sprites.dfalsefronts = [[192, 40], [24, 40], 0, 'tex/8bit/dfalsefronts'];
    sprites.dtree1 = [[121, 147], [121, 147], 0, 'tex/dtree1b'];
    sprites.pchris = [[90, 180], [90, 180], 0, 'tex/pawn/pwaster_quintuple'];
    sprites.pchris_lowres = [[19, 41], [19, 41], 0, 'tex/pawn/pwaster'];
    function get_uv_transform(cell, tuple) {
        let divide = pts.divides(tuple[1], tuple[0]);
        let offset = pts.mults(divide, cell);
        let repeat = divide;
        let center = [0, 1];
        let mat = new Matrix3;
        mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
        return mat;
    }
    sprites.get_uv_transform = get_uv_transform;
    ;
})(sprites || (sprites = {}));
;
export default sprites;
