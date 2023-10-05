import { Mesh, Vector3, PlaneGeometry, MeshLambertMaterial, Matrix3 } from "three";
import aabb2 from "./aabb2";
import lod, { numbers } from "./lod";
import pts from "./pts";
import ren, { THREE } from "./renderer";
import shadows from "./shadows";
import sprites from "./sprites";
import wastes from "./wastes";
;
;
const show_wire_frames = false;
// hovering sprites was made for contextmenu to get a more accurate sprite
export var hovering_sprites;
(function (hovering_sprites) {
    hovering_sprites.sprites = [];
    function hover(sprite) {
        let i = hovering_sprites.sprites.indexOf(sprite);
        if (i == -1)
            hovering_sprites.sprites.push(sprite);
    }
    hovering_sprites.hover = hover;
    function unhover(sprite) {
        let i = hovering_sprites.sprites.indexOf(sprite);
        if (i != -1)
            hovering_sprites.sprites.splice(i, 1);
    }
    hovering_sprites.unhover = unhover;
    function sort_closest_to_mouse() {
        hovering_sprites.sprites.sort((a, b) => {
            const dist_a = pts.distsimple(wastes.gview.mrpos, a.aabbScreen.center());
            const dist_b = pts.distsimple(wastes.gview.mrpos, b.aabbScreen.center());
            if (dist_a < dist_b)
                return -1;
            else
                return 1;
        });
    }
    hovering_sprites.sort_closest_to_mouse = sort_closest_to_mouse;
})(hovering_sprites || (hovering_sprites = {}));
;
var planes = {};
function get_plane_geometry(size) {
    const key = size[0] + ',' + size[1];
    if (planes[key])
        return planes[key];
    else {
        const geometry = new PlaneGeometry(size[0], size[1], 1, 1);
        planes[key] = geometry;
        return planes[key];
    }
}
export class sprite extends lod.shape {
    constructor(vars) {
        super(vars.binded, numbers.sprites);
        this.vars = vars;
        this.writez = true;
        this.dimetric = true;
        this.subsize = [0, 0];
        this.rup = 0;
        this.rup2 = 0;
        this.rleft = 0;
        this.shadowAmount = 1.0;
        this.calc = [0, 0];
        this.roffset = [0, 0];
        if (!this.vars.color)
            this.vars.color = [255, 255, 255];
        if (!this.vars.cell)
            this.vars.cell = [0, 0];
        if (!this.vars.orderBias)
            this.vars.orderBias = 0;
        if (!this.vars.opacity)
            this.vars.opacity = 1;
        this.myUvTransform = new Matrix3;
        this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
    }
    bound() {
        let size = this.vars.binded.size;
        if (pts.together(this.subsize))
            size = this.subsize;
        let calc = this.calc;
        this.aabbScreen = new aabb2([0, 0], size);
        calc = pts.subtract(calc, pts.divide(size, 2));
        //calc = pts.add(calc, [this.rleft, this.rup + this.rup2]);
        this.aabbScreen.translate(calc);
    }
    mousing(mouse) {
        var _a;
        if ((_a = this.aabbScreen) === null || _a === void 0 ? void 0 : _a.test(new aabb2(mouse, mouse)))
            return true;
    }
    dispose() {
        var _a, _b, _c, _d, _e;
        if (!this.mesh)
            return;
        hovering_sprites.unhover(this);
        (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
        (_b = this.material) === null || _b === void 0 ? void 0 : _b.dispose();
        (_c = this.mesh.parent) === null || _c === void 0 ? void 0 : _c.remove(this.mesh);
        if (this.vars.mask)
            (_d = this.meshMask.parent) === null || _d === void 0 ? void 0 : _d.remove(this.meshMask);
        if (show_wire_frames)
            (_e = this.wireframe.parent) === null || _e === void 0 ? void 0 : _e.remove(this.wireframe);
    }
    shape_manual_update() {
        var _a;
        if (!this.mesh)
            return;
        const obj = this.vars.binded;
        let calc = obj.rpos;
        if (this.dimetric)
            // move bottom left corner
            calc = pts.add(obj.rpos, pts.divide(obj.size, 2));
        //else
        //	calc = pts.add(obj.rpos, [0, obj.size[1]]);
        calc = pts.add(calc, [this.rleft, this.rup + this.rup2]);
        if (this.material.shader) {
            this.material.shader.uniforms.fogOfWar.value = (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.fog_of_war;
        }
        let color = this.vars.color;
        if (this.vars.binded.sector.color) {
            let hex = this.vars.binded.sector.color;
            this.material.color.setStyle(hex);
            this.material.color.toArray(color);
            //color = [color[0] * 255, color[1] * 255, color[2] * 255];
        }
        else {
            color = shadows.mult(color, this.shadowAmount);
            this.material.color.fromArray([color[0] / 255, color[1] / 255, color[2] / 255]);
        }
        this.calc = calc;
        this.bound();
        if (this.mesh) {
            this.retransform();
            this.mesh.position.fromArray([...calc, 0]);
            // Not rounding gives us much better depth
            let pos = obj.wpos; // pts.round(obj.wpos);
            // Experimental z elevation based bias!
            let zBasedBias = 0;
            //zBasedBias = this.vars.binded.z / 3;
            this.mesh.renderOrder = -pos[1] + pos[0] + this.vars.orderBias + zBasedBias;
            this.mesh.rotation.z = this.vars.binded.ro;
            this.mesh.updateMatrix();
            this.mesh.updateMatrixWorld(false);
            if (this.vars.mask) {
                this.meshMask.position.fromArray([...calc, 0]);
                this.meshMask.renderOrder = -pos[1] + pos[0] + this.vars.orderBias;
                this.meshMask.updateMatrix();
            }
            if (show_wire_frames) {
                this.wireframe.position.fromArray([...calc, 0]);
                this.wireframe.renderOrder = this.mesh.renderOrder + 20;
                this.wireframe.updateMatrix();
                this.wireframe.updateMatrixWorld(false);
            }
        }
    }
    retransform() {
        this.myUvTransform.copy(sprites.get_uv_transform(this.vars.cell, this.vars.tuple));
    }
    create() {
        //console.log('create');
        const obj = this.vars.binded;
        this.retransform();
        this.geometry = get_plane_geometry(this.vars.binded.size);
        /*
        let color;
        if (this.vars.binded!.sector!.color) {
            color = new Color(this.vars.binded.sector!.color);
        }
        else {
            const c = this.vars.color || [255, 255, 255, 255];
            color = new Color(`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`);
        }
        */
        let defines = {};
        if (this.vars.masked) {
            defines.MASKED = 1;
        }
        const c = this.vars.maskColor || [0.15, 0.3, 0.15];
        const maskColor = new Vector3(c[0], c[1], c[2]);
        this.material = SpriteMaterial({
            map: ren.load_texture(`${this.vars.tuple[3]}.png`, 0),
            transparent: true,
            color: 'white',
            opacity: this.vars.opacity,
            depthWrite: false,
            depthTest: false,
        }, {
            myUvTransform: this.myUvTransform,
            masked: this.vars.masked,
            maskColor: maskColor,
            fogOfWar: true
        }, defines);
        //this.material = new MeshLambertMaterial();
        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;
        this.mesh.matrixAutoUpdate = false;
        this.mesh.matrixWorldAutoUpdate = false;
        if (this.vars.mask) {
            this.meshMask = this.mesh.clone();
            if (this.vars.negativeMask) {
                this.meshMask.material = this.material.clone();
                this.meshMask.material.blending = THREE.CustomBlending;
                this.meshMask.material.blendEquation = THREE.ReverseSubtractEquation;
            }
        }
        // this.vars.binded.sector?.group.add(this.mesh);
        ren.groups.axisSwap.add(this.mesh);
        if (this.vars.mask)
            ren.sceneMask.add(this.meshMask);
        if (show_wire_frames) {
            this.wireframe = new Mesh(this.geometry, new MeshLambertMaterial({ wireframe: true }));
            this.wireframe.frustumCulled = false;
            this.wireframe.matrixAutoUpdate = false;
            ren.groups.axisSwap.add(this.wireframe);
            console.log('add wireframe');
        }
        this.shape_manual_update();
    }
}
sprite.masks = [];
;
export function SpriteMaterial(parameters, uniforms, defines = {}) {
    let material = new MeshLambertMaterial(parameters);
    material.customProgramCacheKey = function () {
        return 'spritemat';
    };
    material.name = "spritemat";
    material.defines = defines;
    material.onBeforeCompile = function (shader) {
        material.shader = shader; // hack
        shader.uniforms.myUvTransform = { value: uniforms.myUvTransform };
        shader.uniforms.fogOfWar = { value: uniforms.fogOfWar };
        if (uniforms.masked) {
            shader.uniforms.tMask = { value: ren.targetMask.texture };
            shader.uniforms.maskColor = { value: uniforms.maskColor };
            console.log('add tmask');
        }
        shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>
			varying vec2 myPosition;
			uniform mat3 myUvTransform;
			`);
        shader.vertexShader = shader.vertexShader.replace(`#include <worldpos_vertex>`, `#include <worldpos_vertex>
			//vec4 worldPosition = vec4( transformed, 1.0 );
			//worldPosition = modelMatrix * worldPosition;

			myPosition = (projectionMatrix * mvPosition).xy / 2.0 + vec2(0.5, 0.5);
			`);
        shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`, `
			#ifdef USE_MAP
				vMapUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
			#endif
			`);
        shader.fragmentShader = shader.fragmentShader.replace(`#include <map_pars_fragment>`, `
			#include <map_pars_fragment>
			varying vec2 myPosition;
			uniform sampler2D tMask;
			uniform vec3 maskColor;
			uniform bool fogOfWar;
			`);
        shader.fragmentShader = shader.fragmentShader.replace(`#include <map_fragment>`, `
			#include <map_fragment>
			//vec4 sampledDiffuseColor = texture2D( map, vMapUv );
			//diffuseColor *= sampledDiffuseColor;
			//diffuseColor.a = 1.0;
			//diffuseColor.rgb = vec3(1, 2, 0);

			#ifdef MASKED
				vec4 texelColor = texture2D( tMask, myPosition );
				texelColor.rgb = mix(texelColor.rgb, maskColor, 0.7);
				if (texelColor.a > 0.5)
				diffuseColor.rgb = texelColor.rgb;
			#endif
			
			if (fogOfWar) {
				float saturation = 0.0;
				vec3 original_color = diffuseColor.rgb;
				vec3 lumaWeights = vec3(.25,.50,.25);
				vec3 grey = vec3(dot(lumaWeights, original_color));
				diffuseColor.rgb = grey + saturation * (original_color - grey);
			}
			`);
    };
    return material;
}
export default sprite;
