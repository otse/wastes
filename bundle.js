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
        static func(bb, callback) {
            let y = bb.min[1];
            for (; y <= bb.max[1]; y++) {
                let x = bb.max[0];
                for (; x >= bb.min[0]; x--) {
                    if (callback([x, y]))
                        return;
                }
            }
        }
        static project(a) {
            return [a[0] / 2 + a[1] / 2, a[1] / 4 - a[0] / 4];
        }
        static unproject(a) {
            return [a[0] - a[1] * 2, a[1] * 2 + a[0]];
        }
        static to_string(a) {
            const pr = (b) => b != undefined ? `, ${b}` : '';
            return `${a[0]}, ${a[1]}` + pr(a[2]) + pr(a[3]);
        }
        static equals(a, b) {
            return a[0] == b[0] && a[1] == b[1];
        }
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
            ren.init();
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
            ren.update();
            exports.wastes.tick();
            ren.render();
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
    var Renderer;
    (function (Renderer) {
        Renderer.DPI_UPSCALED_RT = true;
        Renderer.ndpi = 1;
        Renderer.delta = 0;
        let groups;
        (function (groups) {
        })(groups = Renderer.groups || (Renderer.groups = {}));
        //export var ambientLight: AmbientLight
        //export var directionalLight: DirectionalLight
        function update() {
            Renderer.delta = Renderer.clock.getDelta();
            if (Renderer.delta > 2)
                Renderer.delta = 0.016;
            //filmic.composer.render();
        }
        Renderer.update = update;
        var reset = 0;
        var frames = 0;
        // https://github.com/mrdoob/stats.js/blob/master/src/Stats.js#L71
        function calc() {
            const s = Date.now() / 1000;
            frames++;
            if (s - reset >= 1) {
                reset = s;
                Renderer.fps = frames;
                frames = 0;
            }
            Renderer.memory = window.performance.memory;
        }
        Renderer.calc = calc;
        function render() {
            calc();
            Renderer.renderer.setRenderTarget(Renderer.target);
            Renderer.renderer.clear();
            Renderer.renderer.render(Renderer.scene, Renderer.camera);
            Renderer.renderer.setRenderTarget(null);
            Renderer.renderer.clear();
            Renderer.renderer.render(Renderer.scenert, Renderer.camera2);
        }
        Renderer.render = render;
        function init() {
            console.log('renderer init');
            Renderer.clock = new THREE.Clock();
            groups.axisSwap = new THREE.Group;
            groups.tiles = new THREE.Group;
            //groups.menu = new Group
            Renderer.scene = new THREE.Scene();
            groups.axisSwap.add(groups.tiles);
            Renderer.scene.add(groups.axisSwap);
            Renderer.scene.background = new THREE.Color('#292929');
            Renderer.scenert = new THREE.Scene();
            Renderer.ambientLight = new THREE.AmbientLight(0xffffff);
            Renderer.scene.add(Renderer.ambientLight);
            if (Renderer.DPI_UPSCALED_RT)
                Renderer.ndpi = window.devicePixelRatio;
            Renderer.target = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
                minFilter: THREE__default["default"].NearestFilter,
                magFilter: THREE__default["default"].NearestFilter,
                format: THREE__default["default"].RGBFormat
            });
            Renderer.renderer = new THREE.WebGLRenderer({ antialias: false });
            Renderer.renderer.setPixelRatio(Renderer.ndpi);
            Renderer.renderer.setSize(100, 100);
            Renderer.renderer.autoClear = true;
            Renderer.renderer.setClearColor(0xffffff, 0);
            document.body.appendChild(Renderer.renderer.domElement);
            window.addEventListener('resize', onWindowResize, false);
            Renderer.materialPost = new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: Renderer.target.texture } },
                vertexShader: vertexScreen,
                fragmentShader: fragmentPost,
                depthWrite: false
            });
            onWindowResize();
            Renderer.quadPost = new THREE.Mesh(Renderer.plane, Renderer.materialPost);
            //quadPost.position.z = -100;
            Renderer.scenert.add(Renderer.quadPost);
            window.Renderer = Renderer;
        }
        Renderer.init = init;
        function onWindowResize() {
            Renderer.w = Renderer.w2 = window.innerWidth;
            Renderer.h = Renderer.h2 = window.innerHeight;
            if (Renderer.DPI_UPSCALED_RT) {
                Renderer.w2 = Renderer.w * Renderer.ndpi;
                Renderer.h2 = Renderer.h * Renderer.ndpi;
                if (Renderer.w2 % 2 != 0) ;
                if (Renderer.h2 % 2 != 0) ;
            }
            console.log(`window inner [${Renderer.w}, ${Renderer.h}], new is [${Renderer.w2}, ${Renderer.h2}]`);
            Renderer.target.setSize(Renderer.w2, Renderer.h2);
            Renderer.plane = new THREE.PlaneBufferGeometry(Renderer.w2, Renderer.h2);
            if (Renderer.quadPost)
                Renderer.quadPost.geometry = Renderer.plane;
            {
                Renderer.camera = ortographic_camera(Renderer.w2, Renderer.h2);
            }
            Renderer.camera2 = ortographic_camera(Renderer.w2, Renderer.h2);
            Renderer.camera2.updateProjectionMatrix();
            Renderer.renderer.setSize(Renderer.w, Renderer.h);
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
        Renderer.load_texture = load_texture;
        function make_render_target(w, h) {
            const o = {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            };
            let target = new THREE.WebGLRenderTarget(w, h, o);
            return target;
        }
        Renderer.make_render_target = make_render_target;
        function ortographic_camera(w, h) {
            let camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10000, 10000);
            camera.updateProjectionMatrix();
            return camera;
        }
        Renderer.ortographic_camera = ortographic_camera;
        function erase_children(group) {
            while (group.children.length > 0)
                group.remove(group.children[0]);
        }
        Renderer.erase_children = erase_children;
    })(Renderer || (Renderer = {}));
    var ren = Renderer;

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
        Numbers.Objs = [0, 0];
        Numbers.Trees = [0, 0];
        Numbers.Sprites = [0, 0];
        Numbers.Tiles = [0, 0];
    })(Numbers || (Numbers = {}));
    class Toggle {
        constructor() {
            this.active = false;
        }
        isActive() { return this.active; }
        ;
        on() {
            if (this.active) {
                console.warn(' already on ');
                return true;
                // it was on before
            }
            this.active = true;
            return false;
            // it wasn't on before
        }
        off() {
            if (!this.active) {
                console.warn(' already off ');
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
        class Galaxy {
            constructor(span) {
                this.arrays = [];
                this.grid = new Grid(4, 4, this);
            }
            update(wpos) {
                this.grid.big = this.big(wpos);
                this.grid.offs();
                this.grid.crawl();
            }
            lookup(big) {
                if (this.arrays[big[1]] == undefined)
                    this.arrays[big[1]] = [];
                return this.arrays[big[1]][big[0]];
            }
            sectoratpixel(pixel) {
                let units = this.unproject(pixel);
                let bigs = this.big(units);
                return this.at(bigs);
            }
            at(big) {
                return this.lookup(big) || this.make(big);
            }
            add(obj) {
                //obj.wtorpos();
                let sector = this.at(this.big(obj.wpos));
                sector.add(obj);
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
            project(unit) {
                return pts.mult(pts.project(unit), wastes.size);
            }
            unproject(pixel) {
                return pts.divide(pts.unproject(pixel), wastes.size);
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
                Numbers.Sectors[1]++;
                galaxy.arrays[this.big[1]][this.big[0]] = this;
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
                for (let obj of this.objs)
                    obj.show();
                ren.scene.add(this.group);
                hooks.call('sectorShow', this);
            }
            hide() {
                if (this.off())
                    return;
                Numbers.Sectors[0]--;
                for (let obj of this.objs)
                    obj.hide();
                ren.scene.remove(this.group);
                hooks.call('sectorHide', this);
            }
            dist() {
                return pts.distsimple(this.big, this.galaxy.grid.big);
            }
        }
        lod.Sector = Sector;
        class Grid {
            constructor(spread, outside, galaxy) {
                this.spread = spread;
                this.outside = outside;
                this.galaxy = galaxy;
                this.big = [0, 0];
                this.shown = [];
            }
            visible(sector) {
                return sector.dist() < this.spread;
            }
            crawl() {
                for (let y = -this.spread; y < this.spread; y++) {
                    for (let x = -this.spread; x < this.spread; x++) {
                        let pos = pts.add(this.big, [x, y]);
                        let sector = this.galaxy.lookup(pos);
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
                    if (sector.dist() >= this.outside) {
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
            constructor(stuffs, counts = Numbers.Objs) {
                super();
                this.counts = counts;
                this.wpos = [0, 0];
                this.rpos = [0, 0];
                this.size = [100, 100];
                this.z = 0;
                this.rz = 0;
                this.hexagonal = false;
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
                this.update();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.show();
            }
            hide() {
                var _a;
                if (this.off())
                    return;
                this.counts[0]--;
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.hide();
                // console.log(' obj.hide ');
            }
            wtorpos() {
                this.rpos = lod.galaxy.project(this.wpos);
            }
            tick() {
            }
            create() {
                console.warn(' obj.create ');
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
            constructor(pars, counts) {
                super();
                this.pars = pars;
                this.counts = counts;
                this.pars.bind.shape = this;
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
            super(pars, Numbers.Sprites);
            this.pars = pars;
            this.dimetric = true;
            this.spriteMatrix = new THREE.Matrix3;
        }
        update() {
            var _a, _b;
            if (!this.mesh)
                return;
            this.mesh.rotation.z = this.pars.bind.rz;
            const obj = this.pars.bind;
            let rpos = pts.add(obj.rpos, pts.divide(obj.size, 2));
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
            const obj = this.pars.bind;
            this.geometry = new THREE.PlaneBufferGeometry(this.pars.bind.size[0], this.pars.bind.size[1]);
            let color;
            if (this.pars.bind.sector.color) {
                color = new THREE.Color(this.pars.bind.sector.color);
            }
            else {
                const c = this.pars.color || [255, 255, 255, 255];
                color = new THREE.Color(`rgb(${c[0]}, ${c[1]}, ${c[2]})}`);
            }
            this.material = SpriteMaterial({
                map: ren.load_texture(`${this.pars.img}.png`, 0),
                transparent: true,
                color: color
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
            this.mesh.matrixAutoUpdate = false;
            this.mesh.renderOrder = -obj.wpos[1] + obj.wpos[0] + (this.pars.order || 0);
            this.update();
            ren.groups.axisSwap.add(this.mesh);
        }
    }
    function SpriteMaterial(parameters, uniforms) {
        let material = new THREE.MeshBasicMaterial(parameters);
        material.name = "SpriteMaterial";
        material.onBeforeCompile = function (shader) {
            shader.defines = {};
            /*shader.vertexShader = shader.vertexShader.replace(
                `#define PHONG`,
                `#define PHONG
                uniform mat3 spriteMatrix;
                `
            );
            shader.vertexShader = shader.vertexShader.replace(
                `#include <uv_vertex>`,
                `#include <uv_vertex>
                #ifdef USE_UV
                vUv = ( spriteMatrix * vec3( uv, 1 ) ).xy;
                #endif
                `
            );*/
        };
        return material;
    }

    var testing_chamber;
    (function (testing_chamber) {
        function start() {
            console.log(' start testing chamber ');
            console.log('placing squares on game area that should take up 1:1 pixels on screen...');
            console.log('...regardless of your os or browsers dpi setting');
            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    let conversion = 100;
                    let square = TestingSquare.make();
                    square.wpos = [x * conversion, y * conversion];
                    square.create();
                    wastes.view.add(square);
                }
            }
            hooks.register('viewClick', (view) => {
                console.log(' asteorid! ');
                let ping = new Asteroid;
                ping.wpos = pts.add(wastes.view.mwpos, [-1, -1]);
                ping.create();
                wastes.view.add(ping);
                return false;
            });
        }
        testing_chamber.start = start;
        class Asteroid extends lod$1.Obj {
            constructor() {
                super(undefined);
                this.size = [100, 100];
                this.float = pts.make((Math.random() - 0.5) / Asteroid.slowness, (Math.random() - 0.5) / Asteroid.slowness);
                this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
            }
            create() {
                this.size = [200, 200];
                let shape = new Sprite({
                    bind: this,
                    img: 'tex/pngwing.com'
                });
                shape.dimetric = false;
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
        class TestingSquare extends lod$1.Obj {
            static make() {
                return new TestingSquare;
            }
            constructor() {
                super(undefined);
            }
            create() {
                this.size = [100, 100];
                new Sprite({
                    bind: this,
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
        testing_chamber.TestingSquare = TestingSquare;
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
            this.show = true;
            lod$1.galaxy = new lod$1.Galaxy(10);
            this.rpos = lod$1.galaxy.project(this.wpos);
        }
        static make() {
            return new View;
        }
        chart(big) {
        }
        add(obj) {
            lod$1.galaxy.add(obj);
        }
        remove(obj) {
            var _a;
            (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
        }
        tick() {
            this.move();
            this.chase();
            this.mouse();
            this.stats();
            this.wpos = lod$1.galaxy.unproject(this.rpos);
            lod$1.galaxy.update(this.wpos);
            const zoom = wastes.view.zoom;
            ren.camera.scale.set(zoom, zoom, zoom);
            ren.camera.updateProjectionMatrix();
        }
        mouse() {
            let mouse = app$1.mouse();
            mouse = pts.subtract(mouse, pts.divide([ren.w, ren.h], 2));
            mouse = pts.mult(mouse, ren.ndpi);
            mouse = pts.mult(mouse, this.zoom);
            mouse[1] = -mouse[1];
            this.mrpos = pts.add(mouse, this.rpos);
            this.mwpos = lod$1.galaxy.unproject(this.mrpos);
            this.mwpos = pts.add(this.mwpos, [.5, -.5]);
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
        chase() {
            ren.delta;
            pts.mult([0, 0], 0);
            //let ply = PRY.ply.rpos;
            //this.rpos = pts.add(pts.mult(pts.subtract(ply, this.rpos), time * 5), this.rpos);
            //this.rpos = pts.mult(this.rpos, this.zoom);
            let inv = pts.inv(this.rpos);
            ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
        }
        stats() {
            if (app$1.key('h') == 1)
                this.show = !this.show;
            let crunch = ``;
            crunch += `DPI_UPSCALED_RT: ${ren.DPI_UPSCALED_RT}<br />`;
            crunch += '<br />';
            crunch += `dpi: ${ren.ndpi}<br />`;
            crunch += `fps: ${ren.fps} / ${ren.delta.toPrecision(3)}<br />`;
            crunch += '<br />';
            crunch += `textures: ${ren.renderer.info.memory.textures}<br />`;
            crunch += `programs: ${ren.renderer.info.programs.length}<br />`;
            crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
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

    var objects;
    (function (objects) {
        const mapSpan = 100;
        function register() {
            console.log(' objects register ');
            objects.heightmap = new ColorMap('heightmap');
            objects.objectmap = new ColorMap('objectmap');
            objects.treemap = new ColorMap('treemap');
            objects.colormap = new ColorMap('colormap');
            /*lod.SectorHooks.OnShow.register((sector: lod.Sector) => {
                objectmap.loop(sector.small, (pos, color) => {
                    if (color[0] == 254) {
                        let wall = new Wall();
                        wall.wpos = [pos[0], pos[1]];
                        wests.view.add(wall);
                    }
                })
                return false;
            })*/
            const treeTreshold = 50;
            hooks.register('sectorCreate', (x) => {
                let sector = x;
                pts.func(sector.small, (pos) => {
                    const color = objects.treemap.bit(pos);
                    if (color[0] > treeTreshold) {
                        let shrubs = new Shrubs();
                        shrubs.wpos = pos;
                        shrubs.create();
                        wastes.view.add(shrubs);
                        //console.log('shrubs');
                    }
                    return false;
                });
                return false;
            });
            hooks.register('sectorCreate', (x) => {
                let sector = x;
                pts.func(sector.small, (pos) => {
                    const clr = objects.objectmap.bit(pos);
                    if (clr[0] == 255 && clr[1] == 255 && clr[2] == 255) {
                        console.log('make a shack');
                        let wall = new Wall();
                        wall.wpos = pos;
                        wall.create();
                        wastes.view.add(wall);
                    }
                    return false;
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
        class ColorMap {
            constructor(id) {
                this.bits = [];
                var img = document.getElementById(id);
                this.canvas = document.createElement('canvas');
                this.canvas.width = mapSpan;
                this.canvas.height = mapSpan;
                this.ctx = this.canvas.getContext('2d');
                //this.ctx.scale(1, 1);
                this.ctx.drawImage(img, 0, 0, img.width, img.height);
                this.process();
            }
            bit(pos) {
                return this.bits[pos[1]] ? this.bits[pos[1]][pos[0]] || zeroes : zeroes;
            }
            offset(pos, offset) {
                return this.bit(pts.add(pos, offset));
            }
            process() {
                for (let y = 0; y < mapSpan; y++) {
                    this.bits[y] = [];
                    for (let x = 0; x < mapSpan; x++) {
                        const data = this.ctx.getImageData(x, mapSpan - 1 - y, 1, 1).data;
                        if (this.bits[y] == undefined)
                            this.bits[y] = [];
                        this.bits[y][x] = data;
                    }
                }
            }
        }
        objects.ColorMap = ColorMap;
        class Wall extends lod$1.Obj {
            constructor() {
                super(undefined);
            }
            create() {
                this.size = [24, 40];
                new Sprite({
                    bind: this,
                    img: 'tex/dwall',
                    order: .5
                });
            }
            adapt() {
                // change sprite to surrounding walls
            }
        }
        objects.Wall = Wall;
        class Shrubs extends lod$1.Obj {
            constructor() {
                super(undefined);
            }
            create() {
                this.size = [24, 15];
                new Sprite({
                    bind: this,
                    img: 'tex/shrubs',
                    order: .5
                });
            }
        }
        objects.Shrubs = Shrubs;
    })(objects || (objects = {}));
    var objects$1 = objects;

    var tiles;
    (function (tiles_1) {
        const mapSize = 100;
        var tiles = [];
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
                tile.create();
                wastes.view.add(tile);
                return false;
            });
        }
        tiles_1.start = start;
        class Tile extends lod$1.Obj {
            constructor(wpos) {
                super(undefined, Numbers.Tiles);
                this.wpos = wpos;
                this.size = [24, 12];
                this.z = objects$1.heightmap.bit(this.wpos)[0];
            }
            create() {
                let img, clr;
                img = 'tex/dtileup';
                this.size = [24, 17];
                this.z = 1;
                clr = objects$1.colormap.bit(this.wpos);
                //clr = [255, 255, 255, 255];
                if ((clr[0] == 0 && clr[1] == 0 && clr[2] == 0)) {
                    img = 'tex/dtile';
                    clr = [63, 63, 127, 255];
                    this.size = [24, 12];
                    this.z = 0;
                }
                new Sprite({
                    bind: this,
                    img: img,
                    color: clr
                });
            }
            //update() {}
            delete() {
            }
            tick() {
                if (!this.shape)
                    return;
                let shape = this.shape;
                if (pts.equals(this.wpos, pts.floor(wastes.view.mwpos)))
                    shape.mesh.material.color.set('green');
                //else
                //shape.material.color.set('white');
            }
        }
        tiles_1.Tile = Tile;
    })(tiles || (tiles = {}));
    var tiles$1 = tiles;

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
            tests$1.start();
            tiles$1.start();
            objects$1.start();
            if (window.location.href.indexOf("#testingchamber") != -1) {
                //CRPG = false
                testing_chamber$1.start();
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
            tests$1.tick();
            //lands.tick();
        }
        wastes.tick = tick;
    })(exports.wastes || (exports.wastes = {}));
    var wastes = exports.wastes;

    exports["default"] = wastes;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, THREE);
