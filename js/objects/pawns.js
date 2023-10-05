import { default as THREE, Scene, Group, Mesh, BoxGeometry, PlaneGeometry, DirectionalLight, AmbientLight, MeshLambertMaterial, Matrix3 } from "three";
import aabb2 from "../aabb2";
import app from "../app";
import { client } from "../client";
import dialogues from "../dialogue";
import glob from "../glob";
import lod, { numbers } from "../lod";
import objects from "./objects";
import { superobject } from "./superobject";
import pts from "../pts";
import ren from "../renderer";
import shadows from "../shadows";
import sprite, { SpriteMaterial } from "../sprite";
import sprites from "../sprites";
import tiles from "../tiles";
import wastes from "../wastes";
import win from "../win";
import guns from "./guns";
export var pawns;
(function (pawns) {
    const wasterSprite = false;
    const armsAngle = .025;
    class pawn extends superobject {
        constructor() {
            super(numbers.pawns);
            this.dead = false;
            this.isTrader = false;
            this.isPlayer = false;
            this.dialogue = dialogues[0];
            this.netwpos = [0, 0];
            this.netangle = 0;
            //inventory: objects.container
            this.items = [];
            this.outfit = ['#444139', '#444139', '#484c4c', '#31362c'];
            this.aiming = false;
            this.shoot = false;
            this.created = false;
            this.groups = {};
            this.meshes = {};
            this.made = false;
            this.swoop = 0;
            this.angle = 0;
            this.walkSmoother = 0;
            this.randomWalker = 0;
            this.type = 'pawn';
            this.title = 'pawn';
            this.height = 24;
            this.solid = false;
            this.expand = .25;
            //this.inventory = new objects.container;
            //this.inventory.add('money');
        }
        create() {
            this.rebound();
            if (wasterSprite)
                this.size = pts.divide([90, 180], 5);
            else {
                this.size = pts.divide([50, 40], 1);
            }
            let shape = new sprite({
                binded: this,
                tuple: wasterSprite ? sprites.pchris : sprites.test100,
                cell: this.cell,
                //opacity: .5,
                orderBias: 1.2,
                mask: true
            });
            shape.subsize = [20, 30];
            shape.rleft = -this.size[0] / 4;
            shape.show();
            if (!this.created) {
                this.created = true;
                // Set scale to increase pixels exponentially
                const scale = 1;
                // make wee guy target
                //this.group = new THREE.Group
                let size = pts.mult(this.size, scale);
                this.target = ren.make_render_target(size[0], size[1]);
                this.camera = ren.make_orthographic_camera(size[0], size[1]);
                this.scene = new Scene();
                this.scene.matrixAutoUpdate = false;
                //this.scene.background = new Color('gray');
                this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
                this.scene.position.set(0, 0, 0);
                this.scene.scale.set(scale, scale, scale);
                this.scene.updateMatrix();
                let amb = new AmbientLight('white');
                this.scene.add(amb);
                let sun = new DirectionalLight(0xffffff, 0.5);
                // left up right
                sun.position.set(-wastes.size, wastes.size * 1.5, wastes.size / 2);
                //sun.add(new AxesHelper(100));
                this.scene.add(sun);
                this.scene.add(sun.target);
            }
            if (!wasterSprite) {
                const sprite = this.shape;
                sprite.material.map = this.target.texture;
                if (sprite.vars.mask)
                    sprite.meshMask.material.map = this.target.texture;
            }
        }
        try_move_as_point(to) {
            const friction = 0.66;
            let both = pts.add(this.wpos, to);
            if (objects.is_solid(pts.add(this.wpos, [to[0], 0])))
                to[0] = 0;
            if (objects.is_solid(pts.add(this.wpos, [0, to[1]])))
                to[1] = 0;
            if (objects.is_solid(both))
                to = pts.mult(to, friction);
            this.wpos = pts.add(this.wpos, to);
        }
        try_move_as_square(to) {
            if (!this.bound)
                return;
            let both = aabb2.dupe(this.bound);
            both.translate(to);
            let dupex = aabb2.dupe(this.bound);
            dupex.translate([to[0], 0]);
            let dupey = aabb2.dupe(this.bound);
            dupey.translate([0, to[1]]);
            let collision = false;
            for (let obj of lod.ggrid.visibleObjs) {
                if (this == obj)
                    continue;
                if (obj.solid) {
                    const test = both.test(obj.bound);
                    const testx = dupex.test(obj.bound);
                    const testy = dupey.test(obj.bound);
                    if (test > 0 && testx == 0 && testy == 0) {
                        // we are hugging a corner,
                        // prevent splitting into it
                        //to = [0, 0];
                    }
                    if (testx > 0) {
                        collision = true;
                        to[0] = 0;
                    }
                    if (testy > 0) {
                        collision = true;
                        to[1] = 0;
                    }
                }
            }
            const friction = 0.66;
            if (collision)
                to = pts.mult(to, friction);
            this.wpos = pts.add(this.wpos, to);
            this.rebound();
        }
        obj_manual_update() {
            this.rebound();
            //this.stack();
            super.obj_manual_update();
        }
        superobject_setup_context_menu() {
            win.contextmenu.reset();
            if (!this.isPlayer && this.type != 'you' && !this.dead) {
                win.contextmenu.options.options.push(["Talk to", () => {
                        return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                    }, () => {
                        win.dialogue.talkingTo = this;
                        win.dialogue.call_once();
                        client.interactingWith = this.id;
                    }]);
                if (this.subtype == 'trader') {
                    win.contextmenu.options.options.push(["Trade", () => {
                            return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                        }, () => {
                            win.trader.tradeWith = this;
                            win.trader.call_once();
                            client.interactingWith = this.id;
                        }]);
                }
                if (this.examine) {
                    win.contextmenu.options.options.push(["Examine", () => {
                            return true;
                        }, () => {
                            win.descriptor.focus = this;
                            win.descriptor.call_once(this.examine);
                            //win.contextmenu.focus = undefined;
                        }]);
                }
                else {
                    //win.contextmenu.options.options.push("See inventory");
                }
            }
        }
        make() {
            if (this.made)
                return;
            this.made = true;
            const headSize = 6;
            const helmetSize = headSize + .5;
            const gasMaskSize = 2.5;
            const legsSize = 4;
            const legsHeight = 12;
            const armsSize = 3;
            const armsHeight = 12;
            const bodyThick = 5;
            const bodyWidth = 8;
            const bodyHeight = 12;
            const gunBarrelHeight = 6;
            const gunBarrelSize = 3;
            const transforme = (thick, width, height, path) => {
                const sizes = [width + width + thick + width, height];
                let materials = [];
                let transforms = [];
                transforms.push(new Matrix3().setUvTransform(// left
                width * 2 / sizes[0], 0, thick / sizes[0], 1, 0, 0, 1));
                transforms.push(new Matrix3().setUvTransform(// right
                width * 2 / sizes[0] + thick / sizes[0], 0, -thick / sizes[0], 1, 0, 0, 1));
                transforms.push(new Matrix3().setUvTransform(// top
                width * 2 / sizes[0] + thick / sizes[0], 0, thick / sizes[0], thick / sizes[1], 0, 0, 1));
                transforms.push(new Matrix3()); // bottom ?
                transforms.push(new Matrix3().setUvTransform(// front
                0, 0, width / sizes[0], 1, 0, 0, 1));
                transforms.push(new Matrix3().setUvTransform(// back
                width / sizes[0], 0, width / sizes[0], 1, 0, 0, 1));
                for (let i in transforms) {
                    materials.push(SpriteMaterial({
                        transparent: true,
                        map: ren.load_texture(path, 0),
                    }, {
                        myUvTransform: transforms[i]
                    }));
                }
                return materials;
            };
            let materialsHelmet = transforme(8, 8, 5, `tex/pawn/helmet.png`);
            let materialsBody = transforme(bodyThick, bodyWidth, bodyHeight, `tex/pawn/body.png`);
            let materialsArms = transforme(armsSize, armsSize, armsHeight, `tex/pawn/arms.png`);
            let boxHelmet = new BoxGeometry(helmetSize, 5, helmetSize, 1, 1, 1);
            let materialHelmet = new MeshLambertMaterial({
                color: '#383936'
            });
            let boxHead = new BoxGeometry(headSize, headSize, headSize, 1, 1, 1);
            let materialHead = new MeshLambertMaterial({
                color: this.outfit[0]
            });
            let boxGasMask = new BoxGeometry(gasMaskSize, gasMaskSize, gasMaskSize, 1, 1, 1);
            let materialGasMask = new MeshLambertMaterial({
                color: this.outfit[0]
            });
            let boxBody = new BoxGeometry(bodyWidth, bodyHeight, bodyThick, 1, 1, 1);
            let materialBody = new MeshLambertMaterial({
                color: this.outfit[1]
            });
            let boxVest = new BoxGeometry(bodyWidth + 2, bodyHeight + 1, bodyThick + 1, 1, 1, 1);
            let materialVest = new MeshLambertMaterial({
                color: '#33302b'
            });
            let boxArms = new BoxGeometry(armsSize, armsHeight, armsSize, 1, 1, 1);
            let materialArms = new MeshLambertMaterial({
                color: this.outfit[2]
            });
            let boxLegs = new BoxGeometry(legsSize, legsHeight, legsSize, 1, 1, 1);
            let materialLegs = new MeshLambertMaterial({
                color: this.outfit[3]
            });
            let planeShade = new PlaneGeometry(20, 20);
            let materialShade = new MeshLambertMaterial({
                map: ren.load_texture('tex/pawn/shade.png', 0),
                transparent: true,
                opacity: 0.15
            });
            // https://www.andersriggelsen.dk/glblendfunc.php
            let planeWater = new PlaneGeometry(wastes.size * 2, wastes.size * 2);
            let materialWater = new MeshLambertMaterial({
                color: new THREE.Color('rgba(32, 64, 64, 255)'),
                opacity: 0.4,
                transparent: true,
                blending: THREE.CustomBlending,
                blendEquation: THREE.AddEquation,
                blendSrc: THREE.DstAlphaFactor,
                blendDst: THREE.OneMinusDstAlphaFactor
            });
            /*let boxGunGrip = new BoxGeometry(2, 5, 2, 1, 1, 1);
            let materialGunGrip = new MeshLambertMaterial({
                color: '#768383'
            });
    
            let boxGunBarrel = new BoxGeometry(2, gunBarrelHeight, 2, 1, 1, 1);
            let materialGunBarrel = new MeshLambertMaterial({
                color: '#768383'
            });*/
            this.meshes.water = new Mesh(planeWater, materialWater);
            this.meshes.water.matrixAutoUpdate = false;
            this.meshes.water.rotation.x = -Math.PI / 2;
            this.meshes.water.position.y = -bodyHeight * 1.2;
            this.meshes.water.updateMatrix();
            this.meshes.water.visible = false;
            this.meshes.helmet = new Mesh(boxHelmet, materialsHelmet);
            this.meshes.head = new Mesh(boxHead, materialHead);
            this.meshes.gasMask = new Mesh(boxGasMask, materialGasMask);
            this.meshes.body = new Mesh(boxBody, materialsBody);
            this.meshes.vest = new Mesh(boxVest, materialVest);
            //this.meshes.vest.position.y = 1;
            this.meshes.arml = new Mesh(boxArms, materialArms);
            this.meshes.armr = new Mesh(boxArms, materialArms);
            this.meshes.legl = new Mesh(boxLegs, materialLegs);
            this.meshes.legr = new Mesh(boxLegs, materialLegs);
            this.meshes.shade = new Mesh(planeShade, materialShade);
            this.meshes.shade.position.set(0, -bodyHeight / 2 - legsHeight, 0);
            this.meshes.shade.rotation.set(-Math.PI / 2, 0, 0);
            /*this.meshes.gungrip = new Mesh(boxGunGrip, materialGunGrip);
            this.meshes.gunbarrel = new Mesh(boxGunBarrel, materialGunBarrel);*/
            this.groups.head = new Group;
            this.groups.gasMask = new Group;
            this.groups.body = new Group;
            this.groups.arml = new Group;
            this.groups.armr = new Group;
            this.groups.handr = new Group;
            this.groups.legl = new Group;
            this.groups.legr = new Group;
            this.groups.ground = new Group;
            this.groups.basis = new Group;
            /*this.groups.gungrip = new Group;
            this.groups.gunbarrel = new Group;*/
            this.groups.head.add(this.meshes.head);
            this.groups.gasMask.add(this.meshes.gasMask);
            this.groups.body.add(this.meshes.body);
            this.groups.body.add(this.meshes.vest);
            this.groups.arml.add(this.meshes.arml);
            this.groups.armr.add(this.meshes.armr);
            this.groups.legl.add(this.meshes.legl);
            this.groups.legr.add(this.meshes.legr);
            this.groups.armr.add(this.groups.handr);
            this.groups.head.add(this.groups.gasMask);
            /*this.groups.gungrip.add(this.meshes.gungrip);
            this.groups.gunbarrel.add(this.meshes.gunbarrel);*/
            /*this.groups.gungrip.add(this.groups.gunbarrel);
            this.groups.armr.add(this.groups.gungrip);*/
            this.groups.head.add(this.meshes.helmet);
            this.groups.body.add(this.groups.head);
            this.groups.body.add(this.groups.arml);
            this.groups.body.add(this.groups.armr);
            this.groups.body.add(this.groups.legl);
            this.groups.body.add(this.groups.legr);
            this.groups.ground.add(this.groups.body);
            this.groups.basis.add(this.groups.ground);
            this.groups.basis.add(this.meshes.water);
            this.groups.basis.add(this.meshes.shade);
            //this.groups.handr.add(new AxesHelper(10));
            this.meshes.helmet.position.set(0, 2, 0);
            this.groups.handr.position.set(0, -armsHeight, 0);
            this.groups.head.position.set(0, bodyHeight / 2 + headSize / 2, 0);
            this.groups.gasMask.position.set(0, -headSize / 2, headSize / 1.5);
            this.groups.gasMask.rotation.set(-Math.PI / 4, 0, 0);
            this.groups.body.position.set(0, 0, 0);
            //this.meshes.armr.position.set(0, armsSize / 2, 0);
            this.groups.armr.position.set(-bodyWidth / 2 - armsSize / 2, bodyHeight / 2 - armsSize / 2, 0);
            this.groups.armr.rotation.set(0, 0, -armsAngle);
            this.meshes.armr.position.set(0, -armsHeight / 2 + armsSize / 2, 0);
            this.groups.arml.position.set(bodyWidth / 2 + armsSize / 2, bodyHeight / 2 - armsSize / 2, 0);
            this.groups.arml.rotation.set(0, 0, armsAngle);
            this.meshes.arml.position.set(0, -armsHeight / 2 + armsSize / 2, 0);
            /*this.groups.gungrip.position.set(0, -armsHeight, 0);
            this.meshes.gungrip.rotation.set(Math.PI / 2, 0, 0);
            this.meshes.gunbarrel.position.set(0, -gunBarrelHeight / 2, 0);*/
            this.groups.legl.position.set(-legsSize / 2, -bodyHeight / 2, 0);
            this.meshes.legl.position.set(0, -legsHeight / 2, 0);
            this.groups.legr.position.set(legsSize / 2, -bodyHeight / 2, 0);
            this.meshes.legr.position.set(0, -legsHeight / 2, 0);
            this.groups.ground.position.set(0, bodyHeight + legsHeight, 0);
            //mesh.rotation.set(Math.PI / 2, 0, 0);
            this.scene.add(this.groups.basis);
            this.re_wield();
        }
        re_wield() {
            this.groups.handr.remove(...this.groups.handr.children);
            if (this.wielding != 'none') {
                this.gun = guns.get(this.wielding);
                const group = this.gun.model.clone();
                group.rotation.set(0, 0, Math.PI / 2);
                this.groups.handr.add(group);
            }
            else {
            }
        }
        render() {
            ren.renderer.setRenderTarget(this.target);
            ren.renderer.clear();
            ren.renderer.render(this.scene, this.camera);
        }
        move() {
            var _a;
            let speed = 0.038 * ren.delta * 60;
            let x = 0;
            let y = 0;
            let wasd = true;
            if (this.type == 'you') {
                if (app.key('w')) {
                    x += -1;
                    y += -1;
                }
                if (app.key('s')) {
                    x += 1;
                    y += 1;
                }
                if (app.key('a')) {
                    x += -1;
                    y += 1;
                }
                if (app.key('d')) {
                    x += 1;
                    y += -1;
                }
                if (app.key('x')) {
                    speed *= 5;
                }
            }
            const wposBasedAiming = true;
            if (this.type == 'you') {
                if (app.button(0) == 1 && win.is_hovering()) {
                    glob.freeze = true;
                }
                else if (app.button(0) <= 0) {
                    glob.freeze = false;
                }
            }
            // Snap aim to tiles
            if (this.type == 'you' && app.key('shift') && !win.is_hovering()) {
                wasd = false;
                let pos = ((_a = tiles.hovering) === null || _a === void 0 ? void 0 : _a.wpos) || [0, 0];
                pos = pts.subtract(pos, pawns.you.wpos);
                //const dist = pts.distsimple(pos, wastes.gview.mwpos);
                // Why do we check the distance between our global view?
                //if (dist > 0.5) {
                x = pos[0];
                y = -pos[1];
                //}
            }
            // The important click move
            else if (this.type == 'you' && (!x && !y) && app.button(0) >= 1 && !glob.freeze) {
                // Deduce x and y from click moving
                wasd = false;
                let mouse = wastes.gview.mwpos;
                mouse = pts.add(mouse, [.5, -.5]);
                let pos = this.wpos;
                pos = pts.add(pos, [.5, .5]);
                mouse = pts.subtract(mouse, pos);
                mouse[1] = -mouse[1];
                const dist = pts.distsimple(pos, wastes.gview.mwpos);
                if (dist > 0.5) {
                    x = mouse[0];
                    y = mouse[1];
                }
            }
            if (x || y) {
                // We have to deduce an angle and move that way
                // Unless we're aiming with a gun
                let angle = pts.angle([0, 0], [x, y]);
                this.angle = angle;
                x = speed * Math.sin(angle);
                y = speed * Math.cos(angle);
                if (!app.key('shift')) {
                    this.walkSmoother += ren.delta * 5;
                    this.try_move_as_square([x, y]);
                }
                else {
                    this.walkSmoother -= ren.delta * 5;
                }
            }
            else
                this.walkSmoother -= ren.delta * 5;
            if (this.type == 'you') {
                const sprite = this.shape;
                if (app.key('v') == 1) {
                    wastes.FOLLOW_CAMERA = !wastes.FOLLOW_CAMERA;
                }
                if (wastes.FOLLOW_CAMERA) {
                    wastes.gview.follow = this;
                }
                else {
                    wastes.gview.follow = undefined;
                }
            }
            this.walkSmoother = wastes.clamp(this.walkSmoother, 0, 1);
        }
        animateBodyParts() {
            var _a;
            const legsSwoop = 0.8;
            const armsSwoop = 0.5;
            const rise = 0.5;
            this.swoop += ren.delta * 2.5;
            if (!this.dead) {
                const swoop1 = Math.cos(Math.PI * this.swoop);
                const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);
                this.groups.head.rotation.y = 0;
                this.groups.head.rotation.z = 0;
                this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
                this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
                this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
                this.groups.arml.rotation.z = armsAngle;
                this.groups.armr.rotation.z = -armsAngle;
                this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
                this.groups.handr.rotation.x = 0;
                this.groups.handr.rotation.z = 0;
                if (this.gun && !this.gun.handgun) {
                    this.groups.handr.rotation.x = -Math.PI / 2;
                }
                else {
                }
                this.groups.ground.position.x = 0;
                this.groups.ground.position.y = 0; //+ swoop1 * swoop2 * rise * this.walkSmoother;
                this.groups.ground.rotation.y = -this.angle + Math.PI / 2;
                if (this.type == 'you') {
                    if (app.key('shift')) {
                        this.aiming = true;
                        if (app.button(0) == 1) {
                            console.log('shoot');
                            this.shoot = true;
                            for (let obj of lod.ggrid.visibleObjs) {
                                const cast = obj;
                                if (cast.isSuper && cast.bound) {
                                    const test = cast.bound.ray({
                                        dir: [Math.sin(this.angle), Math.cos(this.angle)],
                                        org: this.wpos
                                    });
                                    if (test) {
                                        console.log('we hit something');
                                        cast.onhit();
                                    }
                                }
                            }
                        }
                    }
                    else
                        this.aiming = false;
                }
                if (this.aiming) {
                    if (this.gun && this.gun.handgun) {
                        this.groups.armr.rotation.z = 0;
                        this.groups.armr.rotation.x = -Math.PI / 2;
                    }
                    else if (this.gun && !this.gun.handgun) {
                        this.groups.armr.rotation.x = -Math.PI / 9; // arm forward
                        this.groups.armr.rotation.z = 0.1; // arm inward
                        this.groups.arml.rotation.x = -Math.PI / 6; // forward
                        this.groups.arml.rotation.z = -Math.PI / 5; // inward
                        this.groups.handr.rotation.x = -Math.PI / 2.5; // hand up
                        //this.groups.handr.rotation.z = -0.05; // hand left right
                        //this.groups.head.rotation.z = 0.2;
                        //this.groups.head.rotation.y = 0.5;
                        //this.groups.ground.rotation.y -= 0.5;
                    }
                }
                else {
                }
                const sprite = this.shape;
                if (((_a = this.tile) === null || _a === void 0 ? void 0 : _a.type) == 'shallow water') {
                    //sprite.vars.orderBias = 0.25
                    this.meshes.water.visible = true;
                }
                else {
                    //sprite.vars.orderBias = 1.0;
                    this.meshes.water.visible = false;
                }
            }
            else {
                // dead
                this.groups.legl.rotation.x = -0.1;
                this.groups.legr.rotation.x = 0.1;
                this.groups.arml.rotation.x = 0.1;
                this.groups.armr.rotation.x = -0.1;
                this.groups.ground.position.y = -10;
                this.groups.ground.position.x = -0;
                this.groups.ground.rotation.x = Math.PI / 2;
                this.groups.ground.rotation.y = 0;
                this.groups.ground.rotation.z = -Math.PI / 2;
                this.groups.handr.rotation.x = 0;
                this.groups.handr.rotation.z = 0;
                this.meshes.shade.visible = false;
                const sprite = this.shape;
                sprite.vars.orderBias = 1.05;
            }
        }
        nettick() {
            //this.wpos = [43, 51];
            //return;
            if (this.type == 'you')
                return;
            //this.wpos = tiles.hovering!.wpos;
            if (!pts.together(this.netwpos))
                this.netwpos = this.wpos;
            // tween netwpos into wpos
            let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren.delta * 2);
            this.wpos = pts.add(this.wpos, tween);
            lod.sector.swap(this);
            if (this.netangle - this.angle > Math.PI)
                this.angle += Math.PI * 2;
            if (this.angle - this.netangle > Math.PI)
                this.angle -= Math.PI * 2;
            let tweenAngle = (this.netangle - this.angle) * ren.delta * 3;
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
        tick() {
            if (!this.shape)
                return;
            //if (this.type == 'you')
            //	this.wpos = tiles.hovering!.wpos;
            this.make();
            if (!this.dead)
                this.move();
            this.rebound();
            this.animateBodyParts();
            this.render();
            lod.sector.swap(this);
            let input = [1, 1, 1];
            // after a sector swap we could be destroyed
            const sprite = this.shape;
            if (sprite) {
                if (this.tile && this.tile.hasDeck) {
                    sprite.shadowAmount = 1.0;
                }
                else {
                    sprite.shadowAmount = shadows.get_amount(pts.round(this.wpos));
                }
                this.hovering_pass();
            }
            if (this.type == 'you') {
                //this.wpos = tiles.hovering!.wpos;
            }
            this.stack(['pawn', 'you', 'zombie', 'tree', 'chicken', 'shelves', 'grass', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
            super.obj_manual_update();
        }
    }
    pawn.noun = 'pawn';
    pawns.pawn = pawn;
})(pawns || (pawns = {}));
export default pawns;