var wastes = (function (exports, THREE) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var THREE__default = /*#__PURE__*/_interopDefaultLegacy(THREE);

    class pts {
        static pt(a) {
            return { x: a[0], y: a[1] };
        }
        static clone(zx) {
            return [zx[0], zx[1]];
        }
        static make(n, m) {
            return [n, m];
        }
        static to_string(a) {
            const pr = (b) => b != undefined ? `, ${b}` : '';
            return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
        }
        static func(bb, callback) {
            let y = bb.min[1];
            for (; y <= bb.max[1]; y++) {
                let x = bb.max[0];
                for (; x >= bb.min[0]; x--) {
                    callback([x, y]);
                }
            }
        }
        static project(a) {
            return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
        }
        static unproject(a) {
            return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
        }
        static equals(a, b) {
            return a[0] == b[0] && a[1] == b[1];
        }
        //static range(a: vec2, b: vec2): boolean {
        //	return true 
        //}
        /*
        static clamp(a: vec2, min: vec2, max: vec2): vec2 {
            const clamp = (val, min, max) =>
                val > max ? max : val < min ? min : val;
            return [clamp(a[0], min[0], max[0]), clamp(a[1], min[1], max[1])];
        }
        */
        static floor(a) {
            return [Math.floor(a[0]), Math.floor(a[1])];
        }
        static ceil(a) {
            return [Math.ceil(a[0]), Math.ceil(a[1])];
        }
        static inv(a) {
            return [-a[0], -a[1]];
        }
        static mult(a, n, m) {
            return [a[0] * n, a[1] * (m || n)];
        }
        static divide(a, n, m) {
            return [a[0] / n, a[1] / (m || n)];
        }
        static subtract(a, b) {
            return [a[0] - b[0], a[1] - b[1]];
        }
        static add(a, b) {
            return [a[0] + b[0], a[1] + b[1]];
        }
        static addn(a, b) {
            return [a[0] + b, a[1] + b];
        }
        static abs(a) {
            return [Math.abs(a[0]), Math.abs(a[1])];
        }
        static min(a, b) {
            return [Math.min(a[0], b[0]), Math.min(a[1], b[1])];
        }
        static max(a, b) {
            return [Math.max(a[0], b[0]), Math.max(a[1], b[1])];
        }
        static together(zx) {
            return zx[0] + zx[1];
        }
        // https://vorg.github.io/pex/docs/pex-geom/Vec2.html
        static dist(a, b) {
            let dx = b[0] - a[0];
            let dy = b[1] - a[1];
            return Math.sqrt(dx * dx + dy * dy);
        }
        static distsimple(a, b) {
            let dx = Math.abs(b[0] - a[0]);
            let dy = Math.abs(b[1] - a[1]);
            return Math.max(dx, dy);
        }
        ;
    }

    var TEST;
    (function (TEST) {
        TEST[TEST["Outside"] = 0] = "Outside";
        TEST[TEST["Inside"] = 1] = "Inside";
        TEST[TEST["Overlap"] = 2] = "Overlap";
    })(TEST || (TEST = {}));
    class aabb2 {
        constructor(a, b) {
            this.min = this.max = [...a];
            if (b) {
                this.extend(b);
            }
        }
        static dupe(bb) {
            return new aabb2(bb.min, bb.max);
        }
        extend(v) {
            this.min = pts.min(this.min, v);
            this.max = pts.max(this.max, v);
        }
        diagonal() {
            return pts.subtract(this.max, this.min);
        }
        center() {
            return pts.add(this.min, pts.mult(this.diagonal(), 0.5));
        }
        translate(v) {
            this.min = pts.add(this.min, v);
            this.max = pts.add(this.max, v);
        }
        test(b) {
            if (this.max[0] < b.min[0] || this.min[0] > b.max[0] ||
                this.max[1] < b.min[1] || this.min[1] > b.max[1])
                return 0;
            if (this.min[0] <= b.min[0] && this.max[0] >= b.max[0] &&
                this.min[1] <= b.min[1] && this.max[1] >= b.max[1])
                return 1;
            return 2;
        }
    }
    aabb2.TEST = TEST;

    var app;
    (function (app) {
        let KEY;
        (function (KEY) {
            KEY[KEY["OFF"] = 0] = "OFF";
            KEY[KEY["PRESS"] = 1] = "PRESS";
            KEY[KEY["WAIT"] = 2] = "WAIT";
            KEY[KEY["AGAIN"] = 3] = "AGAIN";
            KEY[KEY["UP"] = 4] = "UP";
        })(KEY = app.KEY || (app.KEY = {}));
        var keys = {};
        var buttons = {};
        var pos = [0, 0];
        app.salt = 'x';
        app.wheel = 0;
        function onkeys(event) {
            const key = event.key.toLowerCase();
            if ('keydown' == event.type)
                keys[key] = keys[key] ? KEY.AGAIN : KEY.PRESS;
            else if ('keyup' == event.type)
                keys[key] = KEY.UP;
            if (event.keyCode == 114)
                event.preventDefault();
        }
        app.onkeys = onkeys;
        function key(k) {
            return keys[k];
        }
        app.key = key;
        function button(b) {
            return buttons[b];
        }
        app.button = button;
        function mouse() {
            return [...pos];
        }
        app.mouse = mouse;
        function boot(version) {
            app.salt = version;
            function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
            function onmousedown(e) { buttons[e.button] = 1; }
            function onmouseup(e) { buttons[e.button] = 0; }
            function onwheel(e) { app.wheel = e.deltaY < 0 ? 1 : -1; }
            document.onkeydown = document.onkeyup = onkeys;
            document.onmousemove = onmousemove;
            document.onmousedown = onmousedown;
            document.onmouseup = onmouseup;
            document.onwheel = onwheel;
            ren$1.init();
            exports.wastes.init();
            loop();
        }
        app.boot = boot;
        function delay() {
            for (let i in keys) {
                if (KEY.PRESS == keys[i])
                    keys[i] = KEY.WAIT;
                else if (KEY.UP == keys[i])
                    keys[i] = KEY.OFF;
            }
        }
        app.delay = delay;
        function loop(timestamp) {
            requestAnimationFrame(loop);
            ren$1.update();
            exports.wastes.tick();
            ren$1.render();
            app.wheel = 0;
            for (let b of [0, 1, 2])
                if (buttons[b] == 1)
                    buttons[b] = 2;
            delay();
        }
        app.loop = loop;
        function sethtml(selector, html) {
            let element = document.querySelectorAll(selector)[0];
            element.innerHTML = html;
        }
        app.sethtml = sethtml;
    })(app || (app = {}));
    window['App'] = app;
    var app$1 = app;

    const fragmentPost = `
// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	gl_FragColor = clr;
}`;
    const vertexScreen = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;
    // three quarter
    var ren;
    (function (ren) {
        ren.DPI_UPSCALED_RT = true;
        ren.ndpi = 1;
        ren.delta = 0;
        let groups;
        (function (groups) {
        })(groups = ren.groups || (ren.groups = {}));
        //export var ambientLight: AmbientLight
        //export var directionalLight: DirectionalLight
        function update() {
            ren.delta = ren.clock.getDelta();
            if (ren.delta > 2)
                ren.delta = 0.016;
            //filmic.composer.render();
        }
        ren.update = update;
        var reset = 0;
        var frames = 0;
        // https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
        function calc() {
            const s = Date.now() / 1000;
            frames++;
            if (s - reset >= 1) {
                reset = s;
                ren.fps = frames;
                frames = 0;
            }
            ren.memory = window.performance.memory;
        }
        ren.calc = calc;
        function render() {
            calc();
            ren.renderer.setRenderTarget(ren.target);
            ren.renderer.clear();
            ren.renderer.render(ren.scene, ren.camera);
            ren.renderer.setRenderTarget(null);
            ren.renderer.clear();
            ren.renderer.render(ren.scenert, ren.camera2);
        }
        ren.render = render;
        function init() {
            console.log('renderer init');
            ren.clock = new THREE.Clock();
            groups.axisSwap = new THREE.Group;
            groups.tiles = new THREE.Group;
            //groups.menu = new Group
            ren.scene = new THREE.Scene();
            groups.axisSwap.add(groups.tiles);
            ren.scene.add(groups.axisSwap);
            ren.scene.background = new THREE.Color('#292929');
            ren.scenert = new THREE.Scene();
            ren.ambientLight = new THREE.AmbientLight(0xffffff);
            ren.scene.add(ren.ambientLight);
            if (ren.DPI_UPSCALED_RT)
                ren.ndpi = window.devicePixelRatio;
            ren.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE__default["default"].NearestFilter,
                magFilter: THREE__default["default"].NearestFilter,
                format: THREE__default["default"].RGBFormat
            });
            ren.renderer = new THREE.WebGLRenderer({ antialias: false });
            ren.renderer.setPixelRatio(ren.ndpi);
            ren.renderer.setSize(100, 100);
            ren.renderer.autoClear = true;
            ren.renderer.setClearColor(0xffffff, 0);
            document.body.appendChild(ren.renderer.domElement);
            window.addEventListener('resize', onWindowResize, false);
            ren.materialPost = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: ren.target.texture } },
                vertexShader: vertexScreen,
                fragmentShader: fragmentPost,
                depthWrite: false
            });
            onWindowResize();
            ren.quadPost = new THREE.Mesh(ren.plane, ren.materialPost);
            //quadPost.position.z = -100;
            ren.scenert.add(ren.quadPost);
            window.Renderer = ren;
        }
        ren.init = init;
        function onWindowResize() {
            ren.w = ren.w2 = window.innerWidth;
            ren.h = ren.h2 = window.innerHeight;
            if (ren.DPI_UPSCALED_RT) {
                ren.w2 = ren.w * ren.ndpi;
                ren.h2 = ren.h * ren.ndpi;
                if (ren.w2 % 2 != 0) ;
                if (ren.h2 % 2 != 0) ;
            }
            console.log(`window inner [${ren.w}, ${ren.h}], new is [${ren.w2}, ${ren.h2}]`);
            ren.target.setSize(ren.w2, ren.h2);
            ren.plane = new THREE.PlaneBufferGeometry(ren.w2, ren.h2);
            if (ren.quadPost)
                ren.quadPost.geometry = ren.plane;
            {
                ren.camera = ortographic_camera(ren.w2, ren.h2);
            }
            ren.camera2 = ortographic_camera(ren.w2, ren.h2);
            ren.camera2.updateProjectionMatrix();
            ren.renderer.setSize(ren.w, ren.h);
        }
        let mem = [];
        function load_texture(file, mode = 1, cb, key) {
            if (mem[key || file])
                return mem[key || file];
            let texture = new THREE.TextureLoader().load(file + `?v=${app$1.salt}`, cb);
            texture.generateMipmaps = false;
            texture.center.set(0, 1);
            texture.wrapS = texture.wrapT = THREE__default["default"].RepeatWrapping;
            if (mode) {
                texture.magFilter = THREE__default["default"].LinearFilter;
                texture.minFilter = THREE__default["default"].LinearFilter;
            }
            else {
                texture.magFilter = THREE__default["default"].NearestFilter;
                texture.minFilter = THREE__default["default"].NearestFilter;
            }
            mem[key || file] = texture;
            return texture;
        }
        ren.load_texture = load_texture;
        function make_render_target(w, h) {
            const o = {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            };
            let target = new THREE.WebGLRenderTarget(w, h, o);
            return target;
        }
        ren.make_render_target = make_render_target;
        function ortographic_camera(w, h) {
            let camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10000, 10000);
            camera.updateProjectionMatrix();
            return camera;
        }
        ren.ortographic_camera = ortographic_camera;
        function erase_children(group) {
            while (group.children.length > 0)
                group.remove(group.children[0]);
        }
        ren.erase_children = erase_children;
    })(ren || (ren = {}));
    var ren$1 = ren;

    // inspired by gmod lua
    class hooks {
        constructor() {
            this.list = [];
        }
        static create(name) {
            hooks[name] = [];
        }
        static register(name, f) {
            if (!hooks[name]) {
                console.warn(' hook automatically created ');
                this.create(name);
            }
            hooks[name].push(f);
        }
        static unregister(name, f) {
            hooks[name] = hooks[name].filter(e => e != f);
        }
        static call(name, x) {
            if (!hooks[name])
                return;
            for (let i = hooks[name].length; i--;)
                if (hooks[name][i](x))
                    return;
        }
    }

    var Numbers;
    (function (Numbers) {
        Numbers.Sectors = [0, 0];
        Numbers.Sprites = [0, 0];
        Numbers.Objs = [0, 0];
        Numbers.Tiles = [0, 0];
        Numbers.Trees = [0, 0];
        Numbers.Walls = [0, 0];
    })(Numbers || (Numbers = {}));
    class Toggle {
        constructor() {
            this.active = false;
        }
        isActive() { return this.active; }
        ;
        on() {
            if (this.active) {
                console.warn(' (lod) already on ');
                return true;
                // it was on before
            }
            this.active = true;
            return false;
            // it wasn't on before
        }
        off() {
            if (!this.active) {
                console.warn(' (lod) already off ');
                return true;
            }
            this.active = false;
            return false;
        }
    }
    var lod;
    (function (lod) {
        lod.SectorSpan = 4;
        function register() {
            hooks.create('sectorCreate');
            hooks.create('sectorShow');
            hooks.create('sectorHide');
        }
        lod.register = register;
        function project(unit) {
            return pts.mult(pts.project(unit), wastes.size);
        }
        lod.project = project;
        function unproject(pixel) {
            return pts.divide(pts.unproject(pixel), wastes.size);
        }
        lod.unproject = unproject;
        function add(obj) {
            let sector = lod.galaxy.at(lod.galaxy.big(obj.wpos));
            sector.add(obj);
        }
        lod.add = add;
        class Galaxy {
            constructor(span) {
                this.arrays = [];
                lod.galaxy = this;
                new Grid(8, 8);
            }
            update(wpos) {
                lod.grid.big = this.big(wpos);
                lod.grid.offs();
                lod.grid.crawl();
            }
            lookup(big) {
                if (this.arrays[big[1]] == undefined)
                    this.arrays[big[1]] = [];
                return this.arrays[big[1]][big[0]];
            }
            at(big) {
                return this.lookup(big) || this.make(big);
            }
            make(big) {
                let s = this.lookup(big);
                if (s)
                    return s;
                s = this.arrays[big[1]][big[0]] = new Sector(big, this);
                return s;
            }
            big(units) {
                return pts.floor(pts.divide(units, lod.SectorSpan));
            }
        }
        lod.Galaxy = Galaxy;
        class Sector extends Toggle {
            constructor(big, galaxy) {
                super();
                this.big = big;
                this.galaxy = galaxy;
                this.objs = [];
                //this.color = (['salmon', 'blue', 'cyan', 'purple'])[Math.floor(Math.random() * 4)];
                let min = pts.mult(this.big, lod.SectorSpan);
                let max = pts.add(min, [lod.SectorSpan - 1, lod.SectorSpan - 1]);
                this.small = new aabb2(max, min);
                this.group = new THREE.Group;
                this.group.frustumCulled = false;
                this.group.matrixAutoUpdate = false;
                Numbers.Sectors[1]++;
                galaxy.arrays[this.big[1]][this.big[0]] = this;
                //console.log('sector');
                hooks.call('sectorCreate', this);
            }
            objs_() { return this.objs; }
            add(obj) {
                let i = this.objs.indexOf(obj);
                if (i == -1) {
                    this.objs.push(obj);
                    obj.sector = this;
                    if (this.isActive())
                        obj.show();
                }
            }
            remove(obj) {
                let i = this.objs.indexOf(obj);
                if (i > -1) {
                    obj.sector = null;
                    return !!this.objs.splice(i, 1).length;
                }
            }
            swap(obj) {
                /*let newSector = this.galaxy.sectoratpixel(obj.rpos);
                if (obj.sector != newSector) {
                    obj.sector?.remove(obj);
                    newSector.add(obj);
                    if (!newSector.isActive())
                        obj.hide();
                }*/
            }
            tick() {
                hooks.call('sectorTick', this);
                //for (let obj of this.objs)
                //	obj.tick();
            }
            show() {
                if (this.on())
                    return;
                Numbers.Sectors[0]++;
                //console.log('?');
                for (let obj of this.objs)
                    obj.show();
                ren$1.scene.add(this.group);
                hooks.call('sectorShow', this);
            }
            hide() {
                if (this.off())
                    return;
                Numbers.Sectors[0]--;
                for (let obj of this.objs)
                    obj.hide();
                ren$1.scene.remove(this.group);
                hooks.call('sectorHide', this);
            }
            dist() {
                return pts.distsimple(this.big, lod.grid.big);
            }
        }
        lod.Sector = Sector;
        class Grid {
            constructor(spread, outside) {
                this.spread = spread;
                this.outside = outside;
                this.big = [0, 0];
                this.shown = [];
                lod.grid = this;
            }
            visible(sector) {
                return sector.dist() < this.spread;
            }
            crawl() {
                for (let y = -this.spread; y < this.spread; y++) {
                    for (let x = -this.spread; x < this.spread; x++) {
                        let pos = pts.add(this.big, [x, y]);
                        let sector = lod.galaxy.lookup(pos);
                        if (!sector)
                            continue;
                        if (!sector.isActive()) {
                            this.shown.push(sector);
                            sector.show();
                        }
                    }
                }
            }
            offs() {
                let allObjs = [];
                let i = this.shown.length;
                while (i--) {
                    let sector;
                    sector = this.shown[i];
                    allObjs = allObjs.concat(sector.objs_());
                    sector.tick();
                    if (sector.dist() > this.outside) {
                        sector.hide();
                        this.shown.splice(i, 1);
                    }
                }
                for (let obj of allObjs)
                    obj.tick();
            }
        }
        lod.Grid = Grid;
        class Obj extends Toggle {
            constructor(hints, counts = Numbers.Objs) {
                super();
                this.counts = counts;
                this.wpos = [0, 0];
                this.rpos = [0, 0];
                this.size = [100, 100];
                this.rz = 0;
                this.counts[1]++;
            }
            finalize() {
                this.hide();
                this.counts[1]--;
            }
            show() {
                var _a;
                if (this.on())
                    return;
                this.counts[0]++;
                this.create();
                this.update();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.show();
            }
            hide() {
                var _a;
                if (this.off())
                    return;
                this.counts[0]--;
                this.delete();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.hide();
                // console.log(' obj.hide ');
            }
            wtorpos() {
                this.rpos = lod.project(this.wpos);
            }
            tick() {
            }
            create() {
                console.warn(' (lod) obj.create ');
            }
            delete() {
                console.warn(' (lod) obj.delete ');
            }
            update() {
                var _a;
                this.wtorpos();
                this.bound();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.update();
            }
            bound() {
                this.aabbScreen = new aabb2([0, 0], this.size);
                this.aabbScreen.translate(this.rpos);
            }
            mousedSquare(mouse) {
                var _a;
                if ((_a = this.aabbScreen) === null || _a === void 0 ? void 0 : _a.test(new aabb2(mouse, mouse)))
                    return true;
            }
        }
        lod.Obj = Obj;
        class Shape extends Toggle {
            constructor(bindObj, counts) {
                super();
                this.bindObj = bindObj;
                this.counts = counts;
                this.bindObj.shape = this;
                this.counts[1]++;
            }
            update() {
            }
            create() {
            }
            dispose() {
            }
            finalize() {
                this.hide();
                this.counts[1]--;
            }
            show() {
                if (this.on())
                    return;
                this.create();
                this.counts[0]++;
            }
            hide() {
                if (this.off())
                    return;
                this.dispose();
                this.counts[0]--;
            }
        }
        lod.Shape = Shape;
    })(lod || (lod = {}));
    var lod$1 = lod;

    class Sprite extends lod$1.Shape {
        constructor(pars) {
            super(pars.bindObj, Numbers.Sprites);
            this.pars = pars;
            this.z = 0;
            this.offset = [0, 0];
            this.repeat = [1, 1];
            this.center = [0, 1];
            this.myUvTransform = new THREE.Matrix3;
        }
        update() {
            var _a, _b;
            if (!this.mesh)
                return;
            this.mesh.rotation.z = this.pars.bindObj.rz;
            const obj = this.pars.bindObj;
            let rpos = pts.add(obj.rpos, pts.divide(obj.size, 2));
            rpos = pts.add(rpos, [0, this.z]);
            (_a = this.mesh) === null || _a === void 0 ? void 0 : _a.position.fromArray([...rpos, 0]);
            (_b = this.mesh) === null || _b === void 0 ? void 0 : _b.updateMatrix();
        }
        dispose() {
            var _a, _b, _c;
            if (!this.mesh)
                return;
            (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this.material) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this.mesh.parent) === null || _c === void 0 ? void 0 : _c.remove(this.mesh);
        }
        create() {
            const obj = this.pars.bindObj;
            this.myUvTransform.setUvTransform(this.offset[0], this.offset[1], this.repeat[0], this.repeat[1], 0, this.center[0], this.center[1]);
            this.geometry = new THREE.PlaneBufferGeometry(this.pars.bindObj.size[0], this.pars.bindObj.size[1]);
            let color;
            if (this.pars.bindObj.sector.color) {
                color = new THREE.Color(this.pars.bindObj.sector.color);
            }
            else {
                const c = this.pars.color || [255, 255, 255, 255];
                color = new THREE.Color(`rgb(${c[0]}, ${c[1]}, ${c[2]})}`);
            }
            this.material = SpriteMaterial({
                map: ren$1.load_texture(`${this.pars.img}.png`, 0),
                transparent: true,
                color: color
            }, {
                myUvTransform: this.myUvTransform
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
            this.mesh.matrixAutoUpdate = false;
            this.mesh.renderOrder = -obj.wpos[1] + obj.wpos[0] + (this.pars.orderOffset || 0);
            this.update();
            const sector = this.pars.bindObj.sector;
            sector === null || sector === void 0 ? void 0 : sector.group.add(this.mesh);
            ren$1.groups.axisSwap.add(this.mesh);
        }
    }
    function SpriteMaterial(parameters, uniforms) {
        let material = new THREE.MeshBasicMaterial(parameters);
        material.name = "SpriteMaterial";
        material.onBeforeCompile = function (shader) {
            shader.defines = {};
            shader.uniforms.myUvTransform = { value: uniforms.myUvTransform };
            shader.vertexShader = shader.vertexShader.replace(`#include <common>`, `#include <common>
			uniform mat3 myUvTransform;
			`);
            shader.vertexShader = shader.vertexShader.replace(`#include <uv_vertex>`, `
			#ifdef USE_UV
			vUv = ( myUvTransform * vec3( uv, 1 ) ).xy;
			#endif
			`);
        };
        return material;
    }

    var testing_chamber;
    (function (testing_chamber) {
        testing_chamber.started = false;
        function start() {
            console.log(' start testing chamber ');
            console.log('placing squares on game area that should take up 1:1 pixels on screen...');
            console.log('...regardless of your os or browsers dpi setting');
            wastes.view.zoom = 1;
            wastes.view.wpos = [0, 0];
            wastes.view.rpos = lod$1.unproject([0, 0]);
            hooks.register('sectorShow', (x) => {
                console.log('(testing chamber) show sector');
                return false;
            });
            hooks.register('viewClick', (view) => {
                console.log(' asteorid! ');
                let ping = new Asteroid;
                ping.wpos = pts.add(wastes.view.mwpos, [-1, -1]);
                lod$1.add(ping);
                return false;
            });
            lod$1.SectorSpan = 4;
            lod$1.grid = new lod$1.Grid(1, 1);
            lod$1.project = function (unit) { return pts.mult(unit, 100); };
            lod$1.unproject = function (pixel) { return pts.divide(pixel, 100); };
            for (let y = 0; y < 10; y++) {
                for (let x = 0; x < 10; x++) {
                    let square = Square.make();
                    square.wpos = [x, y];
                    lod$1.add(square);
                }
            }
            testing_chamber.started = true;
        }
        testing_chamber.start = start;
        function tick() {
        }
        testing_chamber.tick = tick;
        class Asteroid extends lod$1.Obj {
            constructor() {
                super(undefined);
                this.size = [100, 100];
                this.float = pts.make((Math.random() - 0.5) / Asteroid.slowness, (Math.random() - 0.5) / Asteroid.slowness);
                this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
            }
            create() {
                this.size = [200, 200];
                new Sprite({
                    bindObj: this,
                    img: 'tex/pngwing.com'
                });
            }
            tick() {
                var _a;
                this.wpos[0] += this.float[0];
                this.wpos[1] -= this.float[1];
                this.rz += this.rate;
                super.update();
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
            }
        }
        Asteroid.slowness = 12;
        testing_chamber.Asteroid = Asteroid;
        class Square extends lod$1.Obj {
            static make() {
                return new Square;
            }
            constructor() {
                super(undefined);
                console.log('square');
            }
            create() {
                console.log('create');
                this.size = [100, 100];
                new Sprite({
                    bindObj: this,
                    img: 'tex/test100'
                });
            }
            tick() {
                let shape = this.shape;
                if (this.mousedSquare(wastes.view.mrpos))
                    shape.mesh.material.color.set('green');
                else
                    shape.material.color.set('white');
            }
        }
        testing_chamber.Square = Square;
    })(testing_chamber || (testing_chamber = {}));
    var testing_chamber$1 = testing_chamber;

    var tests;
    (function (tests) {
        function start() {
            BigMouseRock.start();
        }
        tests.start = start;
        function tick() {
            BigMouseRock.tick();
        }
        tests.tick = tick;
        class BigMouseRock {
            static start() {
            }
            static tick() {
                var _a;
                if (this.obj) {
                    this.obj.rpos = wastes.view.mrpos;
                    (_a = this.obj.shape) === null || _a === void 0 ? void 0 : _a.update();
                    this.obj.shape;
                }
            }
        }
        tests.BigMouseRock = BigMouseRock;
    })(tests || (tests = {}));
    var tests$1 = tests;

    // the view manages what it sees
    class View {
        constructor() {
            this.zoom = 0.5;
            this.wpos = [39, 39];
            this.rpos = [0, 0];
            this.mpos = [0, 0];
            this.mwpos = [0, 0];
            this.mrpos = [0, 0];
            this.begin = [0, 0];
            this.before = [0, 0];
            this.show = true;
            new lod$1.Galaxy(10);
            this.rpos = lod$1.project(this.wpos);
        }
        static make() {
            return new View;
        }
        chart(big) {
        }
        remove(obj) {
            var _a;
            (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
        }
        tick() {
            this.move();
            this.mouse();
            this.chase();
            this.stats();
            this.rpos = pts.floor(this.rpos);
            this.wpos = lod$1.unproject(this.rpos);
            lod$1.galaxy.update(this.wpos);
            const zoom = wastes.view.zoom;
            ren$1.camera.scale.set(zoom, zoom, zoom);
            ren$1.camera.updateProjectionMatrix();
        }
        pan() {
            const panDivisor = 3;
            if (app$1.button(1) == 1) {
                let mouse = app$1.mouse();
                mouse[1] = -mouse[1];
                this.begin = mouse;
                this.before = pts.clone(this.rpos);
            }
            if (app$1.button(1) >= 1) {
                let mouse = app$1.mouse();
                mouse[1] = -mouse[1];
                let dif = pts.subtract(this.begin, mouse);
                {
                    dif = pts.divide(dif, panDivisor);
                    dif = pts.subtract(dif, this.before);
                    this.rpos = pts.inv(dif);
                }
            }
        }
        chase() {
            ren$1.delta;
            pts.mult([0, 0], 0);
            this.pan();
            //let ply = PRY.ply.rpos;
            //this.rpos = pts.add(pts.mult(pts.subtract(ply, this.rpos), time * 5), this.rpos);
            //this.rpos = pts.mult(this.rpos, this.zoom);
            let inv = pts.inv(this.rpos);
            //ren.camera.position.set(inv[0], inv[1], 0);
            ren$1.groups.axisSwap.position.set(inv[0], inv[1], 0);
        }
        mouse() {
            let mouse = app$1.mouse();
            mouse = pts.subtract(mouse, pts.divide([ren$1.w, ren$1.h], 2));
            mouse = pts.mult(mouse, ren$1.ndpi);
            mouse = pts.mult(mouse, this.zoom);
            mouse[1] = -mouse[1];
            this.mrpos = pts.add(mouse, this.rpos);
            this.mrpos = pts.add(this.mrpos, lod$1.project([.5, -.5])); // correction
            this.mwpos = lod$1.unproject(this.mrpos);
            //this.mwpos = pts.add(this.mwpos, [.5, -.5])
            // now..
            if (app$1.button(2) >= 1) {
                hooks.call('viewClick', this);
            }
        }
        move() {
            let pan = 5;
            const zoomFactor = 1 / 10;
            if (app$1.key('x'))
                pan *= 2;
            if (app$1.key('w'))
                this.rpos = pts.add(this.rpos, [0, pan]);
            if (app$1.key('s'))
                this.rpos = pts.add(this.rpos, [0, -pan]);
            if (app$1.key('a'))
                this.rpos = pts.add(this.rpos, [-pan, 0]);
            if (app$1.key('d'))
                this.rpos = pts.add(this.rpos, [pan, 0]);
            if (app$1.key('r') == 1)
                this.zoom -= zoomFactor;
            if (app$1.key('f') == 1)
                this.zoom += zoomFactor;
            //this.rpos = lod.galaxy.project(this.wpos);
            const min = .1;
            const max = 1;
            this.zoom = this.zoom > max ? max : this.zoom < min ? min : this.zoom;
        }
        stats() {
            if (app$1.key('h') == 1)
                this.show = !this.show;
            let crunch = ``;
            crunch += `DPI_UPSCALED_RT: ${ren$1.DPI_UPSCALED_RT}<br />`;
            crunch += '<br />';
            crunch += `dpi: ${ren$1.ndpi}<br />`;
            crunch += `fps: ${ren$1.fps} / ${ren$1.delta.toPrecision(3)}<br />`;
            crunch += '<br />';
            crunch += `textures: ${ren$1.renderer.info.memory.textures}<br />`;
            crunch += `programs: ${ren$1.renderer.info.programs.length}<br />`;
            crunch += `memory: ${Math.floor(ren$1.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren$1.memory.totalJSHeapSize / 1000000)}<br />`;
            crunch += '<br />';
            //crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
            //crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
            crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
            crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
            crunch += '<br />';
            crunch += `view wpos: ${pts.to_string(pts.floor(this.wpos))}<br />`;
            crunch += `view bigpos: ${pts.to_string(lod$1.galaxy.big(this.wpos))}<br />`;
            crunch += `view zoom: ${this.zoom.toPrecision(2)}<br />`;
            crunch += '<br />';
            //crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
            crunch += `sectors: ${Numbers.Sectors[0]} / ${Numbers.Sectors[1]}<br />`;
            crunch += `game objs: ${Numbers.Objs[0]} / ${Numbers.Objs[1]}<br />`;
            crunch += `sprites: ${Numbers.Sprites[0]} / ${Numbers.Sprites[1]}<br />`;
            crunch += `trees: ${Numbers.Trees[0]} / ${Numbers.Trees[1]}<br />`;
            crunch += `tiles: ${Numbers.Tiles[0]} / ${Numbers.Tiles[1]}<br />`;
            crunch += '<br />';
            crunch += `controls: WASD, X to go fast, middlemouse to pan<br />`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = this.show ? 'visible' : 'hidden';
        }
    }

    var tiles;
    (function (tiles_1) {
        const mapSize = 100;
        var tiles = [];
        function get(pos) {
            if (tiles[pos[1]])
                return tiles[pos[1]][pos[0]];
        }
        tiles_1.get = get;
        function register() {
            console.log(' tiles register ');
        }
        tiles_1.register = register;
        function start() {
            console.log(' tiles start ');
            pts.func(new aabb2([0, 0], [mapSize - 1, mapSize - 1]), (pos) => {
                let x = pos[0];
                let y = pos[1];
                if (tiles[y] == undefined)
                    tiles[y] = [];
                let tile = new Tile([x, y]);
                tiles[y][x] = tile;
                lod$1.add(tile);
            });
        }
        tiles_1.start = start;
        function tick() {
            tiles_1.raisedmpos = lod$1.unproject(pts.add(wastes.view.mrpos, [0, -4]));
            tiles_1.raisedmpos = pts.floor(tiles_1.raisedmpos);
            const tile = get(tiles_1.raisedmpos);
            if (tile && tile.z == 4)
                tile === null || tile === void 0 ? void 0 : tile.hover();
        }
        tiles_1.tick = tick;
        class Tile extends lod$1.Obj {
            constructor(wpos) {
                super(undefined, Numbers.Tiles);
                this.wpos = wpos;
                this.img = 'tex/dtile';
                this.size = [24, 12];
                this.z = 0;
                this.color = [63, 63, 127, 255];
                let pixel = wastes.colormap.pixel(this.wpos);
                if (!pixel.is_black()) {
                    this.z = 4;
                    this.size = [24, 17];
                    this.img = 'tex/dtileup4';
                    this.color = wastes.colormap.pixel(this.wpos).array;
                }
            }
            create() {
                new Sprite({
                    bindObj: this,
                    img: this.img,
                    color: this.color
                });
            }
            //update() {}
            delete() {
            }
            hover() {
                let sprite = this.shape;
                if (!(sprite === null || sprite === void 0 ? void 0 : sprite.mesh))
                    return;
                sprite.mesh.material.color.set('green');
            }
            tick() {
            }
        }
        tiles_1.Tile = Tile;
    })(tiles || (tiles = {}));
    var tiles$1 = tiles;

    var objects;
    (function (objects) {
        const mapSpan = 100;
        function register() {
            console.log(' objects register ');
            wastes.heightmap = new ColorMap('heightmap');
            wastes.objectmap = new ColorMap('objectmap');
            wastes.treemap = new ColorMap('treemap');
            wastes.colormap = new ColorMap('colormap');
            const treeTreshold = 50;
            hooks.register('sectorCreate', (x) => {
                let sector = x;
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.treemap.pixel(pos);
                    if (pixel.array[0] > treeTreshold) {
                        let shrubs = new Shrubs();
                        shrubs.pixel = pixel;
                        shrubs.wpos = pos;
                        lod$1.add(shrubs);
                    }
                });
                return false;
            });
            hooks.register('sectorCreate', (x) => {
                let sector = x;
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.objectmap.pixel(pos);
                    if (pixel.is_white()) {
                        let wall = new Wall();
                        wall.pixel = pixel;
                        wall.wpos = pos;
                        lod$1.add(wall);
                    }
                });
                return false;
            });
        }
        objects.register = register;
        function start() {
            console.log(' objects start ');
        }
        objects.start = start;
        const zeroes = [0, 0, 0, 0];
        class Pixel {
            constructor(context, pos, array) {
                this.context = context;
                this.pos = pos;
                this.array = array;
            }
            left() {
                this.context.pixel(pts.add(this.pos, [-1, 0]));
            }
            right() {
                this.context.pixel(pts.add(this.pos, [1, 0]));
            }
            up() {
                this.context.pixel(pts.add(this.pos, [0, 1]));
            }
            down() {
                this.context.pixel(pts.add(this.pos, [0, -1]));
            }
            equals(vec) {
                return vec[0] == this.array[0] && vec[1] == this.array[1] && vec[2] == this.array[2];
            }
            is_black() {
                return this.equals([0, 0, 0]);
            }
            is_white() {
                return this.equals([255, 255, 255]);
            }
            purple_water() {
                return [63, 63, 127];
            }
        }
        class ColorMap {
            constructor(id) {
                this.data = [];
                var img = document.getElementById(id);
                this.canvas = document.createElement('canvas');
                this.canvas.width = mapSpan;
                this.canvas.height = mapSpan;
                this.ctx = this.canvas.getContext('2d');
                //this.ctx.scale(1, 1);
                this.ctx.drawImage(img, 0, 0, img.width, img.height);
                this.process();
            }
            get(pos) {
                if (this.data[pos[1]])
                    return this.data[pos[1]][pos[0]];
                return zeroes;
            }
            pixel(pos) {
                return new Pixel(this, pos, this.get(pos));
            }
            process() {
                for (let y = 0; y < mapSpan; y++) {
                    this.data[y] = [];
                    for (let x = 0; x < mapSpan; x++) {
                        const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
                        if (this.data[y] == undefined)
                            this.data[y] = [];
                        this.data[y][x] = data;
                    }
                }
            }
        }
        objects.ColorMap = ColorMap;
        class TiledObj extends lod$1.Obj {
            constructor(x, y) {
                super(x, y);
            }
            update() {
                if (this.shape) {
                    const tile = tiles$1.get(this.wpos);
                    if (tile)
                        this.shape.z = tile.z;
                }
                super.update();
            }
        }
        objects.TiledObj = TiledObj;
        class Wall extends TiledObj {
            constructor() {
                super(undefined, Numbers.Walls);
            }
            create() {
                this.size = [24, 40];
                new Sprite({
                    bindObj: this,
                    img: 'tex/dwall',
                    orderOffset: .5
                });
            }
            adapt() {
                // change sprite to surrounding walls
            }
        }
        objects.Wall = Wall;
        class Shrubs extends TiledObj {
            constructor() {
                super(undefined, Numbers.Trees);
            }
            create() {
                this.size = [24, 15];
                new Sprite({
                    bindObj: this,
                    img: 'tex/shrubs',
                    orderOffset: .5
                });
            }
        }
        objects.Shrubs = Shrubs;
    })(objects || (objects = {}));
    var objects$1 = objects;

    class TGALoader extends THREE.DataTextureLoader {

    	constructor( manager ) {

    		super( manager );

    	}

    	parse( buffer ) {

    		// reference from vthibault, https://github.com/vthibault/roBrowser/blob/master/src/Loaders/Targa.js

    		function tgaCheckHeader( header ) {

    			switch ( header.image_type ) {

    				// check indexed type

    				case TGA_TYPE_INDEXED:
    				case TGA_TYPE_RLE_INDEXED:
    					if ( header.colormap_length > 256 || header.colormap_size !== 24 || header.colormap_type !== 1 ) {

    						console.error( 'THREE.TGALoader: Invalid type colormap data for indexed type.' );

    					}

    					break;

    					// check colormap type

    				case TGA_TYPE_RGB:
    				case TGA_TYPE_GREY:
    				case TGA_TYPE_RLE_RGB:
    				case TGA_TYPE_RLE_GREY:
    					if ( header.colormap_type ) {

    						console.error( 'THREE.TGALoader: Invalid type colormap data for colormap type.' );

    					}

    					break;

    					// What the need of a file without data ?

    				case TGA_TYPE_NO_DATA:
    					console.error( 'THREE.TGALoader: No data.' );

    					// Invalid type ?

    				default:
    					console.error( 'THREE.TGALoader: Invalid type "%s".', header.image_type );

    			}

    			// check image width and height

    			if ( header.width <= 0 || header.height <= 0 ) {

    				console.error( 'THREE.TGALoader: Invalid image size.' );

    			}

    			// check image pixel size

    			if ( header.pixel_size !== 8 && header.pixel_size !== 16 &&
    				header.pixel_size !== 24 && header.pixel_size !== 32 ) {

    				console.error( 'THREE.TGALoader: Invalid pixel size "%s".', header.pixel_size );

    			}

    		}

    		// parse tga image buffer

    		function tgaParse( use_rle, use_pal, header, offset, data ) {

    			let pixel_data,
    				palettes;

    			const pixel_size = header.pixel_size >> 3;
    			const pixel_total = header.width * header.height * pixel_size;

    			 // read palettes

    			 if ( use_pal ) {

    				 palettes = data.subarray( offset, offset += header.colormap_length * ( header.colormap_size >> 3 ) );

    			 }

    			 // read RLE

    			 if ( use_rle ) {

    				 pixel_data = new Uint8Array( pixel_total );

    				let c, count, i;
    				let shift = 0;
    				const pixels = new Uint8Array( pixel_size );

    				while ( shift < pixel_total ) {

    					c = data[ offset ++ ];
    					count = ( c & 0x7f ) + 1;

    					// RLE pixels

    					if ( c & 0x80 ) {

    						// bind pixel tmp array

    						for ( i = 0; i < pixel_size; ++ i ) {

    							pixels[ i ] = data[ offset ++ ];

    						}

    						// copy pixel array

    						for ( i = 0; i < count; ++ i ) {

    							pixel_data.set( pixels, shift + i * pixel_size );

    						}

    						shift += pixel_size * count;

    					} else {

    						// raw pixels

    						count *= pixel_size;

    						for ( i = 0; i < count; ++ i ) {

    							pixel_data[ shift + i ] = data[ offset ++ ];

    						}

    						shift += count;

    					}

    				}

    			 } else {

    				// raw pixels

    				pixel_data = data.subarray(
    					 offset, offset += ( use_pal ? header.width * header.height : pixel_total )
    				);

    			 }

    			 return {
    				pixel_data: pixel_data,
    				palettes: palettes
    			 };

    		}

    		function tgaGetImageData8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image, palettes ) {

    			const colormap = palettes;
    			let color, i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

    					color = image[ i ];
    					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
    					imageData[ ( x + width * y ) * 4 + 2 ] = colormap[ ( color * 3 ) + 0 ];
    					imageData[ ( x + width * y ) * 4 + 1 ] = colormap[ ( color * 3 ) + 1 ];
    					imageData[ ( x + width * y ) * 4 + 0 ] = colormap[ ( color * 3 ) + 2 ];

    				}

    			}

    			return imageData;

    		}

    		function tgaGetImageData16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

    			let color, i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

    					color = image[ i + 0 ] + ( image[ i + 1 ] << 8 );
    					imageData[ ( x + width * y ) * 4 + 0 ] = ( color & 0x7C00 ) >> 7;
    					imageData[ ( x + width * y ) * 4 + 1 ] = ( color & 0x03E0 ) >> 2;
    					imageData[ ( x + width * y ) * 4 + 2 ] = ( color & 0x001F ) << 3;
    					imageData[ ( x + width * y ) * 4 + 3 ] = ( color & 0x8000 ) ? 0 : 255;

    				}

    			}

    			return imageData;

    		}

    		function tgaGetImageData24bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

    			let i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i += 3 ) {

    					imageData[ ( x + width * y ) * 4 + 3 ] = 255;
    					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
    					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
    					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];

    				}

    			}

    			return imageData;

    		}

    		function tgaGetImageData32bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

    			let i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i += 4 ) {

    					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
    					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 1 ];
    					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 2 ];
    					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 3 ];

    				}

    			}

    			return imageData;

    		}

    		function tgaGetImageDataGrey8bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

    			let color, i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i ++ ) {

    					color = image[ i ];
    					imageData[ ( x + width * y ) * 4 + 0 ] = color;
    					imageData[ ( x + width * y ) * 4 + 1 ] = color;
    					imageData[ ( x + width * y ) * 4 + 2 ] = color;
    					imageData[ ( x + width * y ) * 4 + 3 ] = 255;

    				}

    			}

    			return imageData;

    		}

    		function tgaGetImageDataGrey16bits( imageData, y_start, y_step, y_end, x_start, x_step, x_end, image ) {

    			let i = 0, x, y;
    			const width = header.width;

    			for ( y = y_start; y !== y_end; y += y_step ) {

    				for ( x = x_start; x !== x_end; x += x_step, i += 2 ) {

    					imageData[ ( x + width * y ) * 4 + 0 ] = image[ i + 0 ];
    					imageData[ ( x + width * y ) * 4 + 1 ] = image[ i + 0 ];
    					imageData[ ( x + width * y ) * 4 + 2 ] = image[ i + 0 ];
    					imageData[ ( x + width * y ) * 4 + 3 ] = image[ i + 1 ];

    				}

    			}

    			return imageData;

    		}

    		function getTgaRGBA( data, width, height, image, palette ) {

    			let x_start,
    				y_start,
    				x_step,
    				y_step,
    				x_end,
    				y_end;

    			switch ( ( header.flags & TGA_ORIGIN_MASK ) >> TGA_ORIGIN_SHIFT ) {

    				default:
    				case TGA_ORIGIN_UL:
    					x_start = 0;
    					x_step = 1;
    					x_end = width;
    					y_start = 0;
    					y_step = 1;
    					y_end = height;
    					break;

    				case TGA_ORIGIN_BL:
    					x_start = 0;
    					x_step = 1;
    					x_end = width;
    					y_start = height - 1;
    					y_step = - 1;
    					y_end = - 1;
    					break;

    				case TGA_ORIGIN_UR:
    					x_start = width - 1;
    					x_step = - 1;
    					x_end = - 1;
    					y_start = 0;
    					y_step = 1;
    					y_end = height;
    					break;

    				case TGA_ORIGIN_BR:
    					x_start = width - 1;
    					x_step = - 1;
    					x_end = - 1;
    					y_start = height - 1;
    					y_step = - 1;
    					y_end = - 1;
    					break;

    			}

    			if ( use_grey ) {

    				switch ( header.pixel_size ) {

    					case 8:
    						tgaGetImageDataGrey8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
    						break;

    					case 16:
    						tgaGetImageDataGrey16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
    						break;

    					default:
    						console.error( 'THREE.TGALoader: Format not supported.' );
    						break;

    				}

    			} else {

    				switch ( header.pixel_size ) {

    					case 8:
    						tgaGetImageData8bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image, palette );
    						break;

    					case 16:
    						tgaGetImageData16bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
    						break;

    					case 24:
    						tgaGetImageData24bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
    						break;

    					case 32:
    						tgaGetImageData32bits( data, y_start, y_step, y_end, x_start, x_step, x_end, image );
    						break;

    					default:
    						console.error( 'THREE.TGALoader: Format not supported.' );
    						break;

    				}

    			}

    			// Load image data according to specific method
    			// let func = 'tgaGetImageData' + (use_grey ? 'Grey' : '') + (header.pixel_size) + 'bits';
    			// func(data, y_start, y_step, y_end, x_start, x_step, x_end, width, image, palette );
    			return data;

    		}

    		// TGA constants

    		const TGA_TYPE_NO_DATA = 0,
    			TGA_TYPE_INDEXED = 1,
    			TGA_TYPE_RGB = 2,
    			TGA_TYPE_GREY = 3,
    			TGA_TYPE_RLE_INDEXED = 9,
    			TGA_TYPE_RLE_RGB = 10,
    			TGA_TYPE_RLE_GREY = 11,

    			TGA_ORIGIN_MASK = 0x30,
    			TGA_ORIGIN_SHIFT = 0x04,
    			TGA_ORIGIN_BL = 0x00,
    			TGA_ORIGIN_BR = 0x01,
    			TGA_ORIGIN_UL = 0x02,
    			TGA_ORIGIN_UR = 0x03;

    		if ( buffer.length < 19 ) console.error( 'THREE.TGALoader: Not enough data to contain header.' );

    		let offset = 0;

    		const content = new Uint8Array( buffer ),
    			header = {
    				id_length: content[ offset ++ ],
    				colormap_type: content[ offset ++ ],
    				image_type: content[ offset ++ ],
    				colormap_index: content[ offset ++ ] | content[ offset ++ ] << 8,
    				colormap_length: content[ offset ++ ] | content[ offset ++ ] << 8,
    				colormap_size: content[ offset ++ ],
    				origin: [
    					content[ offset ++ ] | content[ offset ++ ] << 8,
    					content[ offset ++ ] | content[ offset ++ ] << 8
    				],
    				width: content[ offset ++ ] | content[ offset ++ ] << 8,
    				height: content[ offset ++ ] | content[ offset ++ ] << 8,
    				pixel_size: content[ offset ++ ],
    				flags: content[ offset ++ ]
    			};

    		// check tga if it is valid format

    		tgaCheckHeader( header );

    		if ( header.id_length + offset > buffer.length ) {

    			console.error( 'THREE.TGALoader: No data.' );

    		}

    		// skip the needn't data

    		offset += header.id_length;

    		// get targa information about RLE compression and palette

    		let use_rle = false,
    			use_pal = false,
    			use_grey = false;

    		switch ( header.image_type ) {

    			case TGA_TYPE_RLE_INDEXED:
    				use_rle = true;
    				use_pal = true;
    				break;

    			case TGA_TYPE_INDEXED:
    				use_pal = true;
    				break;

    			case TGA_TYPE_RLE_RGB:
    				use_rle = true;
    				break;

    			case TGA_TYPE_RGB:
    				break;

    			case TGA_TYPE_RLE_GREY:
    				use_rle = true;
    				use_grey = true;
    				break;

    			case TGA_TYPE_GREY:
    				use_grey = true;
    				break;

    		}

    		//

    		const imageData = new Uint8Array( header.width * header.height * 4 );
    		const result = tgaParse( use_rle, use_pal, header, offset, content );
    		getTgaRGBA( imageData, header.width, header.height, result.pixel_data, result.palettes );

    		return {

    			data: imageData,
    			width: header.width,
    			height: header.height,
    			flipY: true,
    			generateMipmaps: true,
    			minFilter: THREE.LinearMipmapLinearFilter,

    		};

    	}

    }

    class ColladaLoader extends THREE.Loader {

    	constructor( manager ) {

    		super( manager );

    	}

    	load( url, onLoad, onProgress, onError ) {

    		const scope = this;

    		const path = ( scope.path === '' ) ? THREE.LoaderUtils.extractUrlBase( url ) : scope.path;

    		const loader = new THREE.FileLoader( scope.manager );
    		loader.setPath( scope.path );
    		loader.setRequestHeader( scope.requestHeader );
    		loader.setWithCredentials( scope.withCredentials );
    		loader.load( url, function ( text ) {

    			try {

    				onLoad( scope.parse( text, path ) );

    			} catch ( e ) {

    				if ( onError ) {

    					onError( e );

    				} else {

    					console.error( e );

    				}

    				scope.manager.itemError( url );

    			}

    		}, onProgress, onError );

    	}

    	parse( text, path ) {

    		function getElementsByTagName( xml, name ) {

    			// Non recursive xml.getElementsByTagName() ...

    			const array = [];
    			const childNodes = xml.childNodes;

    			for ( let i = 0, l = childNodes.length; i < l; i ++ ) {

    				const child = childNodes[ i ];

    				if ( child.nodeName === name ) {

    					array.push( child );

    				}

    			}

    			return array;

    		}

    		function parseStrings( text ) {

    			if ( text.length === 0 ) return [];

    			const parts = text.trim().split( /\s+/ );
    			const array = new Array( parts.length );

    			for ( let i = 0, l = parts.length; i < l; i ++ ) {

    				array[ i ] = parts[ i ];

    			}

    			return array;

    		}

    		function parseFloats( text ) {

    			if ( text.length === 0 ) return [];

    			const parts = text.trim().split( /\s+/ );
    			const array = new Array( parts.length );

    			for ( let i = 0, l = parts.length; i < l; i ++ ) {

    				array[ i ] = parseFloat( parts[ i ] );

    			}

    			return array;

    		}

    		function parseInts( text ) {

    			if ( text.length === 0 ) return [];

    			const parts = text.trim().split( /\s+/ );
    			const array = new Array( parts.length );

    			for ( let i = 0, l = parts.length; i < l; i ++ ) {

    				array[ i ] = parseInt( parts[ i ] );

    			}

    			return array;

    		}

    		function parseId( text ) {

    			return text.substring( 1 );

    		}

    		function generateId() {

    			return 'three_default_' + ( count ++ );

    		}

    		function isEmpty( object ) {

    			return Object.keys( object ).length === 0;

    		}

    		// asset

    		function parseAsset( xml ) {

    			return {
    				unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
    				upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
    			};

    		}

    		function parseAssetUnit( xml ) {

    			if ( ( xml !== undefined ) && ( xml.hasAttribute( 'meter' ) === true ) ) {

    				return parseFloat( xml.getAttribute( 'meter' ) );

    			} else {

    				return 1; // default 1 meter

    			}

    		}

    		function parseAssetUpAxis( xml ) {

    			return xml !== undefined ? xml.textContent : 'Y_UP';

    		}

    		// library

    		function parseLibrary( xml, libraryName, nodeName, parser ) {

    			const library = getElementsByTagName( xml, libraryName )[ 0 ];

    			if ( library !== undefined ) {

    				const elements = getElementsByTagName( library, nodeName );

    				for ( let i = 0; i < elements.length; i ++ ) {

    					parser( elements[ i ] );

    				}

    			}

    		}

    		function buildLibrary( data, builder ) {

    			for ( const name in data ) {

    				const object = data[ name ];
    				object.build = builder( data[ name ] );

    			}

    		}

    		// get

    		function getBuild( data, builder ) {

    			if ( data.build !== undefined ) return data.build;

    			data.build = builder( data );

    			return data.build;

    		}

    		// animation

    		function parseAnimation( xml ) {

    			const data = {
    				sources: {},
    				samplers: {},
    				channels: {}
    			};

    			let hasChildren = false;

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				let id;

    				switch ( child.nodeName ) {

    					case 'source':
    						id = child.getAttribute( 'id' );
    						data.sources[ id ] = parseSource( child );
    						break;

    					case 'sampler':
    						id = child.getAttribute( 'id' );
    						data.samplers[ id ] = parseAnimationSampler( child );
    						break;

    					case 'channel':
    						id = child.getAttribute( 'target' );
    						data.channels[ id ] = parseAnimationChannel( child );
    						break;

    					case 'animation':
    						// hierarchy of related animations
    						parseAnimation( child );
    						hasChildren = true;
    						break;

    					default:
    						console.log( child );

    				}

    			}

    			if ( hasChildren === false ) {

    				// since 'id' attributes can be optional, it's necessary to generate a UUID for unqiue assignment

    				library.animations[ xml.getAttribute( 'id' ) || THREE.MathUtils.generateUUID() ] = data;

    			}

    		}

    		function parseAnimationSampler( xml ) {

    			const data = {
    				inputs: {},
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'input':
    						const id = parseId( child.getAttribute( 'source' ) );
    						const semantic = child.getAttribute( 'semantic' );
    						data.inputs[ semantic ] = id;
    						break;

    				}

    			}

    			return data;

    		}

    		function parseAnimationChannel( xml ) {

    			const data = {};

    			const target = xml.getAttribute( 'target' );

    			// parsing SID Addressing Syntax

    			let parts = target.split( '/' );

    			const id = parts.shift();
    			let sid = parts.shift();

    			// check selection syntax

    			const arraySyntax = ( sid.indexOf( '(' ) !== - 1 );
    			const memberSyntax = ( sid.indexOf( '.' ) !== - 1 );

    			if ( memberSyntax ) {

    				//  member selection access

    				parts = sid.split( '.' );
    				sid = parts.shift();
    				data.member = parts.shift();

    			} else if ( arraySyntax ) {

    				// array-access syntax. can be used to express fields in one-dimensional vectors or two-dimensional matrices.

    				const indices = sid.split( '(' );
    				sid = indices.shift();

    				for ( let i = 0; i < indices.length; i ++ ) {

    					indices[ i ] = parseInt( indices[ i ].replace( /\)/, '' ) );

    				}

    				data.indices = indices;

    			}

    			data.id = id;
    			data.sid = sid;

    			data.arraySyntax = arraySyntax;
    			data.memberSyntax = memberSyntax;

    			data.sampler = parseId( xml.getAttribute( 'source' ) );

    			return data;

    		}

    		function buildAnimation( data ) {

    			const tracks = [];

    			const channels = data.channels;
    			const samplers = data.samplers;
    			const sources = data.sources;

    			for ( const target in channels ) {

    				if ( channels.hasOwnProperty( target ) ) {

    					const channel = channels[ target ];
    					const sampler = samplers[ channel.sampler ];

    					const inputId = sampler.inputs.INPUT;
    					const outputId = sampler.inputs.OUTPUT;

    					const inputSource = sources[ inputId ];
    					const outputSource = sources[ outputId ];

    					const animation = buildAnimationChannel( channel, inputSource, outputSource );

    					createKeyframeTracks( animation, tracks );

    				}

    			}

    			return tracks;

    		}

    		function getAnimation( id ) {

    			return getBuild( library.animations[ id ], buildAnimation );

    		}

    		function buildAnimationChannel( channel, inputSource, outputSource ) {

    			const node = library.nodes[ channel.id ];
    			const object3D = getNode( node.id );

    			const transform = node.transforms[ channel.sid ];
    			const defaultMatrix = node.matrix.clone().transpose();

    			let time, stride;
    			let i, il, j, jl;

    			const data = {};

    			// the collada spec allows the animation of data in various ways.
    			// depending on the transform type (matrix, translate, rotate, scale), we execute different logic

    			switch ( transform ) {

    				case 'matrix':

    					for ( i = 0, il = inputSource.array.length; i < il; i ++ ) {

    						time = inputSource.array[ i ];
    						stride = i * outputSource.stride;

    						if ( data[ time ] === undefined ) data[ time ] = {};

    						if ( channel.arraySyntax === true ) {

    							const value = outputSource.array[ stride ];
    							const index = channel.indices[ 0 ] + 4 * channel.indices[ 1 ];

    							data[ time ][ index ] = value;

    						} else {

    							for ( j = 0, jl = outputSource.stride; j < jl; j ++ ) {

    								data[ time ][ j ] = outputSource.array[ stride + j ];

    							}

    						}

    					}

    					break;

    				case 'translate':
    					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
    					break;

    				case 'rotate':
    					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
    					break;

    				case 'scale':
    					console.warn( 'THREE.ColladaLoader: Animation transform type "%s" not yet implemented.', transform );
    					break;

    			}

    			const keyframes = prepareAnimationData( data, defaultMatrix );

    			const animation = {
    				name: object3D.uuid,
    				keyframes: keyframes
    			};

    			return animation;

    		}

    		function prepareAnimationData( data, defaultMatrix ) {

    			const keyframes = [];

    			// transfer data into a sortable array

    			for ( const time in data ) {

    				keyframes.push( { time: parseFloat( time ), value: data[ time ] } );

    			}

    			// ensure keyframes are sorted by time

    			keyframes.sort( ascending );

    			// now we clean up all animation data, so we can use them for keyframe tracks

    			for ( let i = 0; i < 16; i ++ ) {

    				transformAnimationData( keyframes, i, defaultMatrix.elements[ i ] );

    			}

    			return keyframes;

    			// array sort function

    			function ascending( a, b ) {

    				return a.time - b.time;

    			}

    		}

    		const position = new THREE.Vector3();
    		const scale = new THREE.Vector3();
    		const quaternion = new THREE.Quaternion();

    		function createKeyframeTracks( animation, tracks ) {

    			const keyframes = animation.keyframes;
    			const name = animation.name;

    			const times = [];
    			const positionData = [];
    			const quaternionData = [];
    			const scaleData = [];

    			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

    				const keyframe = keyframes[ i ];

    				const time = keyframe.time;
    				const value = keyframe.value;

    				matrix.fromArray( value ).transpose();
    				matrix.decompose( position, quaternion, scale );

    				times.push( time );
    				positionData.push( position.x, position.y, position.z );
    				quaternionData.push( quaternion.x, quaternion.y, quaternion.z, quaternion.w );
    				scaleData.push( scale.x, scale.y, scale.z );

    			}

    			if ( positionData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.position', times, positionData ) );
    			if ( quaternionData.length > 0 ) tracks.push( new THREE.QuaternionKeyframeTrack( name + '.quaternion', times, quaternionData ) );
    			if ( scaleData.length > 0 ) tracks.push( new THREE.VectorKeyframeTrack( name + '.scale', times, scaleData ) );

    			return tracks;

    		}

    		function transformAnimationData( keyframes, property, defaultValue ) {

    			let keyframe;

    			let empty = true;
    			let i, l;

    			// check, if values of a property are missing in our keyframes

    			for ( i = 0, l = keyframes.length; i < l; i ++ ) {

    				keyframe = keyframes[ i ];

    				if ( keyframe.value[ property ] === undefined ) {

    					keyframe.value[ property ] = null; // mark as missing

    				} else {

    					empty = false;

    				}

    			}

    			if ( empty === true ) {

    				// no values at all, so we set a default value

    				for ( i = 0, l = keyframes.length; i < l; i ++ ) {

    					keyframe = keyframes[ i ];

    					keyframe.value[ property ] = defaultValue;

    				}

    			} else {

    				// filling gaps

    				createMissingKeyframes( keyframes, property );

    			}

    		}

    		function createMissingKeyframes( keyframes, property ) {

    			let prev, next;

    			for ( let i = 0, l = keyframes.length; i < l; i ++ ) {

    				const keyframe = keyframes[ i ];

    				if ( keyframe.value[ property ] === null ) {

    					prev = getPrev( keyframes, i, property );
    					next = getNext( keyframes, i, property );

    					if ( prev === null ) {

    						keyframe.value[ property ] = next.value[ property ];
    						continue;

    					}

    					if ( next === null ) {

    						keyframe.value[ property ] = prev.value[ property ];
    						continue;

    					}

    					interpolate( keyframe, prev, next, property );

    				}

    			}

    		}

    		function getPrev( keyframes, i, property ) {

    			while ( i >= 0 ) {

    				const keyframe = keyframes[ i ];

    				if ( keyframe.value[ property ] !== null ) return keyframe;

    				i --;

    			}

    			return null;

    		}

    		function getNext( keyframes, i, property ) {

    			while ( i < keyframes.length ) {

    				const keyframe = keyframes[ i ];

    				if ( keyframe.value[ property ] !== null ) return keyframe;

    				i ++;

    			}

    			return null;

    		}

    		function interpolate( key, prev, next, property ) {

    			if ( ( next.time - prev.time ) === 0 ) {

    				key.value[ property ] = prev.value[ property ];
    				return;

    			}

    			key.value[ property ] = ( ( key.time - prev.time ) * ( next.value[ property ] - prev.value[ property ] ) / ( next.time - prev.time ) ) + prev.value[ property ];

    		}

    		// animation clips

    		function parseAnimationClip( xml ) {

    			const data = {
    				name: xml.getAttribute( 'id' ) || 'default',
    				start: parseFloat( xml.getAttribute( 'start' ) || 0 ),
    				end: parseFloat( xml.getAttribute( 'end' ) || 0 ),
    				animations: []
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'instance_animation':
    						data.animations.push( parseId( child.getAttribute( 'url' ) ) );
    						break;

    				}

    			}

    			library.clips[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function buildAnimationClip( data ) {

    			const tracks = [];

    			const name = data.name;
    			const duration = ( data.end - data.start ) || - 1;
    			const animations = data.animations;

    			for ( let i = 0, il = animations.length; i < il; i ++ ) {

    				const animationTracks = getAnimation( animations[ i ] );

    				for ( let j = 0, jl = animationTracks.length; j < jl; j ++ ) {

    					tracks.push( animationTracks[ j ] );

    				}

    			}

    			return new THREE.AnimationClip( name, duration, tracks );

    		}

    		function getAnimationClip( id ) {

    			return getBuild( library.clips[ id ], buildAnimationClip );

    		}

    		// controller

    		function parseController( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'skin':
    						// there is exactly one skin per controller
    						data.id = parseId( child.getAttribute( 'source' ) );
    						data.skin = parseSkin( child );
    						break;

    					case 'morph':
    						data.id = parseId( child.getAttribute( 'source' ) );
    						console.warn( 'THREE.ColladaLoader: Morph target animation not supported yet.' );
    						break;

    				}

    			}

    			library.controllers[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parseSkin( xml ) {

    			const data = {
    				sources: {}
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'bind_shape_matrix':
    						data.bindShapeMatrix = parseFloats( child.textContent );
    						break;

    					case 'source':
    						const id = child.getAttribute( 'id' );
    						data.sources[ id ] = parseSource( child );
    						break;

    					case 'joints':
    						data.joints = parseJoints( child );
    						break;

    					case 'vertex_weights':
    						data.vertexWeights = parseVertexWeights( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseJoints( xml ) {

    			const data = {
    				inputs: {}
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'input':
    						const semantic = child.getAttribute( 'semantic' );
    						const id = parseId( child.getAttribute( 'source' ) );
    						data.inputs[ semantic ] = id;
    						break;

    				}

    			}

    			return data;

    		}

    		function parseVertexWeights( xml ) {

    			const data = {
    				inputs: {}
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'input':
    						const semantic = child.getAttribute( 'semantic' );
    						const id = parseId( child.getAttribute( 'source' ) );
    						const offset = parseInt( child.getAttribute( 'offset' ) );
    						data.inputs[ semantic ] = { id: id, offset: offset };
    						break;

    					case 'vcount':
    						data.vcount = parseInts( child.textContent );
    						break;

    					case 'v':
    						data.v = parseInts( child.textContent );
    						break;

    				}

    			}

    			return data;

    		}

    		function buildController( data ) {

    			const build = {
    				id: data.id
    			};

    			const geometry = library.geometries[ build.id ];

    			if ( data.skin !== undefined ) {

    				build.skin = buildSkin( data.skin );

    				// we enhance the 'sources' property of the corresponding geometry with our skin data

    				geometry.sources.skinIndices = build.skin.indices;
    				geometry.sources.skinWeights = build.skin.weights;

    			}

    			return build;

    		}

    		function buildSkin( data ) {

    			const BONE_LIMIT = 4;

    			const build = {
    				joints: [], // this must be an array to preserve the joint order
    				indices: {
    					array: [],
    					stride: BONE_LIMIT
    				},
    				weights: {
    					array: [],
    					stride: BONE_LIMIT
    				}
    			};

    			const sources = data.sources;
    			const vertexWeights = data.vertexWeights;

    			const vcount = vertexWeights.vcount;
    			const v = vertexWeights.v;
    			const jointOffset = vertexWeights.inputs.JOINT.offset;
    			const weightOffset = vertexWeights.inputs.WEIGHT.offset;

    			const jointSource = data.sources[ data.joints.inputs.JOINT ];
    			const inverseSource = data.sources[ data.joints.inputs.INV_BIND_MATRIX ];

    			const weights = sources[ vertexWeights.inputs.WEIGHT.id ].array;
    			let stride = 0;

    			let i, j, l;

    			// procces skin data for each vertex

    			for ( i = 0, l = vcount.length; i < l; i ++ ) {

    				const jointCount = vcount[ i ]; // this is the amount of joints that affect a single vertex
    				const vertexSkinData = [];

    				for ( j = 0; j < jointCount; j ++ ) {

    					const skinIndex = v[ stride + jointOffset ];
    					const weightId = v[ stride + weightOffset ];
    					const skinWeight = weights[ weightId ];

    					vertexSkinData.push( { index: skinIndex, weight: skinWeight } );

    					stride += 2;

    				}

    				// we sort the joints in descending order based on the weights.
    				// this ensures, we only procced the most important joints of the vertex

    				vertexSkinData.sort( descending );

    				// now we provide for each vertex a set of four index and weight values.
    				// the order of the skin data matches the order of vertices

    				for ( j = 0; j < BONE_LIMIT; j ++ ) {

    					const d = vertexSkinData[ j ];

    					if ( d !== undefined ) {

    						build.indices.array.push( d.index );
    						build.weights.array.push( d.weight );

    					} else {

    						build.indices.array.push( 0 );
    						build.weights.array.push( 0 );

    					}

    				}

    			}

    			// setup bind matrix

    			if ( data.bindShapeMatrix ) {

    				build.bindMatrix = new THREE.Matrix4().fromArray( data.bindShapeMatrix ).transpose();

    			} else {

    				build.bindMatrix = new THREE.Matrix4().identity();

    			}

    			// process bones and inverse bind matrix data

    			for ( i = 0, l = jointSource.array.length; i < l; i ++ ) {

    				const name = jointSource.array[ i ];
    				const boneInverse = new THREE.Matrix4().fromArray( inverseSource.array, i * inverseSource.stride ).transpose();

    				build.joints.push( { name: name, boneInverse: boneInverse } );

    			}

    			return build;

    			// array sort function

    			function descending( a, b ) {

    				return b.weight - a.weight;

    			}

    		}

    		function getController( id ) {

    			return getBuild( library.controllers[ id ], buildController );

    		}

    		// image

    		function parseImage( xml ) {

    			const data = {
    				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
    			};

    			library.images[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function buildImage( data ) {

    			if ( data.build !== undefined ) return data.build;

    			return data.init_from;

    		}

    		function getImage( id ) {

    			const data = library.images[ id ];

    			if ( data !== undefined ) {

    				return getBuild( data, buildImage );

    			}

    			console.warn( 'THREE.ColladaLoader: Couldn\'t find image with ID:', id );

    			return null;

    		}

    		// effect

    		function parseEffect( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'profile_COMMON':
    						data.profile = parseEffectProfileCOMMON( child );
    						break;

    				}

    			}

    			library.effects[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parseEffectProfileCOMMON( xml ) {

    			const data = {
    				surfaces: {},
    				samplers: {}
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'newparam':
    						parseEffectNewparam( child, data );
    						break;

    					case 'technique':
    						data.technique = parseEffectTechnique( child );
    						break;

    					case 'extra':
    						data.extra = parseEffectExtra( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectNewparam( xml, data ) {

    			const sid = xml.getAttribute( 'sid' );

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'surface':
    						data.surfaces[ sid ] = parseEffectSurface( child );
    						break;

    					case 'sampler2D':
    						data.samplers[ sid ] = parseEffectSampler( child );
    						break;

    				}

    			}

    		}

    		function parseEffectSurface( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'init_from':
    						data.init_from = child.textContent;
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectSampler( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'source':
    						data.source = child.textContent;
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectTechnique( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'constant':
    					case 'lambert':
    					case 'blinn':
    					case 'phong':
    						data.type = child.nodeName;
    						data.parameters = parseEffectParameters( child );
    						break;

    					case 'extra':
    						data.extra = parseEffectExtra( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectParameters( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'emission':
    					case 'diffuse':
    					case 'specular':
    					case 'bump':
    					case 'ambient':
    					case 'shininess':
    					case 'transparency':
    						data[ child.nodeName ] = parseEffectParameter( child );
    						break;
    					case 'transparent':
    						data[ child.nodeName ] = {
    							opaque: child.hasAttribute( 'opaque' ) ? child.getAttribute( 'opaque' ) : 'A_ONE',
    							data: parseEffectParameter( child )
    						};
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectParameter( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'color':
    						data[ child.nodeName ] = parseFloats( child.textContent );
    						break;

    					case 'float':
    						data[ child.nodeName ] = parseFloat( child.textContent );
    						break;

    					case 'texture':
    						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectParameterTexture( xml ) {

    			const data = {
    				technique: {}
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'extra':
    						parseEffectParameterTextureExtra( child, data );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectParameterTextureExtra( xml, data ) {

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'technique':
    						parseEffectParameterTextureExtraTechnique( child, data );
    						break;

    				}

    			}

    		}

    		function parseEffectParameterTextureExtraTechnique( xml, data ) {

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'repeatU':
    					case 'repeatV':
    					case 'offsetU':
    					case 'offsetV':
    						data.technique[ child.nodeName ] = parseFloat( child.textContent );
    						break;

    					case 'wrapU':
    					case 'wrapV':

    						// some files have values for wrapU/wrapV which become NaN via parseInt

    						if ( child.textContent.toUpperCase() === 'TRUE' ) {

    							data.technique[ child.nodeName ] = 1;

    						} else if ( child.textContent.toUpperCase() === 'FALSE' ) {

    							data.technique[ child.nodeName ] = 0;

    						} else {

    							data.technique[ child.nodeName ] = parseInt( child.textContent );

    						}

    						break;

    					case 'bump':
    						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
    						break;

    				}

    			}

    		}

    		function parseEffectExtra( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'technique':
    						data.technique = parseEffectExtraTechnique( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectExtraTechnique( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'double_sided':
    						data[ child.nodeName ] = parseInt( child.textContent );
    						break;

    					case 'bump':
    						data[ child.nodeName ] = parseEffectExtraTechniqueBump( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseEffectExtraTechniqueBump( xml ) {

    			var data = {};

    			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				var child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'texture':
    						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), texcoord: child.getAttribute( 'texcoord' ), extra: parseEffectParameterTexture( child ) };
    						break;

    				}

    			}

    			return data;

    		}

    		function buildEffect( data ) {

    			return data;

    		}

    		function getEffect( id ) {

    			return getBuild( library.effects[ id ], buildEffect );

    		}

    		// material

    		function parseMaterial( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' )
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'instance_effect':
    						data.url = parseId( child.getAttribute( 'url' ) );
    						break;

    				}

    			}

    			library.materials[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function getTextureLoader( image ) {

    			let loader;

    			let extension = image.slice( ( image.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 ); // http://www.jstips.co/en/javascript/get-file-extension/
    			extension = extension.toLowerCase();

    			switch ( extension ) {

    				case 'tga':
    					loader = tgaLoader;
    					break;

    				default:
    					loader = textureLoader;

    			}

    			return loader;

    		}

    		function buildMaterial( data ) {

    			const effect = getEffect( data.url );
    			const technique = effect.profile.technique;

    			let material;

    			switch ( technique.type ) {

    				case 'phong':
    				case 'blinn':
    					material = new THREE.MeshPhongMaterial();
    					break;

    				case 'lambert':
    					material = new THREE.MeshLambertMaterial();
    					break;

    				default:
    					material = new THREE.MeshBasicMaterial();
    					break;

    			}

    			material.name = data.name || '';

    			function getTexture( textureObject ) {

    				const sampler = effect.profile.samplers[ textureObject.id ];
    				let image = null;

    				// get image

    				if ( sampler !== undefined ) {

    					const surface = effect.profile.surfaces[ sampler.source ];
    					image = getImage( surface.init_from );

    				} else {

    					console.warn( 'THREE.ColladaLoader: Undefined sampler. Access image directly (see #12530).' );
    					image = getImage( textureObject.id );

    				}

    				// create texture if image is avaiable

    				if ( image !== null ) {

    					const loader = getTextureLoader( image );

    					if ( loader !== undefined ) {

    						const texture = loader.load( image );

    						const extra = textureObject.extra;

    						if ( extra !== undefined && extra.technique !== undefined && isEmpty( extra.technique ) === false ) {

    							const technique = extra.technique;

    							texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    							texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

    							texture.offset.set( technique.offsetU || 0, technique.offsetV || 0 );
    							texture.repeat.set( technique.repeatU || 1, technique.repeatV || 1 );

    						} else {

    							texture.wrapS = THREE.RepeatWrapping;
    							texture.wrapT = THREE.RepeatWrapping;

    						}

    						return texture;

    					} else {

    						console.warn( 'THREE.ColladaLoader: Loader for texture %s not found.', image );

    						return null;

    					}

    				} else {

    					console.warn( 'THREE.ColladaLoader: Couldn\'t create texture with ID:', textureObject.id );

    					return null;

    				}

    			}

    			const parameters = technique.parameters;

    			for ( const key in parameters ) {

    				const parameter = parameters[ key ];

    				switch ( key ) {

    					case 'diffuse':
    						if ( parameter.color ) material.color.fromArray( parameter.color );
    						if ( parameter.texture ) material.map = getTexture( parameter.texture );
    						break;
    					case 'specular':
    						if ( parameter.color && material.specular ) material.specular.fromArray( parameter.color );
    						if ( parameter.texture ) material.specularMap = getTexture( parameter.texture );
    						break;
    					case 'bump':
    						if ( parameter.texture ) material.normalMap = getTexture( parameter.texture );
    						break;
    					case 'ambient':
    						if ( parameter.texture ) material.lightMap = getTexture( parameter.texture );
    						break;
    					case 'shininess':
    						if ( parameter.float && material.shininess ) material.shininess = parameter.float;
    						break;
    					case 'emission':
    						if ( parameter.color && material.emissive ) material.emissive.fromArray( parameter.color );
    						if ( parameter.texture ) material.emissiveMap = getTexture( parameter.texture );
    						break;

    				}

    			}

    			//

    			let transparent = parameters[ 'transparent' ];
    			let transparency = parameters[ 'transparency' ];

    			// <transparency> does not exist but <transparent>

    			if ( transparency === undefined && transparent ) {

    				transparency = {
    					float: 1
    				};

    			}

    			// <transparent> does not exist but <transparency>

    			if ( transparent === undefined && transparency ) {

    				transparent = {
    					opaque: 'A_ONE',
    					data: {
    						color: [ 1, 1, 1, 1 ]
    					} };

    			}

    			if ( transparent && transparency ) {

    				// handle case if a texture exists but no color

    				if ( transparent.data.texture ) {

    					// we do not set an alpha map (see #13792)

    					material.transparent = true;

    				} else {

    					const color = transparent.data.color;

    					switch ( transparent.opaque ) {

    						case 'A_ONE':
    							material.opacity = color[ 3 ] * transparency.float;
    							break;
    						case 'RGB_ZERO':
    							material.opacity = 1 - ( color[ 0 ] * transparency.float );
    							break;
    						case 'A_ZERO':
    							material.opacity = 1 - ( color[ 3 ] * transparency.float );
    							break;
    						case 'RGB_ONE':
    							material.opacity = color[ 0 ] * transparency.float;
    							break;
    						default:
    							console.warn( 'THREE.ColladaLoader: Invalid opaque type "%s" of transparent tag.', transparent.opaque );

    					}

    					if ( material.opacity < 1 ) material.transparent = true;

    				}

    			}

    			//


    			if ( technique.extra !== undefined && technique.extra.technique !== undefined ) {

    				const techniques = technique.extra.technique;

    				for ( const k in techniques ) {

    					const v = techniques[ k ];

    					switch ( k ) {

    						case 'double_sided':
    							material.side = ( v === 1 ? THREE.DoubleSide : THREE.FrontSide );
    							break;

    						case 'bump':
    							material.normalMap = getTexture( v.texture );
    							material.normalScale = new THREE.Vector2( 1, 1 );
    							break;

    					}

    				}

    			}

    			return material;

    		}

    		function getMaterial( id ) {

    			return getBuild( library.materials[ id ], buildMaterial );

    		}

    		// camera

    		function parseCamera( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' )
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'optics':
    						data.optics = parseCameraOptics( child );
    						break;

    				}

    			}

    			library.cameras[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parseCameraOptics( xml ) {

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				switch ( child.nodeName ) {

    					case 'technique_common':
    						return parseCameraTechnique( child );

    				}

    			}

    			return {};

    		}

    		function parseCameraTechnique( xml ) {

    			const data = {};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				switch ( child.nodeName ) {

    					case 'perspective':
    					case 'orthographic':

    						data.technique = child.nodeName;
    						data.parameters = parseCameraParameters( child );

    						break;

    				}

    			}

    			return data;

    		}

    		function parseCameraParameters( xml ) {

    			const data = {};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				switch ( child.nodeName ) {

    					case 'xfov':
    					case 'yfov':
    					case 'xmag':
    					case 'ymag':
    					case 'znear':
    					case 'zfar':
    					case 'aspect_ratio':
    						data[ child.nodeName ] = parseFloat( child.textContent );
    						break;

    				}

    			}

    			return data;

    		}

    		function buildCamera( data ) {

    			let camera;

    			switch ( data.optics.technique ) {

    				case 'perspective':
    					camera = new THREE.PerspectiveCamera(
    						data.optics.parameters.yfov,
    						data.optics.parameters.aspect_ratio,
    						data.optics.parameters.znear,
    						data.optics.parameters.zfar
    					);
    					break;

    				case 'orthographic':
    					let ymag = data.optics.parameters.ymag;
    					let xmag = data.optics.parameters.xmag;
    					const aspectRatio = data.optics.parameters.aspect_ratio;

    					xmag = ( xmag === undefined ) ? ( ymag * aspectRatio ) : xmag;
    					ymag = ( ymag === undefined ) ? ( xmag / aspectRatio ) : ymag;

    					xmag *= 0.5;
    					ymag *= 0.5;

    					camera = new THREE.OrthographicCamera(
    						- xmag, xmag, ymag, - ymag, // left, right, top, bottom
    						data.optics.parameters.znear,
    						data.optics.parameters.zfar
    					);
    					break;

    				default:
    					camera = new THREE.PerspectiveCamera();
    					break;

    			}

    			camera.name = data.name || '';

    			return camera;

    		}

    		function getCamera( id ) {

    			const data = library.cameras[ id ];

    			if ( data !== undefined ) {

    				return getBuild( data, buildCamera );

    			}

    			console.warn( 'THREE.ColladaLoader: Couldn\'t find camera with ID:', id );

    			return null;

    		}

    		// light

    		function parseLight( xml ) {

    			let data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'technique_common':
    						data = parseLightTechnique( child );
    						break;

    				}

    			}

    			library.lights[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parseLightTechnique( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'directional':
    					case 'point':
    					case 'spot':
    					case 'ambient':

    						data.technique = child.nodeName;
    						data.parameters = parseLightParameters( child );

    				}

    			}

    			return data;

    		}

    		function parseLightParameters( xml ) {

    			const data = {};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'color':
    						const array = parseFloats( child.textContent );
    						data.color = new THREE.Color().fromArray( array );
    						break;

    					case 'falloff_angle':
    						data.falloffAngle = parseFloat( child.textContent );
    						break;

    					case 'quadratic_attenuation':
    						const f = parseFloat( child.textContent );
    						data.distance = f ? Math.sqrt( 1 / f ) : 0;
    						break;

    				}

    			}

    			return data;

    		}

    		function buildLight( data ) {

    			let light;

    			switch ( data.technique ) {

    				case 'directional':
    					light = new THREE.DirectionalLight();
    					break;

    				case 'point':
    					light = new THREE.PointLight();
    					break;

    				case 'spot':
    					light = new THREE.SpotLight();
    					break;

    				case 'ambient':
    					light = new THREE.AmbientLight();
    					break;

    			}

    			if ( data.parameters.color ) light.color.copy( data.parameters.color );
    			if ( data.parameters.distance ) light.distance = data.parameters.distance;

    			return light;

    		}

    		function getLight( id ) {

    			const data = library.lights[ id ];

    			if ( data !== undefined ) {

    				return getBuild( data, buildLight );

    			}

    			console.warn( 'THREE.ColladaLoader: Couldn\'t find light with ID:', id );

    			return null;

    		}

    		// geometry

    		function parseGeometry( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' ),
    				sources: {},
    				vertices: {},
    				primitives: []
    			};

    			const mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

    			// the following tags inside geometry are not supported yet (see https://github.com/mrdoob/three.js/pull/12606): convex_mesh, spline, brep
    			if ( mesh === undefined ) return;

    			for ( let i = 0; i < mesh.childNodes.length; i ++ ) {

    				const child = mesh.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				const id = child.getAttribute( 'id' );

    				switch ( child.nodeName ) {

    					case 'source':
    						data.sources[ id ] = parseSource( child );
    						break;

    					case 'vertices':
    						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
    						data.vertices = parseGeometryVertices( child );
    						break;

    					case 'polygons':
    						console.warn( 'THREE.ColladaLoader: Unsupported primitive type: ', child.nodeName );
    						break;

    					case 'lines':
    					case 'linestrips':
    					case 'polylist':
    					case 'triangles':
    						data.primitives.push( parseGeometryPrimitive( child ) );
    						break;

    					default:
    						console.log( child );

    				}

    			}

    			library.geometries[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parseSource( xml ) {

    			const data = {
    				array: [],
    				stride: 3
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'float_array':
    						data.array = parseFloats( child.textContent );
    						break;

    					case 'Name_array':
    						data.array = parseStrings( child.textContent );
    						break;

    					case 'technique_common':
    						const accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

    						if ( accessor !== undefined ) {

    							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

    						}

    						break;

    				}

    			}

    			return data;

    		}

    		function parseGeometryVertices( xml ) {

    			const data = {};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

    			}

    			return data;

    		}

    		function parseGeometryPrimitive( xml ) {

    			const primitive = {
    				type: xml.nodeName,
    				material: xml.getAttribute( 'material' ),
    				count: parseInt( xml.getAttribute( 'count' ) ),
    				inputs: {},
    				stride: 0,
    				hasUV: false
    			};

    			for ( let i = 0, l = xml.childNodes.length; i < l; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'input':
    						const id = parseId( child.getAttribute( 'source' ) );
    						const semantic = child.getAttribute( 'semantic' );
    						const offset = parseInt( child.getAttribute( 'offset' ) );
    						const set = parseInt( child.getAttribute( 'set' ) );
    						const inputname = ( set > 0 ? semantic + set : semantic );
    						primitive.inputs[ inputname ] = { id: id, offset: offset };
    						primitive.stride = Math.max( primitive.stride, offset + 1 );
    						if ( semantic === 'TEXCOORD' ) primitive.hasUV = true;
    						break;

    					case 'vcount':
    						primitive.vcount = parseInts( child.textContent );
    						break;

    					case 'p':
    						primitive.p = parseInts( child.textContent );
    						break;

    				}

    			}

    			return primitive;

    		}

    		function groupPrimitives( primitives ) {

    			const build = {};

    			for ( let i = 0; i < primitives.length; i ++ ) {

    				const primitive = primitives[ i ];

    				if ( build[ primitive.type ] === undefined ) build[ primitive.type ] = [];

    				build[ primitive.type ].push( primitive );

    			}

    			return build;

    		}

    		function checkUVCoordinates( primitives ) {

    			let count = 0;

    			for ( let i = 0, l = primitives.length; i < l; i ++ ) {

    				const primitive = primitives[ i ];

    				if ( primitive.hasUV === true ) {

    					count ++;

    				}

    			}

    			if ( count > 0 && count < primitives.length ) {

    				primitives.uvsNeedsFix = true;

    			}

    		}

    		function buildGeometry( data ) {

    			const build = {};

    			const sources = data.sources;
    			const vertices = data.vertices;
    			const primitives = data.primitives;

    			if ( primitives.length === 0 ) return {};

    			// our goal is to create one buffer geometry for a single type of primitives
    			// first, we group all primitives by their type

    			const groupedPrimitives = groupPrimitives( primitives );

    			for ( const type in groupedPrimitives ) {

    				const primitiveType = groupedPrimitives[ type ];

    				// second, ensure consistent uv coordinates for each type of primitives (polylist,triangles or lines)

    				checkUVCoordinates( primitiveType );

    				// third, create a buffer geometry for each type of primitives

    				build[ type ] = buildGeometryType( primitiveType, sources, vertices );

    			}

    			return build;

    		}

    		function buildGeometryType( primitives, sources, vertices ) {

    			const build = {};

    			const position = { array: [], stride: 0 };
    			const normal = { array: [], stride: 0 };
    			const uv = { array: [], stride: 0 };
    			const uv2 = { array: [], stride: 0 };
    			const color = { array: [], stride: 0 };

    			const skinIndex = { array: [], stride: 4 };
    			const skinWeight = { array: [], stride: 4 };

    			const geometry = new THREE.BufferGeometry();

    			const materialKeys = [];

    			let start = 0;

    			for ( let p = 0; p < primitives.length; p ++ ) {

    				const primitive = primitives[ p ];
    				const inputs = primitive.inputs;

    				// groups

    				let count = 0;

    				switch ( primitive.type ) {

    					case 'lines':
    					case 'linestrips':
    						count = primitive.count * 2;
    						break;

    					case 'triangles':
    						count = primitive.count * 3;
    						break;

    					case 'polylist':

    						for ( let g = 0; g < primitive.count; g ++ ) {

    							const vc = primitive.vcount[ g ];

    							switch ( vc ) {

    								case 3:
    									count += 3; // single triangle
    									break;

    								case 4:
    									count += 6; // quad, subdivided into two triangles
    									break;

    								default:
    									count += ( vc - 2 ) * 3; // polylist with more than four vertices
    									break;

    							}

    						}

    						break;

    					default:
    						console.warn( 'THREE.ColladaLoader: Unknow primitive type:', primitive.type );

    				}

    				geometry.addGroup( start, count, p );
    				start += count;

    				// material

    				if ( primitive.material ) {

    					materialKeys.push( primitive.material );

    				}

    				// geometry data

    				for ( const name in inputs ) {

    					const input = inputs[ name ];

    					switch ( name )	{

    						case 'VERTEX':
    							for ( const key in vertices ) {

    								const id = vertices[ key ];

    								switch ( key ) {

    									case 'POSITION':
    										const prevLength = position.array.length;
    										buildGeometryData( primitive, sources[ id ], input.offset, position.array );
    										position.stride = sources[ id ].stride;

    										if ( sources.skinWeights && sources.skinIndices ) {

    											buildGeometryData( primitive, sources.skinIndices, input.offset, skinIndex.array );
    											buildGeometryData( primitive, sources.skinWeights, input.offset, skinWeight.array );

    										}

    										// see #3803

    										if ( primitive.hasUV === false && primitives.uvsNeedsFix === true ) {

    											const count = ( position.array.length - prevLength ) / position.stride;

    											for ( let i = 0; i < count; i ++ ) {

    												// fill missing uv coordinates

    												uv.array.push( 0, 0 );

    											}

    										}

    										break;

    									case 'NORMAL':
    										buildGeometryData( primitive, sources[ id ], input.offset, normal.array );
    										normal.stride = sources[ id ].stride;
    										break;

    									case 'COLOR':
    										buildGeometryData( primitive, sources[ id ], input.offset, color.array );
    										color.stride = sources[ id ].stride;
    										break;

    									case 'TEXCOORD':
    										buildGeometryData( primitive, sources[ id ], input.offset, uv.array );
    										uv.stride = sources[ id ].stride;
    										break;

    									case 'TEXCOORD1':
    										buildGeometryData( primitive, sources[ id ], input.offset, uv2.array );
    										uv.stride = sources[ id ].stride;
    										break;

    									default:
    										console.warn( 'THREE.ColladaLoader: Semantic "%s" not handled in geometry build process.', key );

    								}

    							}

    							break;

    						case 'NORMAL':
    							buildGeometryData( primitive, sources[ input.id ], input.offset, normal.array );
    							normal.stride = sources[ input.id ].stride;
    							break;

    						case 'COLOR':
    							buildGeometryData( primitive, sources[ input.id ], input.offset, color.array );
    							color.stride = sources[ input.id ].stride;
    							break;

    						case 'TEXCOORD':
    							buildGeometryData( primitive, sources[ input.id ], input.offset, uv.array );
    							uv.stride = sources[ input.id ].stride;
    							break;

    						case 'TEXCOORD1':
    							buildGeometryData( primitive, sources[ input.id ], input.offset, uv2.array );
    							uv2.stride = sources[ input.id ].stride;
    							break;

    					}

    				}

    			}

    			// build geometry

    			if ( position.array.length > 0 ) geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position.array, position.stride ) );
    			if ( normal.array.length > 0 ) geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normal.array, normal.stride ) );
    			if ( color.array.length > 0 ) geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( color.array, color.stride ) );
    			if ( uv.array.length > 0 ) geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv.array, uv.stride ) );
    			if ( uv2.array.length > 0 ) geometry.setAttribute( 'uv2', new THREE.Float32BufferAttribute( uv2.array, uv2.stride ) );

    			if ( skinIndex.array.length > 0 ) geometry.setAttribute( 'skinIndex', new THREE.Float32BufferAttribute( skinIndex.array, skinIndex.stride ) );
    			if ( skinWeight.array.length > 0 ) geometry.setAttribute( 'skinWeight', new THREE.Float32BufferAttribute( skinWeight.array, skinWeight.stride ) );

    			build.data = geometry;
    			build.type = primitives[ 0 ].type;
    			build.materialKeys = materialKeys;

    			return build;

    		}

    		function buildGeometryData( primitive, source, offset, array ) {

    			const indices = primitive.p;
    			const stride = primitive.stride;
    			const vcount = primitive.vcount;

    			function pushVector( i ) {

    				let index = indices[ i + offset ] * sourceStride;
    				const length = index + sourceStride;

    				for ( ; index < length; index ++ ) {

    					array.push( sourceArray[ index ] );

    				}

    			}

    			const sourceArray = source.array;
    			const sourceStride = source.stride;

    			if ( primitive.vcount !== undefined ) {

    				let index = 0;

    				for ( let i = 0, l = vcount.length; i < l; i ++ ) {

    					const count = vcount[ i ];

    					if ( count === 4 ) {

    						const a = index + stride * 0;
    						const b = index + stride * 1;
    						const c = index + stride * 2;
    						const d = index + stride * 3;

    						pushVector( a ); pushVector( b ); pushVector( d );
    						pushVector( b ); pushVector( c ); pushVector( d );

    					} else if ( count === 3 ) {

    						const a = index + stride * 0;
    						const b = index + stride * 1;
    						const c = index + stride * 2;

    						pushVector( a ); pushVector( b ); pushVector( c );

    					} else if ( count > 4 ) {

    						for ( let k = 1, kl = ( count - 2 ); k <= kl; k ++ ) {

    							const a = index + stride * 0;
    							const b = index + stride * k;
    							const c = index + stride * ( k + 1 );

    							pushVector( a ); pushVector( b ); pushVector( c );

    						}

    					}

    					index += stride * count;

    				}

    			} else {

    				for ( let i = 0, l = indices.length; i < l; i += stride ) {

    					pushVector( i );

    				}

    			}

    		}

    		function getGeometry( id ) {

    			return getBuild( library.geometries[ id ], buildGeometry );

    		}

    		// kinematics

    		function parseKinematicsModel( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' ) || '',
    				joints: {},
    				links: []
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'technique_common':
    						parseKinematicsTechniqueCommon( child, data );
    						break;

    				}

    			}

    			library.kinematicsModels[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function buildKinematicsModel( data ) {

    			if ( data.build !== undefined ) return data.build;

    			return data;

    		}

    		function getKinematicsModel( id ) {

    			return getBuild( library.kinematicsModels[ id ], buildKinematicsModel );

    		}

    		function parseKinematicsTechniqueCommon( xml, data ) {

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'joint':
    						data.joints[ child.getAttribute( 'sid' ) ] = parseKinematicsJoint( child );
    						break;

    					case 'link':
    						data.links.push( parseKinematicsLink( child ) );
    						break;

    				}

    			}

    		}

    		function parseKinematicsJoint( xml ) {

    			let data;

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'prismatic':
    					case 'revolute':
    						data = parseKinematicsJointParameter( child );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseKinematicsJointParameter( xml ) {

    			const data = {
    				sid: xml.getAttribute( 'sid' ),
    				name: xml.getAttribute( 'name' ) || '',
    				axis: new THREE.Vector3(),
    				limits: {
    					min: 0,
    					max: 0
    				},
    				type: xml.nodeName,
    				static: false,
    				zeroPosition: 0,
    				middlePosition: 0
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'axis':
    						const array = parseFloats( child.textContent );
    						data.axis.fromArray( array );
    						break;
    					case 'limits':
    						const max = child.getElementsByTagName( 'max' )[ 0 ];
    						const min = child.getElementsByTagName( 'min' )[ 0 ];

    						data.limits.max = parseFloat( max.textContent );
    						data.limits.min = parseFloat( min.textContent );
    						break;

    				}

    			}

    			// if min is equal to or greater than max, consider the joint static

    			if ( data.limits.min >= data.limits.max ) {

    				data.static = true;

    			}

    			// calculate middle position

    			data.middlePosition = ( data.limits.min + data.limits.max ) / 2.0;

    			return data;

    		}

    		function parseKinematicsLink( xml ) {

    			const data = {
    				sid: xml.getAttribute( 'sid' ),
    				name: xml.getAttribute( 'name' ) || '',
    				attachments: [],
    				transforms: []
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'attachment_full':
    						data.attachments.push( parseKinematicsAttachment( child ) );
    						break;

    					case 'matrix':
    					case 'translate':
    					case 'rotate':
    						data.transforms.push( parseKinematicsTransform( child ) );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseKinematicsAttachment( xml ) {

    			const data = {
    				joint: xml.getAttribute( 'joint' ).split( '/' ).pop(),
    				transforms: [],
    				links: []
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'link':
    						data.links.push( parseKinematicsLink( child ) );
    						break;

    					case 'matrix':
    					case 'translate':
    					case 'rotate':
    						data.transforms.push( parseKinematicsTransform( child ) );
    						break;

    				}

    			}

    			return data;

    		}

    		function parseKinematicsTransform( xml ) {

    			const data = {
    				type: xml.nodeName
    			};

    			const array = parseFloats( xml.textContent );

    			switch ( data.type ) {

    				case 'matrix':
    					data.obj = new THREE.Matrix4();
    					data.obj.fromArray( array ).transpose();
    					break;

    				case 'translate':
    					data.obj = new THREE.Vector3();
    					data.obj.fromArray( array );
    					break;

    				case 'rotate':
    					data.obj = new THREE.Vector3();
    					data.obj.fromArray( array );
    					data.angle = THREE.MathUtils.degToRad( array[ 3 ] );
    					break;

    			}

    			return data;

    		}

    		// physics

    		function parsePhysicsModel( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' ) || '',
    				rigidBodies: {}
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'rigid_body':
    						data.rigidBodies[ child.getAttribute( 'name' ) ] = {};
    						parsePhysicsRigidBody( child, data.rigidBodies[ child.getAttribute( 'name' ) ] );
    						break;

    				}

    			}

    			library.physicsModels[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function parsePhysicsRigidBody( xml, data ) {

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'technique_common':
    						parsePhysicsTechniqueCommon( child, data );
    						break;

    				}

    			}

    		}

    		function parsePhysicsTechniqueCommon( xml, data ) {

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'inertia':
    						data.inertia = parseFloats( child.textContent );
    						break;

    					case 'mass':
    						data.mass = parseFloats( child.textContent )[ 0 ];
    						break;

    				}

    			}

    		}

    		// scene

    		function parseKinematicsScene( xml ) {

    			const data = {
    				bindJointAxis: []
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'bind_joint_axis':
    						data.bindJointAxis.push( parseKinematicsBindJointAxis( child ) );
    						break;

    				}

    			}

    			library.kinematicsScenes[ parseId( xml.getAttribute( 'url' ) ) ] = data;

    		}

    		function parseKinematicsBindJointAxis( xml ) {

    			const data = {
    				target: xml.getAttribute( 'target' ).split( '/' ).pop()
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				switch ( child.nodeName ) {

    					case 'axis':
    						const param = child.getElementsByTagName( 'param' )[ 0 ];
    						data.axis = param.textContent;
    						const tmpJointIndex = data.axis.split( 'inst_' ).pop().split( 'axis' )[ 0 ];
    						data.jointIndex = tmpJointIndex.substr( 0, tmpJointIndex.length - 1 );
    						break;

    				}

    			}

    			return data;

    		}

    		function buildKinematicsScene( data ) {

    			if ( data.build !== undefined ) return data.build;

    			return data;

    		}

    		function getKinematicsScene( id ) {

    			return getBuild( library.kinematicsScenes[ id ], buildKinematicsScene );

    		}

    		function setupKinematics() {

    			const kinematicsModelId = Object.keys( library.kinematicsModels )[ 0 ];
    			const kinematicsSceneId = Object.keys( library.kinematicsScenes )[ 0 ];
    			const visualSceneId = Object.keys( library.visualScenes )[ 0 ];

    			if ( kinematicsModelId === undefined || kinematicsSceneId === undefined ) return;

    			const kinematicsModel = getKinematicsModel( kinematicsModelId );
    			const kinematicsScene = getKinematicsScene( kinematicsSceneId );
    			const visualScene = getVisualScene( visualSceneId );

    			const bindJointAxis = kinematicsScene.bindJointAxis;
    			const jointMap = {};

    			for ( let i = 0, l = bindJointAxis.length; i < l; i ++ ) {

    				const axis = bindJointAxis[ i ];

    				// the result of the following query is an element of type 'translate', 'rotate','scale' or 'matrix'

    				const targetElement = collada.querySelector( '[sid="' + axis.target + '"]' );

    				if ( targetElement ) {

    					// get the parent of the transform element

    					const parentVisualElement = targetElement.parentElement;

    					// connect the joint of the kinematics model with the element in the visual scene

    					connect( axis.jointIndex, parentVisualElement );

    				}

    			}

    			function connect( jointIndex, visualElement ) {

    				const visualElementName = visualElement.getAttribute( 'name' );
    				const joint = kinematicsModel.joints[ jointIndex ];

    				visualScene.traverse( function ( object ) {

    					if ( object.name === visualElementName ) {

    						jointMap[ jointIndex ] = {
    							object: object,
    							transforms: buildTransformList( visualElement ),
    							joint: joint,
    							position: joint.zeroPosition
    						};

    					}

    				} );

    			}

    			const m0 = new THREE.Matrix4();

    			kinematics = {

    				joints: kinematicsModel && kinematicsModel.joints,

    				getJointValue: function ( jointIndex ) {

    					const jointData = jointMap[ jointIndex ];

    					if ( jointData ) {

    						return jointData.position;

    					} else {

    						console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' doesn\'t exist.' );

    					}

    				},

    				setJointValue: function ( jointIndex, value ) {

    					const jointData = jointMap[ jointIndex ];

    					if ( jointData ) {

    						const joint = jointData.joint;

    						if ( value > joint.limits.max || value < joint.limits.min ) {

    							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' value ' + value + ' outside of limits (min: ' + joint.limits.min + ', max: ' + joint.limits.max + ').' );

    						} else if ( joint.static ) {

    							console.warn( 'THREE.ColladaLoader: Joint ' + jointIndex + ' is static.' );

    						} else {

    							const object = jointData.object;
    							const axis = joint.axis;
    							const transforms = jointData.transforms;

    							matrix.identity();

    							// each update, we have to apply all transforms in the correct order

    							for ( let i = 0; i < transforms.length; i ++ ) {

    								const transform = transforms[ i ];

    								// if there is a connection of the transform node with a joint, apply the joint value

    								if ( transform.sid && transform.sid.indexOf( jointIndex ) !== - 1 ) {

    									switch ( joint.type ) {

    										case 'revolute':
    											matrix.multiply( m0.makeRotationAxis( axis, THREE.MathUtils.degToRad( value ) ) );
    											break;

    										case 'prismatic':
    											matrix.multiply( m0.makeTranslation( axis.x * value, axis.y * value, axis.z * value ) );
    											break;

    										default:
    											console.warn( 'THREE.ColladaLoader: Unknown joint type: ' + joint.type );
    											break;

    									}

    								} else {

    									switch ( transform.type ) {

    										case 'matrix':
    											matrix.multiply( transform.obj );
    											break;

    										case 'translate':
    											matrix.multiply( m0.makeTranslation( transform.obj.x, transform.obj.y, transform.obj.z ) );
    											break;

    										case 'scale':
    											matrix.scale( transform.obj );
    											break;

    										case 'rotate':
    											matrix.multiply( m0.makeRotationAxis( transform.obj, transform.angle ) );
    											break;

    									}

    								}

    							}

    							object.matrix.copy( matrix );
    							object.matrix.decompose( object.position, object.quaternion, object.scale );

    							jointMap[ jointIndex ].position = value;

    						}

    					} else {

    						console.log( 'THREE.ColladaLoader: ' + jointIndex + ' does not exist.' );

    					}

    				}

    			};

    		}

    		function buildTransformList( node ) {

    			const transforms = [];

    			const xml = collada.querySelector( '[id="' + node.id + '"]' );

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				let array, vector;

    				switch ( child.nodeName ) {

    					case 'matrix':
    						array = parseFloats( child.textContent );
    						const matrix = new THREE.Matrix4().fromArray( array ).transpose();
    						transforms.push( {
    							sid: child.getAttribute( 'sid' ),
    							type: child.nodeName,
    							obj: matrix
    						} );
    						break;

    					case 'translate':
    					case 'scale':
    						array = parseFloats( child.textContent );
    						vector = new THREE.Vector3().fromArray( array );
    						transforms.push( {
    							sid: child.getAttribute( 'sid' ),
    							type: child.nodeName,
    							obj: vector
    						} );
    						break;

    					case 'rotate':
    						array = parseFloats( child.textContent );
    						vector = new THREE.Vector3().fromArray( array );
    						const angle = THREE.MathUtils.degToRad( array[ 3 ] );
    						transforms.push( {
    							sid: child.getAttribute( 'sid' ),
    							type: child.nodeName,
    							obj: vector,
    							angle: angle
    						} );
    						break;

    				}

    			}

    			return transforms;

    		}

    		// nodes

    		function prepareNodes( xml ) {

    			const elements = xml.getElementsByTagName( 'node' );

    			// ensure all node elements have id attributes

    			for ( let i = 0; i < elements.length; i ++ ) {

    				const element = elements[ i ];

    				if ( element.hasAttribute( 'id' ) === false ) {

    					element.setAttribute( 'id', generateId() );

    				}

    			}

    		}

    		const matrix = new THREE.Matrix4();
    		const vector = new THREE.Vector3();

    		function parseNode( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' ) || '',
    				type: xml.getAttribute( 'type' ),
    				id: xml.getAttribute( 'id' ),
    				sid: xml.getAttribute( 'sid' ),
    				matrix: new THREE.Matrix4(),
    				nodes: [],
    				instanceCameras: [],
    				instanceControllers: [],
    				instanceLights: [],
    				instanceGeometries: [],
    				instanceNodes: [],
    				transforms: {}
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				if ( child.nodeType !== 1 ) continue;

    				let array;

    				switch ( child.nodeName ) {

    					case 'node':
    						data.nodes.push( child.getAttribute( 'id' ) );
    						parseNode( child );
    						break;

    					case 'instance_camera':
    						data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
    						break;

    					case 'instance_controller':
    						data.instanceControllers.push( parseNodeInstance( child ) );
    						break;

    					case 'instance_light':
    						data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
    						break;

    					case 'instance_geometry':
    						data.instanceGeometries.push( parseNodeInstance( child ) );
    						break;

    					case 'instance_node':
    						data.instanceNodes.push( parseId( child.getAttribute( 'url' ) ) );
    						break;

    					case 'matrix':
    						array = parseFloats( child.textContent );
    						data.matrix.multiply( matrix.fromArray( array ).transpose() );
    						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
    						break;

    					case 'translate':
    						array = parseFloats( child.textContent );
    						vector.fromArray( array );
    						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
    						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
    						break;

    					case 'rotate':
    						array = parseFloats( child.textContent );
    						const angle = THREE.MathUtils.degToRad( array[ 3 ] );
    						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
    						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
    						break;

    					case 'scale':
    						array = parseFloats( child.textContent );
    						data.matrix.scale( vector.fromArray( array ) );
    						data.transforms[ child.getAttribute( 'sid' ) ] = child.nodeName;
    						break;

    					case 'extra':
    						break;

    					default:
    						console.log( child );

    				}

    			}

    			if ( hasNode( data.id ) ) {

    				console.warn( 'THREE.ColladaLoader: There is already a node with ID %s. Exclude current node from further processing.', data.id );

    			} else {

    				library.nodes[ data.id ] = data;

    			}

    			return data;

    		}

    		function parseNodeInstance( xml ) {

    			const data = {
    				id: parseId( xml.getAttribute( 'url' ) ),
    				materials: {},
    				skeletons: []
    			};

    			for ( let i = 0; i < xml.childNodes.length; i ++ ) {

    				const child = xml.childNodes[ i ];

    				switch ( child.nodeName ) {

    					case 'bind_material':
    						const instances = child.getElementsByTagName( 'instance_material' );

    						for ( let j = 0; j < instances.length; j ++ ) {

    							const instance = instances[ j ];
    							const symbol = instance.getAttribute( 'symbol' );
    							const target = instance.getAttribute( 'target' );

    							data.materials[ symbol ] = parseId( target );

    						}

    						break;

    					case 'skeleton':
    						data.skeletons.push( parseId( child.textContent ) );
    						break;

    				}

    			}

    			return data;

    		}

    		function buildSkeleton( skeletons, joints ) {

    			const boneData = [];
    			const sortedBoneData = [];

    			let i, j, data;

    			// a skeleton can have multiple root bones. collada expresses this
    			// situtation with multiple "skeleton" tags per controller instance

    			for ( i = 0; i < skeletons.length; i ++ ) {

    				const skeleton = skeletons[ i ];

    				let root;

    				if ( hasNode( skeleton ) ) {

    					root = getNode( skeleton );
    					buildBoneHierarchy( root, joints, boneData );

    				} else if ( hasVisualScene( skeleton ) ) {

    					// handle case where the skeleton refers to the visual scene (#13335)

    					const visualScene = library.visualScenes[ skeleton ];
    					const children = visualScene.children;

    					for ( let j = 0; j < children.length; j ++ ) {

    						const child = children[ j ];

    						if ( child.type === 'JOINT' ) {

    							const root = getNode( child.id );
    							buildBoneHierarchy( root, joints, boneData );

    						}

    					}

    				} else {

    					console.error( 'THREE.ColladaLoader: Unable to find root bone of skeleton with ID:', skeleton );

    				}

    			}

    			// sort bone data (the order is defined in the corresponding controller)

    			for ( i = 0; i < joints.length; i ++ ) {

    				for ( j = 0; j < boneData.length; j ++ ) {

    					data = boneData[ j ];

    					if ( data.bone.name === joints[ i ].name ) {

    						sortedBoneData[ i ] = data;
    						data.processed = true;
    						break;

    					}

    				}

    			}

    			// add unprocessed bone data at the end of the list

    			for ( i = 0; i < boneData.length; i ++ ) {

    				data = boneData[ i ];

    				if ( data.processed === false ) {

    					sortedBoneData.push( data );
    					data.processed = true;

    				}

    			}

    			// setup arrays for skeleton creation

    			const bones = [];
    			const boneInverses = [];

    			for ( i = 0; i < sortedBoneData.length; i ++ ) {

    				data = sortedBoneData[ i ];

    				bones.push( data.bone );
    				boneInverses.push( data.boneInverse );

    			}

    			return new THREE.Skeleton( bones, boneInverses );

    		}

    		function buildBoneHierarchy( root, joints, boneData ) {

    			// setup bone data from visual scene

    			root.traverse( function ( object ) {

    				if ( object.isBone === true ) {

    					let boneInverse;

    					// retrieve the boneInverse from the controller data

    					for ( let i = 0; i < joints.length; i ++ ) {

    						const joint = joints[ i ];

    						if ( joint.name === object.name ) {

    							boneInverse = joint.boneInverse;
    							break;

    						}

    					}

    					if ( boneInverse === undefined ) {

    						// Unfortunately, there can be joints in the visual scene that are not part of the
    						// corresponding controller. In this case, we have to create a dummy boneInverse matrix
    						// for the respective bone. This bone won't affect any vertices, because there are no skin indices
    						// and weights defined for it. But we still have to add the bone to the sorted bone list in order to
    						// ensure a correct animation of the model.

    						boneInverse = new THREE.Matrix4();

    					}

    					boneData.push( { bone: object, boneInverse: boneInverse, processed: false } );

    				}

    			} );

    		}

    		function buildNode( data ) {

    			const objects = [];

    			const matrix = data.matrix;
    			const nodes = data.nodes;
    			const type = data.type;
    			const instanceCameras = data.instanceCameras;
    			const instanceControllers = data.instanceControllers;
    			const instanceLights = data.instanceLights;
    			const instanceGeometries = data.instanceGeometries;
    			const instanceNodes = data.instanceNodes;

    			// nodes

    			for ( let i = 0, l = nodes.length; i < l; i ++ ) {

    				objects.push( getNode( nodes[ i ] ) );

    			}

    			// instance cameras

    			for ( let i = 0, l = instanceCameras.length; i < l; i ++ ) {

    				const instanceCamera = getCamera( instanceCameras[ i ] );

    				if ( instanceCamera !== null ) {

    					objects.push( instanceCamera.clone() );

    				}

    			}

    			// instance controllers

    			for ( let i = 0, l = instanceControllers.length; i < l; i ++ ) {

    				const instance = instanceControllers[ i ];
    				const controller = getController( instance.id );
    				const geometries = getGeometry( controller.id );
    				const newObjects = buildObjects( geometries, instance.materials );

    				const skeletons = instance.skeletons;
    				const joints = controller.skin.joints;

    				const skeleton = buildSkeleton( skeletons, joints );

    				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

    					const object = newObjects[ j ];

    					if ( object.isSkinnedMesh ) {

    						object.bind( skeleton, controller.skin.bindMatrix );
    						object.normalizeSkinWeights();

    					}

    					objects.push( object );

    				}

    			}

    			// instance lights

    			for ( let i = 0, l = instanceLights.length; i < l; i ++ ) {

    				const instanceLight = getLight( instanceLights[ i ] );

    				if ( instanceLight !== null ) {

    					objects.push( instanceLight.clone() );

    				}

    			}

    			// instance geometries

    			for ( let i = 0, l = instanceGeometries.length; i < l; i ++ ) {

    				const instance = instanceGeometries[ i ];

    				// a single geometry instance in collada can lead to multiple object3Ds.
    				// this is the case when primitives are combined like triangles and lines

    				const geometries = getGeometry( instance.id );
    				const newObjects = buildObjects( geometries, instance.materials );

    				for ( let j = 0, jl = newObjects.length; j < jl; j ++ ) {

    					objects.push( newObjects[ j ] );

    				}

    			}

    			// instance nodes

    			for ( let i = 0, l = instanceNodes.length; i < l; i ++ ) {

    				objects.push( getNode( instanceNodes[ i ] ).clone() );

    			}

    			let object;

    			if ( nodes.length === 0 && objects.length === 1 ) {

    				object = objects[ 0 ];

    			} else {

    				object = ( type === 'JOINT' ) ? new THREE.Bone() : new THREE.Group();

    				for ( let i = 0; i < objects.length; i ++ ) {

    					object.add( objects[ i ] );

    				}

    			}

    			object.name = ( type === 'JOINT' ) ? data.sid : data.name;
    			object.matrix.copy( matrix );
    			object.matrix.decompose( object.position, object.quaternion, object.scale );

    			return object;

    		}

    		const fallbackMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff } );

    		function resolveMaterialBinding( keys, instanceMaterials ) {

    			const materials = [];

    			for ( let i = 0, l = keys.length; i < l; i ++ ) {

    				const id = instanceMaterials[ keys[ i ] ];

    				if ( id === undefined ) {

    					console.warn( 'THREE.ColladaLoader: Material with key %s not found. Apply fallback material.', keys[ i ] );
    					materials.push( fallbackMaterial );

    				} else {

    					materials.push( getMaterial( id ) );

    				}

    			}

    			return materials;

    		}

    		function buildObjects( geometries, instanceMaterials ) {

    			const objects = [];

    			for ( const type in geometries ) {

    				const geometry = geometries[ type ];

    				const materials = resolveMaterialBinding( geometry.materialKeys, instanceMaterials );

    				// handle case if no materials are defined

    				if ( materials.length === 0 ) {

    					if ( type === 'lines' || type === 'linestrips' ) {

    						materials.push( new THREE.LineBasicMaterial() );

    					} else {

    						materials.push( new THREE.MeshPhongMaterial() );

    					}

    				}

    				// regard skinning

    				const skinning = ( geometry.data.attributes.skinIndex !== undefined );

    				// choose between a single or multi materials (material array)

    				const material = ( materials.length === 1 ) ? materials[ 0 ] : materials;

    				// now create a specific 3D object

    				let object;

    				switch ( type ) {

    					case 'lines':
    						object = new THREE.LineSegments( geometry.data, material );
    						break;

    					case 'linestrips':
    						object = new THREE.Line( geometry.data, material );
    						break;

    					case 'triangles':
    					case 'polylist':
    						if ( skinning ) {

    							object = new THREE.SkinnedMesh( geometry.data, material );

    						} else {

    							object = new THREE.Mesh( geometry.data, material );

    						}

    						break;

    				}

    				objects.push( object );

    			}

    			return objects;

    		}

    		function hasNode( id ) {

    			return library.nodes[ id ] !== undefined;

    		}

    		function getNode( id ) {

    			return getBuild( library.nodes[ id ], buildNode );

    		}

    		// visual scenes

    		function parseVisualScene( xml ) {

    			const data = {
    				name: xml.getAttribute( 'name' ),
    				children: []
    			};

    			prepareNodes( xml );

    			const elements = getElementsByTagName( xml, 'node' );

    			for ( let i = 0; i < elements.length; i ++ ) {

    				data.children.push( parseNode( elements[ i ] ) );

    			}

    			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

    		}

    		function buildVisualScene( data ) {

    			const group = new THREE.Group();
    			group.name = data.name;

    			const children = data.children;

    			for ( let i = 0; i < children.length; i ++ ) {

    				const child = children[ i ];

    				group.add( getNode( child.id ) );

    			}

    			return group;

    		}

    		function hasVisualScene( id ) {

    			return library.visualScenes[ id ] !== undefined;

    		}

    		function getVisualScene( id ) {

    			return getBuild( library.visualScenes[ id ], buildVisualScene );

    		}

    		// scenes

    		function parseScene( xml ) {

    			const instance = getElementsByTagName( xml, 'instance_visual_scene' )[ 0 ];
    			return getVisualScene( parseId( instance.getAttribute( 'url' ) ) );

    		}

    		function setupAnimations() {

    			const clips = library.clips;

    			if ( isEmpty( clips ) === true ) {

    				if ( isEmpty( library.animations ) === false ) {

    					// if there are animations but no clips, we create a default clip for playback

    					const tracks = [];

    					for ( const id in library.animations ) {

    						const animationTracks = getAnimation( id );

    						for ( let i = 0, l = animationTracks.length; i < l; i ++ ) {

    							tracks.push( animationTracks[ i ] );

    						}

    					}

    					animations.push( new THREE.AnimationClip( 'default', - 1, tracks ) );

    				}

    			} else {

    				for ( const id in clips ) {

    					animations.push( getAnimationClip( id ) );

    				}

    			}

    		}

    		// convert the parser error element into text with each child elements text
    		// separated by new lines.

    		function parserErrorToText( parserError ) {

    			let result = '';
    			const stack = [ parserError ];

    			while ( stack.length ) {

    				const node = stack.shift();

    				if ( node.nodeType === Node.TEXT_NODE ) {

    					result += node.textContent;

    				} else {

    					result += '\n';
    					stack.push.apply( stack, node.childNodes );

    				}

    			}

    			return result.trim();

    		}

    		if ( text.length === 0 ) {

    			return { scene: new THREE.Scene() };

    		}

    		const xml = new DOMParser().parseFromString( text, 'application/xml' );

    		const collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

    		const parserError = xml.getElementsByTagName( 'parsererror' )[ 0 ];
    		if ( parserError !== undefined ) {

    			// Chrome will return parser error with a div in it

    			const errorElement = getElementsByTagName( parserError, 'div' )[ 0 ];
    			let errorText;

    			if ( errorElement ) {

    				errorText = errorElement.textContent;

    			} else {

    				errorText = parserErrorToText( parserError );

    			}

    			console.error( 'THREE.ColladaLoader: Failed to parse collada file.\n', errorText );

    			return null;

    		}

    		// metadata

    		const version = collada.getAttribute( 'version' );
    		console.log( 'THREE.ColladaLoader: File version', version );

    		const asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );
    		const textureLoader = new THREE.TextureLoader( this.manager );
    		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

    		let tgaLoader;

    		if ( TGALoader ) {

    			tgaLoader = new TGALoader( this.manager );
    			tgaLoader.setPath( this.resourcePath || path );

    		}

    		//

    		const animations = [];
    		let kinematics = {};
    		let count = 0;

    		//

    		const library = {
    			animations: {},
    			clips: {},
    			controllers: {},
    			images: {},
    			effects: {},
    			materials: {},
    			cameras: {},
    			lights: {},
    			geometries: {},
    			nodes: {},
    			visualScenes: {},
    			kinematicsModels: {},
    			physicsModels: {},
    			kinematicsScenes: {}
    		};

    		parseLibrary( collada, 'library_animations', 'animation', parseAnimation );
    		parseLibrary( collada, 'library_animation_clips', 'animation_clip', parseAnimationClip );
    		parseLibrary( collada, 'library_controllers', 'controller', parseController );
    		parseLibrary( collada, 'library_images', 'image', parseImage );
    		parseLibrary( collada, 'library_effects', 'effect', parseEffect );
    		parseLibrary( collada, 'library_materials', 'material', parseMaterial );
    		parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
    		parseLibrary( collada, 'library_lights', 'light', parseLight );
    		parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
    		parseLibrary( collada, 'library_nodes', 'node', parseNode );
    		parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );
    		parseLibrary( collada, 'library_kinematics_models', 'kinematics_model', parseKinematicsModel );
    		parseLibrary( collada, 'library_physics_models', 'physics_model', parsePhysicsModel );
    		parseLibrary( collada, 'scene', 'instance_kinematics_scene', parseKinematicsScene );

    		buildLibrary( library.animations, buildAnimation );
    		buildLibrary( library.clips, buildAnimationClip );
    		buildLibrary( library.controllers, buildController );
    		buildLibrary( library.images, buildImage );
    		buildLibrary( library.effects, buildEffect );
    		buildLibrary( library.materials, buildMaterial );
    		buildLibrary( library.cameras, buildCamera );
    		buildLibrary( library.lights, buildLight );
    		buildLibrary( library.geometries, buildGeometry );
    		buildLibrary( library.visualScenes, buildVisualScene );

    		setupAnimations();
    		setupKinematics();

    		const scene = parseScene( getElementsByTagName( collada, 'scene' )[ 0 ] );
    		scene.animations = animations;

    		if ( asset.upAxis === 'Z_UP' ) {

    			scene.quaternion.setFromEuler( new THREE.Euler( - Math.PI / 2, 0, 0 ) );

    		}

    		scene.scale.multiplyScalar( asset.unit );

    		return {
    			get animations() {

    				console.warn( 'THREE.ColladaLoader: Please access animations over scene.animations now.' );
    				return animations;

    			},
    			kinematics: kinematics,
    			library: library,
    			scene: scene
    		};

    	}

    }

    var modeler;
    (function (modeler) {
        modeler.started = false;
        function register() {
        }
        modeler.register = register;
        function start() {
            modeler.started = true;
            var elf;
            const loadingManager = new THREE.LoadingManager(function () {
                //ren.scene.add(elf);
            });
            const loader = new ColladaLoader(loadingManager);
            loader.load('./modeler/collada/diner.dae', function (collada) {
                elf = collada.scene;
                let group = new THREE.Group;
                group.rotation.set(Math.PI / 6, Math.PI / 4, 0);
                group.add(elf);
                elf.scale.set(2, 2, 2);
                elf.add(new THREE.AxesHelper(100));
                elf.rotation.set(-Math.PI / 2, 0, 0);
                ren$1.scene.add(group);
                window['group'] = group;
                window['elf'] = elf;
            });
        }
        modeler.start = start;
        function tick() {
        }
        modeler.tick = tick;
    })(modeler || (modeler = {}));
    var modeler$1 = modeler;

    exports.wastes = void 0;
    (function (wastes) {
        wastes.size = 24;
        wastes.SOME_OTHER_SETTING = false;
        var started = false;
        function sample(a) {
            return a[Math.floor(Math.random() * a.length)];
        }
        wastes.sample = sample;
        function clamp(val, min, max) {
            return val > max ? max : val < min ? min : val;
        }
        wastes.clamp = clamp;
        let RESOURCES;
        (function (RESOURCES) {
            RESOURCES[RESOURCES["RC_UNDEFINED"] = 0] = "RC_UNDEFINED";
            RESOURCES[RESOURCES["POPULAR_ASSETS"] = 1] = "POPULAR_ASSETS";
            RESOURCES[RESOURCES["CANT_FIND"] = 2] = "CANT_FIND";
            RESOURCES[RESOURCES["READY"] = 3] = "READY";
            RESOURCES[RESOURCES["COUNT"] = 4] = "COUNT";
        })(RESOURCES = wastes.RESOURCES || (wastes.RESOURCES = {}));
        let time;
        let resources_loaded = 0b0;
        function resourced(word) {
            resources_loaded |= 0b1 << RESOURCES[word];
            try_start();
        }
        wastes.resourced = resourced;
        function try_start() {
            let count = 0;
            for (let i = 0; i < RESOURCES.COUNT; i++)
                if (resources_loaded & 0b1 << i)
                    count++;
            if (count == RESOURCES.COUNT)
                start();
        }
        const MAX_WAIT = 500;
        function reasonable_waiter() {
            if (time + MAX_WAIT < new Date().getTime()) {
                console.warn(` passed reasonable wait time for resources `);
                start();
            }
        }
        function critical(mask) {
            // Couldn't load
            console.error('resource', mask);
        }
        wastes.critical = critical;
        function registers() {
            lod$1.register();
            tiles$1.register();
            objects$1.register();
        }
        function starts() {
            if (window.location.href.indexOf("#testingchamber") != -1) {
                testing_chamber$1.start();
                tests$1.start();
            }
            else if (window.location.href.indexOf("#modeler") != -1) {
                modeler$1.start();
                console.log('woo');
            }
            else {
                tiles$1.start();
                objects$1.start();
            }
        }
        function start() {
            if (started)
                return;
            started = true;
            console.log(' wastes starting ');
            wastes.view = View.make();
            registers();
            starts();
        }
        function init() {
            console.log(' wests init ');
            time = new Date().getTime();
            resourced('RC_UNDEFINED');
            resourced('POPULAR_ASSETS');
            resourced('READY');
            window['wastes'] = wastes;
        }
        wastes.init = init;
        function tick() {
            if (!started) {
                reasonable_waiter();
                return;
            }
            wastes.view.tick();
            if (!testing_chamber$1.started) {
                tiles$1.tick();
                tests$1.tick();
            }
            testing_chamber$1.tick();
            //lands.tick();
        }
        wastes.tick = tick;
    })(exports.wastes || (exports.wastes = {}));
    var wastes = exports.wastes;

    exports["default"] = wastes;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, THREE);
