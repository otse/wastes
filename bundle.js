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
        static round(a) {
            return [Math.round(a[0]), Math.round(a[1])];
        }
        static inv(a) {
            return [-a[0], -a[1]];
        }
        static mult(a, n, m) {
            return [a[0] * n, a[1] * (m || n)];
        }
        static mults(a, b) {
            return [a[0] * b[0], a[1] * b[1]];
        }
        static divide(a, n, m) {
            return [a[0] / n, a[1] / (m || n)];
        }
        static divides(a, b) {
            return [a[0] / b[0], a[1] / b[1]];
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
        static uneven(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 1) {
                b[0] += n;
            }
            if (b[1] % 2 != 1) {
                b[1] += n;
            }
            return b;
        }
        static even(a, n = -1) {
            let b = pts.clone(a);
            if (b[0] % 2 != 0) {
                b[0] += n;
            }
            if (b[1] % 2 != 0) {
                b[1] += n;
            }
            return b;
        }
        // https://vorg.github.io/pex/docs/pex-geom/Vec2.html
        //static dist(a: vec2, b: vec2): number {
        //	let dx = b[0] - a[0];
        //	let dy = b[1] - a[1];
        //	return Math.sqrt(dx * dx + dy * dy);
        //}
        static distsimple(a, b) {
            let c = pts.abs(pts.subtract(a, b));
            return Math.max(c[0], c[1]);
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
        let MOUSE;
        (function (MOUSE) {
            MOUSE[MOUSE["UP"] = -1] = "UP";
            MOUSE[MOUSE["OFF"] = 0] = "OFF";
            MOUSE[MOUSE["DOWN"] = 1] = "DOWN";
            MOUSE[MOUSE["STILL"] = 2] = "STILL";
        })(MOUSE = app.MOUSE || (app.MOUSE = {}));
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
            function onmouseup(e) { buttons[e.button] = MOUSE.UP; }
            function onwheel(e) { app.wheel = e.deltaY < 0 ? 1 : -1; }
            function onerror(message) { document.querySelectorAll('.stats')[0].innerHTML = message; }
            document.onkeydown = document.onkeyup = onkeys;
            document.onmousemove = onmousemove;
            document.onmousedown = onmousedown;
            document.onmouseup = onmouseup;
            document.onwheel = onwheel;
            window.onerror = onerror;
            ren$1.init();
            exports.wastes.init();
            loop();
        }
        app.boot = boot;
        function process_keys() {
            for (let i in keys) {
                if (keys[i] == KEY.PRESS)
                    keys[i] = KEY.WAIT;
                else if (keys[i] == KEY.UP)
                    keys[i] = KEY.OFF;
            }
        }
        function process_mouse_buttons() {
            for (let b of [0, 1, 2])
                if (buttons[b] == MOUSE.DOWN)
                    buttons[b] = MOUSE.STILL;
                else if (buttons[b] == MOUSE.UP)
                    buttons[b] = MOUSE.OFF;
        }
        function loop(timestamp) {
            requestAnimationFrame(loop);
            ren$1.update();
            exports.wastes.tick();
            ren$1.render();
            app.wheel = 0;
            process_keys();
            process_mouse_buttons();
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
            ren.renderer.render(ren.scene2, ren.camera2);
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
            ren.scene.background = new THREE.Color('#333');
            ren.scene2 = new THREE.Scene();
            ren.ambientLight = new THREE.AmbientLight(0xffffff);
            ren.scene.add(ren.ambientLight);
            if (ren.DPI_UPSCALED_RT)
                ren.ndpi = window.devicePixelRatio;
            ren.target = new THREE.WebGLRenderTarget(1024, 1024, {
                minFilter: THREE__default["default"].NearestFilter,
                magFilter: THREE__default["default"].NearestFilter,
                format: THREE__default["default"].RGBAFormat
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
            ren.scene2.add(ren.quadPost);
            window.ren = ren;
        }
        ren.init = init;
        ren.screen = [0, 0];
        ren.screenCorrected = [0, 0];
        function onWindowResize() {
            ren.screen = [window.innerWidth, window.innerHeight];
            //screen = pts.divide(screen, 2);
            ren.screen = pts.floor(ren.screen);
            //screen = pts.even(screen, -1);
            //screen = [800, 600];
            ren.screenCorrected = pts.clone(ren.screen);
            if (ren.DPI_UPSCALED_RT) {
                //screen = pts.floor(screen);
                ren.screenCorrected = pts.mult(ren.screen, ren.ndpi);
                ren.screenCorrected = pts.floor(ren.screenCorrected);
                ren.screenCorrected = pts.even(ren.screenCorrected, -1);
            }
            console.log(`
		window inner ${pts.to_string(ren.screen)}\n
		      new is ${pts.to_string(ren.screenCorrected)}`);
            ren.target.setSize(ren.screenCorrected[0], ren.screenCorrected[1]);
            ren.plane = new THREE.PlaneBufferGeometry(ren.screenCorrected[0], ren.screenCorrected[1]);
            if (ren.quadPost)
                ren.quadPost.geometry = ren.plane;
            {
                ren.camera = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
            }
            ren.camera2 = ortographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
            ren.camera2.updateProjectionMatrix();
            ren.renderer.setSize(ren.screen[0], ren.screen[1]);
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
        static register(name, f) {
            if (!hooks[name])
                hooks[name] = [];
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

    var numbers;
    (function (numbers) {
        numbers.sectors = [0, 0];
        numbers.sprites = [0, 0];
        numbers.objs = [0, 0];
        numbers.tiles = [0, 0];
        numbers.floors = [0, 0];
        numbers.trees = [0, 0];
        numbers.walls = [0, 0];
        numbers.roofs = [0, 0];
    })(numbers || (numbers = {}));
    class toggle {
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
            // hooks.create('sectorCreate')
            // hooks.create('sectorShow')
            // hooks.create('sectorHide')
            // hooks.register('sectorHide', () => { console.log('~'); return false; } );
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
            let sector = lod.ggalaxy.at(lod.ggalaxy.big(obj.wpos));
            sector.add(obj);
        }
        lod.add = add;
        class galaxy {
            constructor(span) {
                this.arrays = [];
                lod.ggalaxy = this;
                new grid(2, 2);
            }
            update(wpos) {
                lod.ggrid.big = this.big(wpos);
                lod.ggrid.offs();
                lod.ggrid.crawl();
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
                s = this.arrays[big[1]][big[0]] = new sector(big, this);
                return s;
            }
            big(units) {
                return pts.floor(pts.divide(units, lod.SectorSpan));
            }
        }
        lod.galaxy = galaxy;
        class sector extends toggle {
            constructor(big, galaxy) {
                super();
                this.big = big;
                this.galaxy = galaxy;
                this.objs = [];
                // this.color = (['salmon', 'blue', 'cyan', 'purple'])[Math.floor(Math.random() * 4)];
                let min = pts.mult(this.big, lod.SectorSpan);
                let max = pts.add(min, [lod.SectorSpan - 1, lod.SectorSpan - 1]);
                this.small = new aabb2(max, min);
                this.group = new THREE.Group;
                this.group.frustumCulled = false;
                this.group.matrixAutoUpdate = false;
                numbers.sectors[1]++;
                galaxy.arrays[this.big[1]][this.big[0]] = this;
                //console.log('sector');
                hooks.call('sectorCreate', this);
            }
            objsro() {
                return this.objs;
            }
            add(obj) {
                let i = this.objs.indexOf(obj);
                if (i == -1) {
                    this.objs.push(obj);
                    obj.sector = this;
                    if (this.isActive())
                        obj.show();
                }
            }
            stacked(wpos) {
                let stack = [];
                for (let obj of this.objs)
                    if (pts.equals(wpos, obj.wpos))
                        stack.push(obj);
                return stack;
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
                numbers.sectors[0]++;
                for (let obj of this.objs)
                    obj.show();
                ren$1.scene.add(this.group);
                hooks.call('sectorShow', this);
            }
            hide() {
                if (this.off())
                    return;
                numbers.sectors[0]--;
                for (let obj of this.objs)
                    obj.hide();
                ren$1.scene.remove(this.group);
                hooks.call('sectorHide', this);
            }
            dist() {
                return pts.distsimple(this.big, lod.ggrid.big);
            }
        }
        lod.sector = sector;
        class grid {
            constructor(spread, outside) {
                this.spread = spread;
                this.outside = outside;
                this.big = [0, 0];
                this.shown = [];
                lod.ggrid = this;
                if (this.outside < this.spread) {
                    console.warn(' outside less than spread ', this.spread, this.outside);
                    this.outside = this.spread;
                }
            }
            visible(sector) {
                return sector.dist() < this.spread;
            }
            crawl() {
                // spread = -2; < 2
                for (let y = -this.spread; y < this.spread + 1; y++) {
                    for (let x = -this.spread; x < this.spread + 1; x++) {
                        let pos = pts.add(this.big, [x, y]);
                        let sector = lod.ggalaxy.at(pos) ;
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
                    allObjs = allObjs.concat(sector.objsro());
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
        lod.grid = grid;
        class obj extends toggle {
            constructor(counts = numbers.objs) {
                super();
                this.counts = counts;
                this.type = 'an obj';
                this.wpos = [0, 0];
                this.rpos = [0, 0];
                this.size = [100, 100];
                this.ro = 0;
                this.z = 0;
                this.height = 0;
                this.heightAdd = 0;
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
        lod.obj = obj;
        class shape extends toggle {
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
        lod.shape = shape;
    })(lod || (lod = {}));
    var lod$1 = lod;

    var sprites;
    (function (sprites) {
        function start() {
        }
        sprites.start = start;
        sprites.test100 = [[100, 100], [100, 100], 0, 'tex/test100'];
        sprites.asteroid = [[512, 512], [512, 512], 0, 'tex/pngwing.com'];
        sprites.shrubs = [[24, 15], [24, 15], 0, 'tex/shrubs'];
        sprites.dtile = [[24, 12], [24, 12], 0, 'tex/dtile'];
        sprites.dtile4 = [[24, 17], [24, 17], 0, 'tex/dtileup4'];
        sprites.dtreetrunk = [[24, 50], [24, 50], 0, 'tex/dtreetrunk'];
        sprites.dtreeleaves = [[24, 31], [24, 31], 0, 'tex/dtreeleaves'];
        sprites.dswamptiles = [[96, 30], [24, 30], 0, 'tex/dswamptiles'];
        sprites.dgraveltiles = [[96, 30], [24, 30], 0, 'tex/dgraveltiles'];
        sprites.dtilesand = [[24, 17], [24, 17], 0, 'tex/dtilesand'];
        sprites.dwall = [[96, 40], [24, 40], 0, 'tex/dwalls'];
        sprites.ddeck = [[72, 17], [24, 17], 0, 'tex/ddeck'];
        sprites.dtree1 = [[121, 147], [121, 147], 0, 'tex/dtree1b'];
        sprites.droof = [[72, 17], [24, 17], 0, 'tex/droof'];
        sprites.drustywalls = [[288, 40], [24, 40], 0, 'tex/drustywalls'];
        sprites.dwoodenwalls = [[288, 40], [24, 40], 0, 'tex/dslimywalls'];
        sprites.druddywalls = [[288, 40], [24, 40], 0, 'tex/druddywalls'];
        sprites.ddoorwood = [[96, 40], [24, 40], 0, 'tex/ddoor'];
        sprites.dacidbarrel = [[24, 35], [24, 35], 0, 'tex/dacidbarrel'];
        sprites.dfalsefronts = [[192, 40], [24, 40], 0, 'tex/dfalsefronts'];
        function get_uv_transform(cell, tuple) {
            let divide = pts.divides(tuple[1], tuple[0]);
            let offset = pts.mults(divide, cell);
            let repeat = divide;
            let center = [0, 1];
            let mat = new THREE.Matrix3;
            mat.setUvTransform(offset[0], offset[1], repeat[0], repeat[1], 0, center[0], center[1]);
            return mat;
        }
        sprites.get_uv_transform = get_uv_transform;
    })(sprites || (sprites = {}));
    var sprites$1 = sprites;

    class sprite extends lod$1.shape {
        constructor(vars) {
            super(vars.binded, numbers.sprites);
            this.vars = vars;
            this.rup = 0;
            this.rleft = 0;
            this.roffset = [0, 0];
            if (!this.vars.cell)
                this.vars.cell = [0, 0];
            if (!this.vars.order)
                this.vars.order = 0;
            this.myUvTransform = new THREE.Matrix3;
            this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
        }
        update() {
            var _a, _b;
            if (!this.mesh)
                return;
            this.mesh.rotation.z = this.vars.binded.ro;
            const obj = this.vars.binded;
            let rposCalc;
            rposCalc = pts.add(obj.rpos, pts.divide(obj.size, 2));
            rposCalc = pts.add(rposCalc, [this.rleft, this.rup]);
            (_a = this.mesh) === null || _a === void 0 ? void 0 : _a.position.fromArray([...rposCalc, 0]);
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
            var _a;
            const obj = this.vars.binded;
            this.myUvTransform = sprites$1.get_uv_transform(this.vars.cell, this.vars.tuple);
            this.geometry = new THREE.PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
            let color;
            if (this.vars.binded.sector.color) {
                color = new THREE.Color(this.vars.binded.sector.color);
            }
            else {
                const c = this.vars.color || [255, 255, 255, 255];
                color = new THREE.Color(`rgb(${c[0]}, ${c[1]}, ${c[2]})}`);
            }
            this.material = SpriteMaterial({
                map: ren$1.load_texture(`${this.vars.tuple[3]}.png`, 0),
                transparent: true,
                color: color
            }, {
                myUvTransform: this.myUvTransform
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
            this.mesh.matrixAutoUpdate = false;
            this.mesh.renderOrder = -obj.wpos[1] + obj.wpos[0] + this.vars.order;
            this.update();
            (_a = this.vars.binded.sector) === null || _a === void 0 ? void 0 : _a.group.add(this.mesh);
            ren$1.groups.axisSwap.add(this.mesh);
        }
    }
    function SpriteMaterial(parameters, uniforms) {
        let material = new THREE.MeshBasicMaterial(parameters);
        material.customProgramCacheKey = function () {
            return 'spritemat';
        };
        material.name = "spritemat";
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
            wastes.gview.zoom = 1;
            wastes.gview.wpos = [0, 0];
            wastes.gview.rpos = lod$1.unproject([0, 0]);
            hooks.register('sectorShow', (x) => {
                console.log('(testing chamber) show sector');
                return false;
            });
            hooks.register('viewClick', (view) => {
                console.log(' asteorid! ');
                let ping = new Asteroid;
                ping.wpos = pts.add(wastes.gview.mwpos, [-1, -1]);
                lod$1.add(ping);
                return false;
            });
            lod$1.SectorSpan = 4;
            lod$1.ggrid = new lod$1.grid(1, 1);
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
        class Asteroid extends lod$1.obj {
            constructor() {
                super(undefined);
                this.size = [100, 100];
                this.float = pts.make((Math.random() - 0.5) / Asteroid.slowness, (Math.random() - 0.5) / Asteroid.slowness);
                this.rate = (Math.random() - 0.5) / (Asteroid.slowness * 6);
            }
            create() {
                this.size = [200, 200];
                new sprite({
                    binded: this,
                    tuple: sprites$1.asteroid
                });
            }
            tick() {
                var _a;
                this.wpos[0] += this.float[0];
                this.wpos[1] -= this.float[1];
                this.ro += this.rate;
                super.update();
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
            }
        }
        Asteroid.slowness = 12;
        testing_chamber.Asteroid = Asteroid;
        class Square extends lod$1.obj {
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
                new sprite({
                    binded: this,
                    tuple: sprites$1.test100
                });
            }
            tick() {
                let shape = this.shape;
                if (this.mousedSquare(wastes.gview.mrpos))
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
            mouserock.start();
        }
        tests.start = start;
        function tick() {
            mouserock.tick();
        }
        tests.tick = tick;
        class mouserock {
            static start() {
            }
            static tick() {
                var _a;
                if (this.obj) {
                    this.obj.rpos = wastes.gview.mrpos;
                    (_a = this.obj.shape) === null || _a === void 0 ? void 0 : _a.update();
                    this.obj.shape;
                }
            }
        }
        tests.mouserock = mouserock;
    })(tests || (tests = {}));
    var tests$1 = tests;

    // the view manages what it sees
    class view {
        constructor() {
            this.zoom = 0.33;
            this.zoomIndex = 3;
            this.zooms = [1, 0.5, 0.33, 0.2, 0.1];
            this.wpos = [42, 45];
            this.rpos = [0, 0];
            this.mpos = [0, 0];
            this.mwpos = [0, 0];
            this.mrpos = [0, 0];
            this.begin = [0, 0];
            this.before = [0, 0];
            this.show = true;
            new lod$1.galaxy(10);
            this.rpos = lod$1.project(this.wpos);
        }
        static make() {
            return new view;
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
            this.pan();
            this.chase();
            this.stats();
            this.wpos = lod$1.unproject(this.rpos);
            lod$1.ggalaxy.update(this.wpos);
            const zoom = wastes.gview.zoom;
            ren$1.camera.scale.set(zoom, zoom, zoom);
            ren$1.camera.updateProjectionMatrix();
        }
        pan() {
            const continuousSpeed = -100;
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
                    dif = pts.divide(dif, continuousSpeed);
                    this.rpos = pts.add(this.rpos, dif);
                }
            }
            else if (app$1.button(1) == -1) {
                console.log('woo');
                this.rpos = pts.floor(this.rpos);
            }
        }
        chase() {
            // let inv = pts.inv(this.rpos);
            // ren.groups.axisSwap.position.set(inv[0], inv[1], 0);
            ren$1.camera.position.set(this.rpos[0], this.rpos[1], 0);
        }
        mouse() {
            let mouse = app$1.mouse();
            mouse = pts.subtract(mouse, pts.divide([ren$1.screen[0], ren$1.screen[1]], 2));
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
            let pan = 10;
            if (app$1.key('x'))
                pan *= 2;
            let add = [0, 0];
            if (app$1.key('w'))
                add = pts.add(add, [0, pan]);
            if (app$1.key('s'))
                add = pts.add(add, [0, -pan]);
            if (app$1.key('a'))
                add = pts.add(add, [-pan, 0]);
            if (app$1.key('d'))
                add = pts.add(add, [pan, 0]);
            if (app$1.key('f') == 1 && this.zoomIndex > 0)
                this.zoomIndex -= 1;
            if (app$1.key('r') == 1 && this.zoomIndex < this.zooms.length - 1)
                this.zoomIndex += 1;
            this.zoom = this.zooms[this.zoomIndex];
            add = pts.mult(add, this.zoom);
            add = pts.floor(add);
            this.rpos = pts.add(this.rpos, add);
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
            //crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
            crunch += '<br />';
            //crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
            //crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
            crunch += `mwpos: ${pts.to_string(pts.floor(this.mwpos))}<br />`;
            crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
            crunch += '<br />';
            crunch += `lod grid size: ${lod$1.ggrid.spread * 2 + 1} / ${lod$1.ggrid.outside * 2 + 1}<br />`;
            crunch += `view wpos: ${pts.to_string(pts.floor(this.wpos))}<br />`;
            crunch += `view bigpos: ${pts.to_string(lod$1.ggalaxy.big(this.wpos))}<br />`;
            crunch += `view zoom: ${this.zoom}<br />`;
            crunch += '<br />';
            //crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
            crunch += `sectors: ${numbers.sectors[0]} / ${numbers.sectors[1]}<br />`;
            crunch += `game objs: ${numbers.objs[0]} / ${numbers.objs[1]}<br />`;
            crunch += `sprites: ${numbers.sprites[0]} / ${numbers.sprites[1]}<br />`;
            crunch += `tiles: ${numbers.tiles[0]} / ${numbers.tiles[1]}<br />`;
            crunch += `floors: ${numbers.floors[0]} / ${numbers.floors[1]}<br />`;
            crunch += `walls: ${numbers.walls[0]} / ${numbers.walls[1]}<br />`;
            crunch += `walls: ${numbers.roofs[0]} / ${numbers.roofs[1]}<br />`;
            crunch += '<br />';
            crunch += `controls: WASD to move, R, F, to zoom, middlemouse to pan<br />`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = this.show ? 'visible' : 'hidden';
        }
    }

    var tiles;
    (function (tiles) {
        tiles.started = false;
        var arrays = [];
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
                    let tile = new tiles.tile([x, y]);
                    arrays[y][x] = tile;
                    lod$1.add(tile);
                });
                return false;
            });
        }
        tiles.register = register;
        function start() {
            tiles.started = true;
            console.log(' tiles start ');
            lod$1.ggalaxy.at(lod$1.ggalaxy.big(wastes.gview.wpos));
        }
        tiles.start = start;
        function tick() {
            if (!tiles.started)
                return;
            for (let i = 40; i >= 0; i--) {
                // pretention grid
                let pos = lod$1.unproject(pts.add(wastes.gview.mrpos, [0, -i]));
                pos = pts.floor(pos);
                const tile = get(pos);
                if (tile && tile.z + tile.height + tile.heightAdd == i) {
                    if (tile.sector.isActive()) {
                        tile.hover();
                        break;
                    }
                }
            }
        }
        tiles.tick = tick;
        const color_purple_water = [66, 66, 110, 255];
        class tile extends lod$1.obj {
            constructor(wpos) {
                super(numbers.tiles);
                this.wpos = wpos;
                let colour = wastes.colormap.pixel(this.wpos);
                if (colour.is_black()) {
                    this.size = [24, 12];
                    this.tuple = sprites$1.dtile;
                    this.color = color_purple_water;
                }
                if (!colour.is_black()) {
                    this.height = 6;
                    this.tuple = sprites$1.dswamptiles;
                    this.cell = [1, 0];
                    this.size = [24, 30];
                    this.color = wastes.colormap.pixel(this.wpos).array;
                    /*if (colour.is_color(color_gravel)) {
                        this.tuple = sprites.dgraveltiles;
                        console.log('gravel');
                    }*/
                    const divisor = 1;
                    let height = wastes.heightmap.pixel(this.wpos);
                    this.z = Math.floor(height.array[0] / divisor);
                    this.z -= 3;
                }
            }
            get_stack() {
                var _a;
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.objsro();
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
                let shape = new sprite({
                    binded: this,
                    tuple: this.tuple,
                    cell: this.cell,
                    color: this.color,
                    order: .3
                });
                // if we have a deck, add it to heightAdd
                let sector = lod$1.ggalaxy.at(lod$1.ggalaxy.big(this.wpos));
                let at = sector.stacked(this.wpos);
                for (let obj of at) {
                    if (obj.type == 'deck')
                        this.heightAdd = obj.height;
                }
                shape.rup = this.z;
            }
            //update() {}
            delete() {
            }
            hover() {
                let sprite = this.shape;
                if (!(sprite === null || sprite === void 0 ? void 0 : sprite.mesh))
                    return;
                const last = tile.lastHover;
                if (last && last != this && last.sector.isActive()) {
                    last.hide();
                    last.show();
                }
                sprite.mesh.material.color.set('green');
                tile.lastHover = this;
            }
            tick() {
            }
        }
        tiles.tile = tile;
    })(tiles || (tiles = {}));
    var tiles$1 = tiles;

    var objects;
    (function (objects) {
        const mapSpan = 100;
        const color_wooden_door = [210, 210, 210];
        const color_wooden_door_and_deck = [24, 93, 61];
        const color_treetrunk = [20, 70, 20];
        const color_slimy_wall = [20, 70, 50];
        const color_slimy_wall_with_deck = [20, 78, 54];
        const color_deck = [114, 128, 124];
        const color_rusty_wall_and_deck = [20, 84, 87];
        const color_acid_barrel = [61, 118, 48];
        const color_false_front = [255, 255, 255];
        function factory(type, pixel, pos, hints = {}) {
            let obj = new type;
            obj.hints = hints;
            obj.pixel = pixel;
            obj.wpos = pos;
            lod$1.add(obj);
            return obj;
        }
        objects.factory = factory;
        function register() {
            console.log(' objects register ');
            wastes.heightmap = new colormap('heightmap');
            wastes.objectmap = new colormap('objectmap');
            wastes.buildingmap = new colormap('buildingmap');
            wastes.roofmap = new colormap('roofmap');
            wastes.treemap = new colormap('treemap');
            wastes.colormap = new colormap('colormap');
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.objectmap.pixel(pos);
                    if (pixel.is_color(color_acid_barrel)) ;
                });
                return false;
            });
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.roofmap.pixel(pos);
                    if (pixel.is_color(color_false_front)) {
                        //factory(objects.roof, pixel, pos);
                        factory(objects.falsefront, pixel, pos);
                    }
                });
                return false;
            });
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.buildingmap.pixel(pos);
                    if (pixel.is_color(color_slimy_wall_with_deck)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.wall, pixel, pos, { type: 'slimy' });
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(color_slimy_wall)) {
                        factory(objects.wall, pixel, pos, { type: 'slimy' });
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(color_treetrunk)) {
                        factory(objects.treetrunk, pixel, pos);
                    }
                    else if (pixel.is_color(color_rusty_wall_and_deck)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.wall, pixel, pos, { type: 'rusty' });
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(color_deck)) {
                        factory(objects.deck, pixel, pos);
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(color_wooden_door)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.door, pixel, pos);
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(color_wooden_door_and_deck)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.door, pixel, pos);
                        //factory(objects.roof, pixel, pos);
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
        class pixel {
            constructor(context, pos, array) {
                this.context = context;
                this.pos = pos;
                this.array = array;
            }
            left() {
                return this.context.pixel(pts.add(this.pos, [-1, 0]));
            }
            right() {
                return this.context.pixel(pts.add(this.pos, [1, 0]));
            }
            up() {
                return this.context.pixel(pts.add(this.pos, [0, 1]));
            }
            down() {
                return this.context.pixel(pts.add(this.pos, [0, -1]));
            }
            same(pixel) {
                return this.is_color(pixel.array);
            }
            is_color(vec) {
                return vec[0] == this.array[0] && vec[1] == this.array[1] && vec[2] == this.array[2];
            }
            is_color_range(a, b) {
                return this.array[0] >= a[0] && this.array[0] <= b[0] &&
                    this.array[1] >= a[1] && this.array[1] <= b[1] &&
                    this.array[2] >= a[2] && this.array[2] <= b[2];
            }
            is_black() {
                return this.is_color([0, 0, 0]);
            }
            is_white() {
                return this.is_color([255, 255, 255]);
            }
        }
        objects.pixel = pixel;
        class colormap {
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
            }
            pixel(pos) {
                return new pixel(this, pos, this.get(pos) || [0, 0, 0, 0]);
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
        objects.colormap = colormap;
        class objected extends lod$1.obj {
            constructor(counts) {
                super(counts);
                this.cell = [0, 0];
                this.calc = 0;
                this.heightAdd = 0;
            }
            tiled() {
                this.tile = tiles$1.get(this.wpos);
            }
            //update(): void {
            //	this.tiled();
            //	super.update();
            //}
            stack() {
                let calc = 0;
                let stack = this.sector.stacked(this.wpos);
                for (let obj of stack) {
                    if (obj == this)
                        break;
                    calc += obj.z + obj.height;
                }
                this.calc = calc;
                if (this.shape)
                    this.shape.rup = this.calc + this.heightAdd;
            }
        }
        objects.objected = objected;
        class wall extends objected {
            constructor() {
                super(numbers.walls);
                this.type = 'wall';
                this.height = 24;
            }
            create() {
                var _a, _b;
                this.tiled();
                this.size = [24, 40];
                this.cell = [255 - this.pixel.array[3], 0];
                let tuple = sprites$1.dwoodenwalls;
                if (((_a = this.hints) === null || _a === void 0 ? void 0 : _a.type) == 'rusty')
                    tuple = sprites$1.drustywalls;
                if (((_b = this.hints) === null || _b === void 0 ? void 0 : _b.type) == 'ruddy')
                    tuple = sprites$1.druddywalls;
                new sprite({
                    binded: this,
                    tuple: tuple,
                    cell: this.cell,
                    order: .6,
                });
                this.stack();
            }
            adapt() {
                // change sprite to surrounding walls
            }
        }
        objects.wall = wall;
        class deck extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'deck';
                this.height = 3;
            }
            create() {
                this.tiled();
                this.size = [24, 17];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddeck,
                    cell: this.cell,
                    order: .4,
                });
                this.stack();
            }
        }
        objects.deck = deck;
        class treetrunk extends objected {
            constructor() {
                super(numbers.floors);
                this.flowered = false;
                this.type = 'tree';
                this.height = 29;
            }
            create() {
                this.tiled();
                this.size = [24, 50];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dtreetrunk,
                    order: 0.6,
                });
                this.stack();
                if (!this.flowered) {
                    this.flowered = true;
                    for (let y = -1; y <= 1; y++)
                        for (let x = -1; x <= 1; x++)
                            if (!(x == 0 && y == 0) && Math.random() > .3)
                                factory(objects.treeleaves, pixel, pts.add(this.wpos, [x, y]), { tree: this });
                    factory(objects.treeleaves, pixel, pts.add(this.wpos, [0, 0]));
                    factory(objects.treeleaves, pixel, pts.add(this.wpos, [0, 0]));
                }
            }
        }
        objects.treetrunk = treetrunk;
        class treeleaves extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'tree leaves';
                this.height = 14;
            }
            create() {
                this.tiled();
                this.size = [24, 31];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dtreeleaves,
                    order: 0.7,
                });
                if (this.hints.tree)
                    this.special_leaves_stack();
                else
                    this.stack();
            }
            special_leaves_stack() {
                console.log('special stack');
                const tree = this.hints.tree;
                if (this.shape) {
                    this.z = tree.calc + tree.height;
                    this.shape.rup = this.z;
                }
            }
        }
        objects.treeleaves = treeleaves;
        class roof extends objected {
            constructor() {
                super(numbers.roofs);
                this.type = 'roof';
                this.height = 4;
            }
            create() {
                this.tiled();
                this.size = [24, 17];
                let shape = new sprite({
                    binded: this,
                    tuple: sprites$1.droof,
                    order: .6,
                });
                this.z = shape.rup = 3 + 27;
            }
        }
        objects.roof = roof;
        class acidbarrel extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'acidbarrel';
                this.height = 4;
            }
            create() {
                this.tiled();
                this.size = [24, 35];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dacidbarrel,
                    order: .4,
                });
                this.stack();
            }
        }
        objects.acidbarrel = acidbarrel;
        class falsefront extends objected {
            constructor() {
                super(numbers.roofs);
                this.type = 'falsefront';
                this.height = 10;
            }
            create() {
                this.tiled();
                this.cell = [255 - this.pixel.array[3], 0];
                this.size = [24, 40];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dfalsefronts,
                    cell: this.cell,
                    order: .7,
                });
                this.stack();
            }
        }
        objects.falsefront = falsefront;
        class door extends objected {
            constructor() {
                super(numbers.walls);
                this.type = 'door';
                this.height = 24;
                //this.cell = [1, 0];
            }
            create() {
                this.tiled();
                this.size = [24, 40];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddoorwood,
                    cell: this.cell,
                    order: .5,
                });
                this.stack();
            }
            adapt() {
                // change sprite to surrounding walls
            }
        }
        objects.door = door;
        class shrubs extends objected {
            constructor() {
                super(numbers.trees);
                this.type = 'shrubs';
            }
            create() {
                this.size = [24, 15];
                new sprite({
                    binded: this,
                    tuple: sprites$1.shrubs,
                    order: .5
                });
            }
        }
        objects.shrubs = shrubs;
    })(objects || (objects = {}));
    var objects$1 = objects;

    var modeler;
    (function (modeler) {
        modeler.started = false;
        const textures = [
            'tex/stock/metalrooftiles.jpg',
            'tex/stock/concrete1.jpg',
            'tex/stock/brick1.jpg',
            'tex/stock/brick2.jpg',
            'tex/stock/brick3.jpg',
            'tex/stock/brick4.jpg',
            'tex/stock/treebark1.jpg',
            'tex/stock/leaves.png',
        ];
        let currentTex = 0;
        var gmesh;
        var ggroup;
        var rotation = 1;
        let heightMod = 1;
        var zooms = [0, 1, [1, 0.33, 0.25, 0.1]];
        function register() {
        }
        modeler.register = register;
        function start() {
            modeler.started = true;
            document.title = 'modeler';
            gmesh = createMesh();
            ggroup = new THREE.Group;
            ggroup.rotation.set(Math.PI / 6, Math.PI / 4, 0);
            ren$1.scene.add(ggroup);
            let sun = new THREE.DirectionalLight(0xffffff, 0.5);
            sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 3);
            //sun.add(new AxesHelper(100));
            ggroup.add(sun);
            ggroup.add(sun.target);
        }
        modeler.start = start;
        function createMesh(size = wastes.size) {
            const width = 18, height = 18 * 2;
            let box = new THREE.BoxGeometry(width, height * heightMod, width, 1, 1, 1);
            let materials = [];
            const loader = new THREE.TextureLoader();
            loader.load(textures[currentTex], function (texture) {
                console.log(texture.magFilter);
                console.log(texture.minFilter);
                //texture.magFilter = texture.minFilter = THREE.NearestFilter;
                texture.wrapS = texture.wrapT = THREE__default["default"].RepeatWrapping;
                texture.generateMipmaps = true;
                console.log('woo');
                let alignments = [
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1),
                    new THREE.Matrix3().setUvTransform(0, 0, 0.5, 1, rotation * Math.PI / 2, 0, 1),
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1), // right
                ];
                for (let i of [1, 2, 4]) {
                    materials[i] = myboxmaterial({
                        map: texture
                    }, {
                        myUvTransform: alignments[i]
                    });
                }
                gmesh = new THREE.Mesh(box, materials);
                gmesh.position.set(3, 0, 0);
                ggroup.add(gmesh);
            });
        }
        let show = true;
        function tick() {
            if (!modeler.started)
                return;
            if (app$1.wheel == -1 && zooms[0] > 0)
                zooms[0] -= 1;
            if (app$1.wheel == 1 && zooms[0] < zooms[2].length - 1)
                zooms[0] += 1;
            zooms[1] = zooms[2][zooms[0]];
            ren$1.camera2.scale.set(zooms[1], zooms[1], zooms[1]);
            let rebuild = false;
            if (app$1.key('q') == 1) {
                rotation -= 1;
                rebuild = true;
            }
            if (app$1.key('e') == 1) {
                rotation += 1;
                rebuild = true;
            }
            if (app$1.key('arrowright') == 1) {
                rebuild = true;
                console.log('switch tex');
                if (currentTex < textures.length - 1)
                    currentTex++;
            }
            if (app$1.key('arrowleft') == 1) {
                rebuild = true;
                console.log('switch tex');
                if (currentTex > 0)
                    currentTex--;
            }
            if (app$1.key('arrowup') == 1) {
                heightMod += 0.1;
                rebuild = true;
            }
            if (app$1.key('arrowdown') == 1) {
                heightMod -= 0.1;
                rebuild = true;
            }
            rotation = rotation < 0 ? 3 : rotation > 3 ? 0 : rotation;
            if (rebuild && gmesh) {
                gmesh.geometry.dispose();
                gmesh.material[1].dispose();
                gmesh.material[2].dispose();
                gmesh.material[4].dispose();
                gmesh.parent.remove(gmesh);
                gmesh = undefined;
                createMesh();
                //ggroup.add(gmesh);
            }
            if (app$1.key('h') == 1)
                show = !show;
            let crunch = ``;
            crunch += `dpi: ${ren$1.ndpi}<br />`;
            crunch += `fps: ${ren$1.fps} / ${ren$1.delta.toPrecision(3)}<br />`;
            crunch += '<br />';
            crunch += `zoom: ${zooms[1]}<br />`;
            crunch += `rotation: ${rotation}<br />`;
            crunch += `controls: mousewheel to zoom, Q, E to rotate texture<br />`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = show ? 'visible' : 'hidden';
        }
        modeler.tick = tick;
        function myboxmaterial(parameters, uniforms) {
            let material = new THREE.MeshLambertMaterial(parameters);
            material.customProgramCacheKey = function () {
                return 'boxmaterial';
            };
            material.name = "boxmaterial";
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
    })(modeler || (modeler = {}));
    var modeler$1 = modeler;

    var tree;
    (function (tree) {
        tree.started = false;
        var gStemMesh;
        var gLeavesMesh;
        var ggroup;
        var rotation = 0;
        var rotationLeaf = 0;
        var zooms = [0, 1, [1, 0.33, 0.25, 0.1]];
        function register() {
        }
        tree.register = register;
        function start() {
            tree.started = true;
            document.title = 'tree';
            gStemMesh = createMesh();
            ggroup = new THREE.Group;
            ggroup.rotation.set(Math.PI / 6, Math.PI / 4, 0);
            ren$1.scene.add(ggroup);
            ren$1.scene.remove(ren$1.ambientLight);
            let am = new THREE.AmbientLight(0x777777);
            ren$1.scene.add(am);
            ren$1.scene.background = new THREE.Color('gray');
            let sun = new THREE.DirectionalLight(0xffffff, 0.5);
            sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 6);
            //sun.add(new AxesHelper(100));
            ggroup.add(sun);
            ggroup.add(sun.target);
        }
        tree.start = start;
        function createMesh(size = wastes.size) {
            let stemWidth = 18, stemHeight = 30;
            let leavesHeight = size * 3;
            //height = size * 3;
            let stemGeometry = new THREE.BoxGeometry(stemWidth, stemHeight, stemWidth, 1, 1, 1);
            let leavesGeometry = new THREE.BoxGeometry(leavesHeight, leavesHeight, leavesHeight, 1, 1, 1);
            let materials1 = [];
            let materials2 = [];
            const loader = new THREE.TextureLoader();
            loader.load('tex/stock/treebark1.jpg', function (texture) {
                //texture.magFilter = texture.minFilter = THREE.NearestFilter;
                texture.wrapS = texture.wrapT = THREE__default["default"].RepeatWrapping;
                texture.generateMipmaps = true;
                console.log('woo');
                let alignments = [
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1),
                    new THREE.Matrix3().setUvTransform(0, 0, 0.5, 1, rotation * Math.PI / 2, 0, 1),
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 1, 1, rotation * Math.PI / 2, 0, 1), // right
                ];
                for (let i of [1, 2, 4]) {
                    materials1[i] = myboxmaterial({
                        map: texture
                    }, {
                        myUvTransform: alignments[i]
                    });
                }
                gStemMesh = new THREE.Mesh(stemGeometry, materials1);
                gStemMesh.position.set(1, 0, 0);
                ggroup.add(gStemMesh);
            });
            const loader2 = new THREE.TextureLoader();
            loader2.load('tex/stock/leaves.png', function (texture) {
                //texture.magFilter = texture.minFilter = THREE.NearestFilter;
                texture.wrapS = texture.wrapT = THREE__default["default"].RepeatWrapping;
                texture.generateMipmaps = true;
                console.log('woo2');
                let alignments = [
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1),
                    new THREE.Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1),
                    undefined,
                    new THREE.Matrix3().setUvTransform(0, 0, 2, 2, rotationLeaf * Math.PI / 2, 0, 1), // right
                ];
                for (let i of [1, 2, 4]) {
                    materials2[i] = myboxmaterial({
                        map: texture,
                        transparent: true
                    }, {
                        myUvTransform: alignments[i]
                    });
                }
                gLeavesMesh = new THREE.Mesh(leavesGeometry, materials2);
                gLeavesMesh.position.set(1, (stemHeight / 2) + (leavesHeight / 2), 0);
                ggroup.add(gLeavesMesh);
            });
        }
        let show = true;
        function tick() {
            if (!tree.started)
                return;
            if (app$1.wheel == -1 && zooms[0] > 0)
                zooms[0] -= 1;
            if (app$1.wheel == 1 && zooms[0] < zooms[2].length - 1)
                zooms[0] += 1;
            zooms[1] = zooms[2][zooms[0]];
            ren$1.camera2.scale.set(zooms[1], zooms[1], zooms[1]);
            let rebuild = false;
            if (app$1.key('q') == 1) {
                rotation -= 1;
                rebuild = true;
            }
            if (app$1.key('e') == 1) {
                rotation += 1;
                rebuild = true;
            }
            if (app$1.key('a') == 1) {
                rotationLeaf -= 1;
                rebuild = true;
            }
            if (app$1.key('d') == 1) {
                rotationLeaf += 1;
                rebuild = true;
            }
            rotation = rotation < 0 ? 3 : rotation > 3 ? 0 : rotation;
            function deleteMesh(mesh) {
                mesh.geometry.dispose();
                mesh.material[1].dispose();
                mesh.material[2].dispose();
                mesh.material[4].dispose();
                mesh.parent.remove(mesh);
                mesh = undefined;
            }
            if (rebuild && gStemMesh) {
                deleteMesh(gStemMesh);
                deleteMesh(gLeavesMesh);
                createMesh();
                //ggroup.add(gmesh);
            }
            if (app$1.key('h') == 1)
                show = !show;
            let crunch = ``;
            crunch += `dpi: ${ren$1.ndpi}<br />`;
            crunch += `fps: ${ren$1.fps} / ${ren$1.delta.toPrecision(3)}<br />`;
            crunch += '<br />';
            crunch += `zoom: ${zooms[1]}<br />`;
            crunch += `rotation: ${rotation}<br />`;
            crunch += `controls: mousewheel to zoom, Q, E to rotate texture<br />`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = show ? 'visible' : 'hidden';
        }
        tree.tick = tick;
        function myboxmaterial(parameters, uniforms) {
            let material = new THREE.MeshLambertMaterial(parameters);
            material.customProgramCacheKey = function () {
                return 'boxmaterial';
            };
            material.name = "boxmaterial";
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
    })(tree || (tree = {}));
    var tree$1 = tree;

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
        function starts() {
            lod$1.register();
            if (window.location.href.indexOf("#testingchamber") != -1) {
                testing_chamber$1.start();
                tests$1.start();
            }
            else if (window.location.href.indexOf("#modeler") != -1) {
                modeler$1.start();
            }
            else if (window.location.href.indexOf("#tree") != -1) {
                tree$1.start();
            }
            else {
                wastes.gview = view.make();
                objects$1.register();
                tiles$1.register();
                sprites.start();
                tiles$1.start();
                objects$1.start();
            }
        }
        function start() {
            if (started)
                return;
            started = true;
            console.log(' wastes starting ');
            starts();
        }
        function init() {
            console.log(' wastes init ');
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
            wastes.gview === null || wastes.gview === void 0 ? void 0 : wastes.gview.tick();
            if (!testing_chamber$1.started) {
                tiles$1.tick();
                tests$1.tick();
            }
            testing_chamber$1.tick();
            modeler$1.tick();
            tree$1.tick();
            //lands.tick();
        }
        wastes.tick = tick;
    })(exports.wastes || (exports.wastes = {}));
    var wastes = exports.wastes;

    exports["default"] = wastes;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, THREE);
