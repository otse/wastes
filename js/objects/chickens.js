import { default as THREE, Scene, Group, Mesh, BoxGeometry, PlaneGeometry, DirectionalLight, AmbientLight, MeshLambertMaterial } from "three";
import lod, { numbers } from "../lod";
import objects from "./objects";
import { superobject } from "./superobject";
import pts from "../pts";
import ren from "../renderer";
import shadows from "../shadows";
import sprite from "../sprite";
import sprites from "../sprites";
import wastes from "../wastes";
import win from "../win";
export var chickens;
(function (chickens) {
    function start() {
        //let chicken = new chickens.chicken;
        //chicken.wpos = [46, 49];
        //lod.add(chicken);
        /*let chicken2 = new chickens.chicken;
        chicken2.wpos = [42, 53];
        lod.add(chicken2);*/
    }
    chickens.start = start;
    class chicken extends superobject {
        constructor() {
            super(numbers.chickens);
            this.netwpos = [0, 0];
            this.netangle = 0;
            this.dead = false;
            this.created = false;
            this.pecking = false;
            this.sitting = false;
            //override setup_context() {
            //	win.contextmenu.reset();
            //}
            this.groups = {};
            this.meshes = {};
            this.made = false;
            this.swoop = 0;
            this.angle = 0;
            this.walkSmoother = 1;
            this.randomWalker = 0;
            this.type = 'chicken';
            this.height = 24;
        }
        create() {
            this.rebound();
            this.size = pts.divide([25, 30], 1);
            //this.subsize = [25, 40];
            let shape = new sprite({
                binded: this,
                tuple: sprites.test100,
                //opacity: 0.5,
                orderBias: 2.5,
                mask: true
            });
            //shape.dimetric = false;
            shape.subsize = [15, 20];
            shape.rup2 = 1;
            //shape.rleft = -this.size[0] / 2;
            shape.show();
            if (!this.created) {
                this.created = true;
                //console.log('creating chicken');
                // Set scale to increase pixels exponentially
                const scale = 1;
                // make wee guy target
                //this.group = new THREE.Group
                let size = pts.mult(this.size, scale);
                this.target = ren.make_render_target(size[0], size[1]);
                this.camera = ren.make_orthographic_camera(size[0], size[1]);
                this.scene = new Scene();
                //this.scene.background = new Color('#333');
                this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
                this.scene.scale.set(scale, scale, scale);
                this.scene.add(new AmbientLight('white'));
                let sun = new DirectionalLight(0xffffff, 0.5);
                // left up right
                sun.position.set(-wastes.size, wastes.size * 1.5, wastes.size / 2);
                //sun.add(new AxesHelper(100));
                this.scene.add(sun);
                this.scene.add(sun.target);
            }
            const spritee = this.shape;
            spritee.material.map = this.target.texture;
        }
        try_move_to(pos) {
            let venture = pts.add(this.wpos, pos);
            if (!objects.is_solid(venture))
                this.wpos = venture;
        }
        obj_manual_update() {
            this.rebound();
            //this.stack();
            super.obj_manual_update();
        }
        make() {
            if (this.made)
                return;
            this.made = true;
            const headWidth = 2.5;
            const headHeight = 5;
            const headLength = 2.5;
            const combWidth = 1;
            const combHeight = 2;
            const combLength = 2;
            const beakWidth = 1.5;
            const beakHeight = 1.5;
            const beakLength = 2;
            const legsWidth = 1;
            const legsHeight = 3;
            const legsLength = 1;
            const armsWidth = 1;
            const armsLength = 5;
            const armsHeight = 3;
            const armsAngle = .0;
            const bodyWidth = 4;
            const bodyHeight = 4;
            const bodyLength = 7;
            const feetWidth = 1.5;
            const feetHeight = 1;
            const feetLength = 1.5;
            let boxHead = new BoxGeometry(headWidth, headHeight, headLength);
            let materialHead = new MeshLambertMaterial({
                color: '#787a7a'
            });
            let boxComb = new BoxGeometry(combWidth, combHeight, combLength);
            let materialComb = new MeshLambertMaterial({
                color: '#a52c2c'
            });
            let boxBeak = new BoxGeometry(beakWidth, beakHeight, beakLength);
            let materialBeak = new MeshLambertMaterial({
                color: '#7f805f'
            });
            let boxBody = new BoxGeometry(bodyWidth, bodyHeight, bodyLength);
            let materialBody = new MeshLambertMaterial({
                color: '#787a7a'
            });
            let boxArms = new BoxGeometry(armsWidth, armsHeight, armsLength);
            let materialArms = new MeshLambertMaterial({
                color: '#787a7a'
            });
            let boxLegs = new BoxGeometry(legsWidth, legsHeight, legsLength);
            let boxFeet = new BoxGeometry(feetWidth, feetHeight, feetLength);
            let materialLegs = new MeshLambertMaterial({
                color: '#7f805f'
            });
            let planeWater = new PlaneGeometry(wastes.size * 2, wastes.size * 2);
            let materialWater = new MeshLambertMaterial({
                color: new THREE.Color('rgba(32, 64, 64, 255)'),
                opacity: 0.4,
                transparent: true,
                blending: THREE.CustomBlending,
                blendEquation: THREE.AddEquation,
                blendSrc: THREE.DstAlphaFactor,
                blendDst: THREE.OneMinusSrcAlphaFactor
            });
            this.meshes.water = new Mesh(planeWater, materialWater);
            this.meshes.water.rotation.x = -Math.PI / 2;
            this.meshes.water.position.y = -bodyHeight * 1.5;
            this.meshes.water.visible = false;
            this.meshes.head = new Mesh(boxHead, materialHead);
            this.meshes.comb = new Mesh(boxComb, materialComb);
            this.meshes.beak = new Mesh(boxBeak, materialBeak);
            this.meshes.body = new Mesh(boxBody, materialBody);
            this.meshes.arml = new Mesh(boxArms, materialArms);
            this.meshes.armr = new Mesh(boxArms, materialArms);
            this.meshes.legl = new Mesh(boxLegs, materialLegs);
            this.meshes.legr = new Mesh(boxLegs, materialLegs);
            this.meshes.footl = new Mesh(boxFeet, materialLegs);
            this.meshes.footr = new Mesh(boxFeet, materialLegs);
            this.groups.neck = new Group;
            this.groups.head = new Group;
            this.groups.beak = new Group;
            this.groups.comb = new Group;
            this.groups.body = new Group;
            this.groups.arml = new Group;
            this.groups.armr = new Group;
            this.groups.legl = new Group;
            this.groups.legr = new Group;
            this.groups.footl = new Group;
            this.groups.footr = new Group;
            this.groups.ground = new Group;
            this.groups.basis = new Group;
            this.groups.neck.add(this.meshes.head);
            this.groups.head.add(this.meshes.head);
            this.groups.beak.add(this.meshes.beak);
            this.groups.comb.add(this.meshes.comb);
            this.groups.body.add(this.meshes.body);
            this.groups.arml.add(this.meshes.arml);
            this.groups.armr.add(this.meshes.armr);
            this.groups.legl.add(this.meshes.legl);
            this.groups.legr.add(this.meshes.legr);
            this.groups.footl.add(this.meshes.footl);
            this.groups.footr.add(this.meshes.footr);
            this.groups.head.add(this.groups.beak);
            this.groups.head.add(this.groups.comb);
            this.groups.neck.add(this.groups.head);
            this.groups.legl.add(this.groups.footl);
            this.groups.legr.add(this.groups.footr);
            this.groups.body.add(this.groups.neck);
            this.groups.body.add(this.groups.arml);
            this.groups.body.add(this.groups.armr);
            this.groups.ground.add(this.groups.legl);
            this.groups.ground.add(this.groups.legr);
            this.groups.ground.add(this.groups.body);
            this.groups.basis.add(this.groups.ground);
            this.groups.basis.add(this.meshes.water);
            this.groups.neck.position.set(0, bodyHeight / 2, bodyLength / 3);
            this.groups.head.position.set(0, headHeight / 2, 0);
            this.groups.comb.position.set(0, combHeight, combLength / 2);
            this.groups.beak.position.set(0, 0, beakLength);
            //this.groups.beak.rotation.set(-Math.PI / 4, 0, 0);
            this.groups.body.position.set(0, bodyHeight, 0);
            this.meshes.body.rotation.set(-0.3, 0, 0);
            this.meshes.arml.rotation.set(-0.3, 0, 0);
            this.meshes.armr.rotation.set(-0.3, 0, 0);
            this.groups.armr.position.set(-bodyWidth / 2 - armsWidth / 2, bodyHeight / 2 - armsWidth / 2, 0);
            this.groups.armr.rotation.set(0, 0, -armsAngle);
            this.meshes.armr.position.set(0, -armsHeight / 2 + armsWidth / 2, 0);
            this.groups.arml.position.set(bodyWidth / 2 + armsWidth / 2, bodyHeight / 2 - armsWidth / 2, 0);
            this.groups.arml.rotation.set(0, 0, armsAngle);
            this.meshes.arml.position.set(0, -armsHeight / 2 + armsWidth / 2, 0);
            this.groups.legl.position.set(-legsWidth / 1, bodyHeight / 2, 0);
            this.meshes.legl.position.set(0, -legsHeight / 2, 0);
            this.groups.legr.position.set(legsWidth / 1, bodyHeight / 2, 0);
            this.meshes.legr.position.set(0, -legsHeight / 2, 0);
            this.groups.footl.position.set(0, -legsHeight, feetLength / 2);
            this.groups.footr.position.set(0, -legsHeight, feetLength / 2);
            this.groups.ground.position.set(0, -bodyHeight * 4, 0);
            //mesh.rotation.set(Math.PI / 2, 0, 0);
            this.scene.add(this.groups.basis);
        }
        render() {
            ren.renderer.setRenderTarget(this.target);
            ren.renderer.clear();
            ren.renderer.render(this.scene, this.camera);
        }
        animateBodyParts() {
            var _a;
            this.walkSmoother = wastes.clamp(this.walkSmoother, 0, 1);
            const legsSwoop = 0.6;
            const armsSwoop = 0.5;
            const headBob = 1.0;
            const riser = 0.5;
            if (!this.dead) {
                this.swoop += ren.delta * 2.5;
                const swoop1 = Math.cos(Math.PI * this.swoop);
                const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);
                this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
                this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
                //this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
                //this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
                this.groups.head.position.z = swoop1 * swoop2 * -headBob * this.walkSmoother;
                this.groups.ground.position.y = -10; //+ swoop1 * swoop2 * riser * this.walkSmoother;
                this.groups.ground.rotation.y = -this.angle + Math.PI / 2;
            }
            else {
                this.groups.legl.rotation.x = -0.5;
                this.groups.legr.rotation.x = 0.5;
                this.groups.head.position.z = 0;
                this.groups.ground.position.y = -10;
                this.groups.ground.rotation.y = Math.PI / 4;
                this.groups.ground.rotation.z = -Math.PI / 2;
                console.log('were dead');
            }
            if (this.sitting /*|| app.key('q')*/) {
                this.groups.legl.visible = false;
                this.groups.legr.visible = false;
                this.groups.ground.position.y -= 4;
                this.meshes.body.rotation.set(0.0, 0, 0);
                this.meshes.arml.rotation.set(0.0, 0, 0);
                this.meshes.armr.rotation.set(0.0, 0, 0);
            }
            else {
                this.groups.legl.visible = true;
                this.groups.legr.visible = true;
                this.meshes.body.rotation.set(-0.3, 0, 0);
                this.meshes.arml.rotation.set(-0.3, 0, 0);
                this.meshes.armr.rotation.set(-0.3, 0, 0);
            }
            if (this.pecking) {
                this.groups.neck.rotation.x = 1.0;
                this.groups.body.rotation.x = 0.6;
            }
            else {
                this.groups.neck.rotation.x = 0;
                this.groups.body.rotation.x = 0;
            }
            const sprite = this.shape;
            if (((_a = this.tile) === null || _a === void 0 ? void 0 : _a.type) == 'shallow water') {
                sprite.vars.orderBias = 0.25;
                this.meshes.water.visible = true;
            }
            else {
                sprite.vars.orderBias = 1.0;
                this.meshes.water.visible = false;
            }
            this.render();
        }
        nettick() {
            //this.wpos = [43, 51];
            //return;
            //this.wpos = wastes.gview.mwpos;
            //return;
            //this.netangle = Math.PI / 4;
            // Net tick can happen offscreen
            //this.wpos = tiles.hovering!.wpos;
            //this.wpos = wastes.gview.mwpos;
            if (this.pecking) {
                // console.log('we are pecking');
            }
            if (!pts.together(this.netwpos))
                this.netwpos = this.wpos;
            // tween netwpos into wpos
            let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren.delta * 2);
            this.wpos = pts.add(this.wpos, tween);
            lod.sector.swap(this);
            //console.log('chicken nettick', this.wpos);
            if (this.netangle - this.angle > Math.PI)
                this.angle += Math.PI * 2;
            if (this.angle - this.netangle > Math.PI)
                this.angle -= Math.PI * 2;
            let tweenAngle = (this.netangle - this.angle) * 0.1;
            this.angle += tweenAngle;
            const movement = pts.together(pts.abs(tween));
            if (movement > 0.005) {
                //console.log('movement > 0.25');
                this.walkSmoother += ren.delta * 10;
            }
            else {
                this.walkSmoother -= ren.delta * 5;
            }
        }
        superobject_setup_context_menu() {
            win.contextmenu.reset();
            if (!this.dead) {
                if (this.examine) {
                    win.contextmenu.options.options.push(["Examine", () => {
                            return true;
                        }, () => {
                            win.descriptor.focus = this;
                            win.descriptor.call_once(this.examine);
                            //win.contextmenu.focus = undefined;
                        }]);
                }
            }
        }
        tick() {
            // We are assumed to be onscreen
            // If we are visible
            if (!this.shape)
                return;
            //this.wpos = wastes.gview.mwpos;
            this.make();
            this.animateBodyParts();
            this.rebound();
            //this.tile?.paint();
            //this.sector?.swap(this);
            const sprite = this.shape;
            sprite.shadowAmount = shadows.get_amount(pts.round(this.wpos));
            this.hovering_pass();
            this.stack(['pawn', 'you', 'chicken', 'tree', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
            //sprite.roffset = [.5, .5];
            //this.tile!.paint();
            super.obj_manual_update();
        }
    }
    chickens.chicken = chicken;
})(chickens || (chickens = {}));
export default chickens;