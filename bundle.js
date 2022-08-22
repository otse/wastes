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
        static to_string_fixed(a) {
            const pr = (b) => b != undefined ? `, ${b}` : '';
            return `${a[0].toFixed(1)}, ${a[1].toFixed(1)}` + pr(a[2]) + pr(a[3]);
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
        static angle(a, b) {
            return -Math.atan2(a[0] - b[0], a[1] - b[1]);
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
        random_point() {
            const width = this.max[0] - this.min[0];
            const length = this.max[1] - this.min[1];
            return [this.min[0] + width * Math.random(), this.min[1] + length * Math.random()];
        }
        ray(r) {
            // r.dir is unit direction vector of ray
            let dirfrac = {};
            dirfrac.x = 1.0 / r.dir[0];
            dirfrac.y = 1.0 / r.dir[1];
            // lb is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
            // r.org is origin of ray
            let t1 = (this.min[0] - r.org[0]) * dirfrac.x;
            let t2 = (this.max[0] - r.org[0]) * dirfrac.x;
            let t3 = (this.min[1] - r.org[1]) * dirfrac.y;
            let t4 = (this.max[1] - r.org[1]) * dirfrac.y;
            let tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
            let tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));
            // if tmax < 0, ray (line) is intersecting AABB, but the whole AABB is behind us
            if (tmax < 0) {
                return false;
            }
            // if tmin > tmax, ray doesn't intersect AABB
            if (tmin > tmax) {
                return false;
            }
            return true;
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
        app.mobile = false;
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
            app.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            function onmousemove(e) { pos[0] = e.clientX; pos[1] = e.clientY; }
            function onmousedown(e) { buttons[e.button] = 1; if (e.button == 1)
                return false; }
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
float saturation = 2.0;

uniform int compression;

// 32 is nice
// 48 is mild
float factor = 24.0;


void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(floor(inputColor.rgb * factor + 0.5) / factor, inputColor.a);

}

// Todo add effect
varying vec2 vUv;
uniform sampler2D tDiffuse;
void main() {
	vec4 clr = texture2D( tDiffuse, vUv );
	clr.rgb = mix(clr.rgb, vec3(0.5), 0.0);
	
	/*
	vec3 original_color = clr.rgb;
	vec3 lumaWeights = vec3(.25,.50,.25);
	vec3 grey = vec3(dot(lumaWeights,original_color));
	vec4 outt = vec4(grey + saturation * (original_color - grey), 1.0);
	*/
	vec4 outt;
	gl_FragColor = clr;
	if (compression == 1) {
	mainImage(clr, vUv, gl_FragColor);
	}
	//gl_FragColor = outt;
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
            //delta *= 60.0;
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
            if (app$1.key('z') == 1) {
                ren.materialPost.uniforms.compression.value = !ren.materialPost.uniforms.compression.value;
            }
            /*alternate = ! alternate;
            if (alternate) {
                return;
            }*/
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
            //groups.axisSwap.scale.set(1, -1, 1);
            ren.scene.add(groups.axisSwap);
            ren.scene.background = new THREE.Color('#333');
            ren.scene2 = new THREE.Scene();
            ren.ambientLight = new THREE.AmbientLight(0xffffff, 1);
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
                uniforms: {
                    tDiffuse: { value: ren.target.texture },
                    compression: { value: 1 }
                },
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
                ren.camera = make_orthographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
            }
            ren.camera2 = make_orthographic_camera(ren.screenCorrected[0], ren.screenCorrected[1]);
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
        function make_orthographic_camera(w, h) {
            let camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10000, 10000);
            camera.updateProjectionMatrix();
            return camera;
        }
        ren.make_orthographic_camera = make_orthographic_camera;
        function erase_children(group) {
            while (group.children.length > 0)
                group.remove(group.children[0]);
        }
        ren.erase_children = erase_children;
    })(ren || (ren = {}));
    var ren$1 = ren;

    // inspired by gmod lua !
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
        numbers.leaves = [0, 0];
        numbers.walls = [0, 0];
        numbers.roofs = [0, 0];
        numbers.pawns = [0, 0];
        numbers.chickens = [0, 0];
    })(numbers || (numbers = {}));
    class toggle {
        constructor() {
            this.active = false;
        }
        isActive() { return this.active; }
        ;
        on() {
            if (this.active) {
                // console.warn(' (toggle) already on ');
                return true;
                // it was on before
            }
            this.active = true;
            return false;
            // it wasn't on before
        }
        off() {
            if (!this.active) {
                // console.warn(' (toggle) already off ');
                return true;
            }
            this.active = false;
            return false;
        }
    }
    var lod;
    (function (lod) {
        lod.SectorSpan = 3;
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
            let sector = lod.gworld.at(lod.world.big(obj.wpos));
            sector.add(obj);
        }
        lod.add = add;
        function remove(obj) {
            var _a;
            (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
        }
        lod.remove = remove;
        class world {
            constructor(span) {
                this.arrays = [];
                lod.gworld = this;
                new grid(1, 1);
            }
            update(wpos) {
                lod.ggrid.big = lod.world.big(wpos);
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
            static big(units) {
                return pts.floor(pts.divide(units, lod.SectorSpan));
            }
        }
        lod.world = world;
        class sector extends toggle {
            constructor(big, world) {
                super();
                this.big = big;
                this.world = world;
                this.objs = [];
                let min = pts.mult(this.big, lod.SectorSpan);
                let max = pts.add(min, [lod.SectorSpan - 1, lod.SectorSpan - 1]);
                this.small = new aabb2(max, min);
                this.group = new THREE.Group;
                this.group.frustumCulled = false;
                this.group.matrixAutoUpdate = false;
                numbers.sectors[1]++;
                world.arrays[this.big[1]][this.big[0]] = this;
                //console.log('sector');
                hooks.call('sectorCreate', this);
            }
            add(obj) {
                let i = this.objs.indexOf(obj);
                if (i == -1) {
                    this.objs.push(obj);
                    obj.sector = this;
                    if (this.isActive() && !obj.isActive())
                        obj.show();
                }
            }
            stacked(wpos) {
                let stack = [];
                for (let obj of this.objs)
                    if (pts.equals(wpos, pts.round(obj.wpos)))
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
                var _a;
                // Call me whenever you move
                let newSector = this.world.at(lod.world.big(pts.round(obj.wpos)));
                if (obj.sector != newSector) {
                    (_a = obj.sector) === null || _a === void 0 ? void 0 : _a.remove(obj);
                    newSector.add(obj);
                    if (!newSector.isActive())
                        obj.hide();
                }
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
                this.visibleObjs = [];
                lod.ggrid = this;
                if (this.outside < this.spread) {
                    console.warn(' outside less than spread ', this.spread, this.outside);
                    this.outside = this.spread;
                }
            }
            grow() {
                this.spread++;
                this.outside++;
            }
            shrink() {
                this.spread--;
                this.outside--;
            }
            visible(sector) {
                return sector.dist() < this.spread;
            }
            crawl() {
                // spread = -2; < 2
                for (let y = -this.spread; y < this.spread + 1; y++) {
                    for (let x = -this.spread; x < this.spread + 1; x++) {
                        let pos = pts.add(this.big, [x, y]);
                        let sector = lod.gworld.at(pos) ;
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
                this.visibleObjs = [];
                let i = this.shown.length;
                while (i--) {
                    let sector;
                    sector = this.shown[i];
                    if (sector.dist() > this.outside) {
                        sector.hide();
                        this.shown.splice(i, 1);
                    }
                    else {
                        sector.tick();
                        this.visibleObjs = this.visibleObjs.concat(sector.objs);
                    }
                }
                for (let obj of this.visibleObjs)
                    obj.tick();
            }
        }
        lod.grid = grid;
        class obj extends toggle {
            constructor(counts = numbers.objs) {
                super();
                this.counts = counts;
                this.id = '';
                this.type = 'an obj';
                this.networked = false;
                this.wpos = [0, 0];
                this.rpos = [0, 0];
                this.size = [100, 100];
                this.ro = 0;
                this.z = 0; // z is only used by tiles
                this.height = 0;
                this.heightAdd = 0;
                this.counts[1]++;
            }
            finalize() {
                // this.hide();
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
                //this.delete();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.hide();
                // console.log(' obj.hide ');
            }
            wtorpos() {
                this.rpos = lod.project(this.wpos);
            }
            rtospos() {
                this.wtorpos();
                return pts.clone(this.rpos);
            }
            tick() {
            }
            create() {
                console.warn(' (lod) obj.create ');
            }
            // delete is never used
            delete() {
                // console.warn(' (lod) obj.delete ');
            }
            update() {
                var _a;
                this.wtorpos();
                (_a = this.shape) === null || _a === void 0 ? void 0 : _a.update();
            }
            is_type(types) {
                return types.indexOf(this.type) != -1;
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
                // this.hide();
                this.counts[1]--;
                this.bindObj.shape = null;
                //console.warn('finalize!');
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
                this.finalize();
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
        sprites.dwoodywalls = [[264, 40], [24, 40], 0, 'tex/8bit/dwoodywalls'];
        sprites.dplywoodwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dcommonwalls'];
        sprites.dovergrownwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dovergrownwalls'];
        sprites.dderingerwalls = [[264, 40], [24, 40], 0, 'tex/8bit/dderingerwalls'];
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
            this.dimetric = true;
            this.subsize = [0, 0];
            this.rup = 0;
            this.rup2 = 0;
            this.rleft = 0;
            this.calc = [0, 0];
            this.roffset = [0, 0];
            if (!this.vars.cell)
                this.vars.cell = [0, 0];
            if (!this.vars.orderBias)
                this.vars.orderBias = 0;
            if (!this.vars.opacity)
                this.vars.opacity = 1;
            this.myUvTransform = new THREE.Matrix3;
            this.myUvTransform.setUvTransform(0, 0, 1, 1, 0, 0, 1);
        }
        bound() {
            let size = this.vars.binded.size;
            if (pts.together(this.subsize))
                size = this.subsize;
            this.aabbScreen = new aabb2([0, 0], size);
            let calc = this.calc;
            calc = pts.subtract(calc, pts.divide(size, 2));
            this.aabbScreen.translate(calc);
        }
        mousedSquare(mouse) {
            var _a;
            if ((_a = this.aabbScreen) === null || _a === void 0 ? void 0 : _a.test(new aabb2(mouse, mouse)))
                return true;
        }
        dispose() {
            var _a, _b, _c;
            if (!this.mesh)
                return;
            (_a = this.geometry) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this.material) === null || _b === void 0 ? void 0 : _b.dispose();
            (_c = this.mesh.parent) === null || _c === void 0 ? void 0 : _c.remove(this.mesh);
        }
        update() {
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
            }
        }
        retransform() {
            this.myUvTransform.copy(sprites$1.get_uv_transform(this.vars.cell, this.vars.tuple));
        }
        create() {
            //console.log('create');
            var _a;
            this.vars.binded;
            this.retransform();
            this.geometry = new THREE.PlaneBufferGeometry(this.vars.binded.size[0], this.vars.binded.size[1]);
            let color;
            if (this.vars.binded.sector.color) {
                color = new THREE.Color(this.vars.binded.sector.color);
            }
            else {
                const c = this.vars.color || [255, 255, 255, 255];
                color = new THREE.Color(`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`);
            }
            this.material = SpriteMaterial({
                map: ren$1.load_texture(`${this.vars.tuple[3]}.png`, 0),
                transparent: true,
                color: color,
                opacity: this.vars.opacity
            }, {
                myUvTransform: this.myUvTransform
            });
            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.mesh.frustumCulled = false;
            this.mesh.matrixAutoUpdate = false;
            (_a = this.vars.binded.sector) === null || _a === void 0 ? void 0 : _a.group.add(this.mesh);
            ren$1.groups.axisSwap.add(this.mesh);
            this.update();
        }
    }
    function SpriteMaterial(parameters, uniforms) {
        let material = new THREE.MeshLambertMaterial(parameters);
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
            document.title = 'testing chamber';
            wastes.gview.zoom = 1;
            wastes.gview.wpos = [0, 0];
            wastes.gview.rpos = lod$1.unproject([0, 0]);
            hooks.register('sectorShow', (x) => {
                console.log('(testing chamber) show sector');
                return false;
            });
            hooks.register('viewRClick', (view) => {
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
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 20; x++) {
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
                let shape = new sprite({
                    binded: this,
                    tuple: sprites$1.test100
                });
                shape.dimetric = false;
            }
            tick() {
                let shape = this.shape;
                if (shape.mousedSquare(wastes.gview.mrpos))
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
                {
                    this.obj = new lod$1.obj();
                    this.obj.shape = new sprite({ binded: this.obj, tuple: sprites$1.asteroid });
                    //this.obj.show();
                    //let daisy = this.obj.shape as sprite;
                    //ren.scene.add(daisy.mesh);
                }
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

    var colormap;
    (function (colormap_1) {
        colormap_1.mapSpan = 100;
        class pixel {
            constructor(context, pos, arrayRef) {
                this.context = context;
                this.pos = pos;
                this.arrayRef = arrayRef;
                // Todo is array really a ref
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
                return this.is_color(pixel.arrayRef);
            }
            is_color(vec) {
                return vec[0] == this.arrayRef[0] && vec[1] == this.arrayRef[1] && vec[2] == this.arrayRef[2];
            }
            is_color_range(a, b) {
                return this.arrayRef[0] >= a[0] && this.arrayRef[0] <= b[0] &&
                    this.arrayRef[1] >= a[1] && this.arrayRef[1] <= b[1] &&
                    this.arrayRef[2] >= a[2] && this.arrayRef[2] <= b[2];
            }
            is_shallow_water() {
                return this.is_color([50, 50, 50]);
            }
            is_black() {
                return this.is_color([0, 0, 0]);
            }
            is_invalid_pixel() {
                return this.is_color([0, 0, 0]) && this.arrayRef[3] == 0;
            }
            is_white() {
                return this.is_color([255, 255, 255]);
            }
        }
        colormap_1.pixel = pixel;
        class colormap {
            constructor(id) {
                this.data = [];
                var img = document.getElementById(id);
                this.canvas = document.createElement('canvas');
                this.canvas.width = colormap_1.mapSpan;
                this.canvas.height = colormap_1.mapSpan;
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
                for (let y = 0; y < colormap_1.mapSpan; y++) {
                    this.data[y] = [];
                    for (let x = 0; x < colormap_1.mapSpan; x++) {
                        const data = this.ctx.getImageData(x, colormap_1.mapSpan - 1 - y, 1, 1).data;
                        //if (this.data[y] == undefined)
                        //	this.data[y] = [];
                        this.data[y][x] = data;
                    }
                }
            }
        }
        colormap_1.colormap = colormap;
    })(colormap || (colormap = {}));
    var colormap$1 = colormap;

    var shadows;
    (function (shadows) {
        // takes care of soft shadows cast by tree-leaves and walls
        const default_shade = 1.0;
        shadows.data = [];
        function shade(pos, amount, set = false) {
            if (!set)
                shadows.data[pos[1]][pos[0]] -= amount;
            else if (set && amount)
                shadows.data[pos[1]][pos[0]] = amount;
            if (shadows.data[pos[1]][pos[0]] < 0)
                shadows.data[pos[1]][pos[0]] = 0;
            const tile = tiles$1.get(pos);
            if (tile)
                tile.refresh = true;
        }
        shadows.shade = shade;
        function shade_matrix(pos, matrix, set = false) {
            for (let y = 0; y < matrix.length; y++) {
                for (let x = 0; x < matrix[y].length; x++) {
                    let negx = -Math.floor(matrix[y].length / 2) + x;
                    let negy = -Math.floor(matrix[y].length / 2) + y;
                    //console.log([negx, negy]);
                    let pos2 = pts.add(pos, [negx, negy]);
                    shade(pos2, matrix[y][x], set);
                    //shade
                }
            }
            tiles$1.get(pos).refresh = true;
        }
        shadows.shade_matrix = shade_matrix;
        function get_amount(pos) {
            if (shadows.data[pos[1]])
                return shadows.data[pos[1]][pos[0]] || 0;
            else
                return default_shade;
        }
        shadows.get_amount = get_amount;
        function calc(a, pos) {
            const n = get_amount(pos);
            let b = [a[0], a[1], a[2], a[3]];
            b[0] = a[0] * n;
            b[1] = a[1] * n;
            b[2] = a[2] * n;
            return b;
        }
        shadows.calc = calc;
        function start() {
            for (let y = 0; y < colormap$1.mapSpan; y++) {
                this.data[y] = [];
                for (let x = 0; x < colormap$1.mapSpan; x++) {
                    this.data[y][x] = default_shade;
                }
            }
        }
        shadows.start = start;
        function tick() {
        }
        shadows.tick = tick;
    })(shadows || (shadows = {}));
    var shadows$1 = shadows;

    var colors;
    (function (colors) {
        colors.color_door = [210, 210, 210];
        colors.color_wooden_door_and_deck = [24, 93, 61];
        colors.color_decidtree = [20, 70, 20];
        colors.color_deadtree = [60, 70, 60];
        colors.color_grass = [40, 90, 40];
        colors.color_wheat = [130, 130, 0];
        colors.color_scrappy_wall = [20, 70, 50];
        colors.color_woody_wall = [87, 57, 20];
        colors.color_fence = [89, 89, 58];
        colors.color_plywood_wall = [20, 84, 87];
        colors.color_overgrown_wall = [35, 105, 63];
        colors.color_deringer_wall = [80, 44, 27];
        colors.color_medieval_wall = [128, 128, 128];
        colors.color_scrappy_wall_with_deck = [20, 78, 54];
        colors.color_deck_and_roof = [114, 128, 124];
        colors.color_porch = [110, 120, 120];
        colors.color_rails = [110, 100, 120];
        colors.color_false_front = [255, 255, 255];
        colors.color_acid_barrel = [61, 118, 48];
        colors.color_wall_chest = [130, 100, 50];
        colors.color_shelves = [130, 80, 50];
        colors.color_panel = [78, 98, 98];
    })(colors || (colors = {}));
    var colors$1 = colors;

    var objects;
    (function (objects) {
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
            wastes.heightmap = new colormap$1.colormap('heightmap');
            wastes.objectmap = new colormap$1.colormap('objectmap');
            wastes.buildingmap = new colormap$1.colormap('buildingmap');
            wastes.treemap = new colormap$1.colormap('treemap');
            wastes.colormap = new colormap$1.colormap('colormap');
            wastes.roughmap = new colormap$1.colormap('roughmap');
            wastes.roofmap = new colormap$1.colormap('roofmap');
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.objectmap.pixel(pos);
                    if (pixel.is_color(colors$1.color_acid_barrel)) ;
                    else if (pixel.is_color(colors$1.color_wall_chest)) ;
                    else if (pixel.is_color(colors$1.color_shelves)) {
                        console.log('got shelves color');
                        //factory(objects.shelves, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_panel)) {
                        factory(objects.panel, pixel, pos);
                    }
                });
                return false;
            });
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.roofmap.pixel(pos);
                    if (pixel.is_color(colors$1.color_false_front)) ;
                });
                return false;
            });
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.treemap.pixel(pos);
                    if (pixel.is_color(colors$1.color_decidtree)) {
                        factory(objects.decidtree, pixel, pos, { type: 'decid' });
                    }
                    else if (pixel.is_color(colors$1.color_deadtree)) {
                        factory(objects.deadtree, pixel, pos);
                    }
                });
                return false;
            });
            hooks.register('sectorCreate', (sector) => {
                pts.func(sector.small, (pos) => {
                    let pixel = wastes.buildingmap.pixel(pos);
                    if (pixel.is_color(colors$1.color_plywood_wall)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.wall, pixel, pos, { type: 'plywood' });
                        factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_overgrown_wall)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.wall, pixel, pos, { type: 'overgrown' });
                        factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_deringer_wall)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.wall, pixel, pos, { type: 'sideroom' });
                        factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_medieval_wall)) {
                        factory(objects.wall, pixel, pos, { type: 'medieval' });
                    }
                    else if (pixel.is_color(colors$1.color_scrappy_wall)) {
                        factory(objects.wall, pixel, pos, { type: 'scrappy' });
                        //factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_fence)) ;
                    else if (pixel.is_color(colors$1.color_grass)) ;
                    else if (pixel.is_color(colors$1.color_wheat)) {
                        factory(objects.wheat, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_deck_and_roof)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_porch)) {
                        factory(objects.porch, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_rails)) {
                        factory(objects.rails, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_door)) {
                        factory(objects.deck, pixel, pos);
                        factory(objects.door, pixel, pos);
                        factory(objects.roof, pixel, pos);
                    }
                    else if (pixel.is_color(colors$1.color_wooden_door_and_deck)) {
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
        function tick() {
            if (app$1.key(' ') == 1) {
                wastes.HIDE_ROOFS = !wastes.HIDE_ROOFS;
                console.log('hide roofs', wastes.HIDE_ROOFS);
            }
        }
        objects.tick = tick;
        function is_solid(pos) {
            const impassable = ['wall', 'crate', 'shelves', 'tree', 'fence', 'deep water'];
            pos = pts.round(pos);
            if (tiles$1.get(pos) == undefined)
                return true;
            let sector = lod$1.gworld.at(lod$1.world.big(pos));
            let at = sector.stacked(pos);
            for (let obj of at) {
                if (obj.is_type(impassable)) {
                    return true;
                }
            }
            return false;
        }
        objects.is_solid = is_solid;
        class objected extends lod$1.obj {
            constructor(counts) {
                super(counts);
                this.id = 'an_objected_0';
                this.isObjected = true;
                this.paintTimer = 0;
                this.paintedRed = false;
                this.solid = true;
                this.cell = [0, 0];
                this.heightAdd = 0;
                this.calc = 0; // used for tree leaves
            }
            tiled() {
                this.tile = tiles$1.get(pts.round(this.wpos));
                this.tileBound = new aabb2([-.5, -.5], [.5, .5]);
                this.tileBound.translate(this.wpos);
            }
            onhit() {
                const sprite = this.shape;
                if (sprite) {
                    sprite.material.color.set('red');
                    this.paintedRed = true;
                }
            }
            nettick() {
            }
            tick() {
                if (this.paintedRed) {
                    this.paintTimer += ren$1.delta;
                    if (this.paintTimer > 1) {
                        const sprite = this.shape;
                        sprite.material.color.set('white');
                        console.log('beo');
                        this.paintedRed = false;
                        this.paintTimer = 0;
                    }
                }
                //console.log('oo');
            }
            //update(): void {
            //	this.tiled();
            //	super.update();
            //}
            stack(fallthru = []) {
                let calc = 0;
                let stack = this.sector.stacked(pts.round(this.wpos));
                for (let obj of stack) {
                    if (obj.is_type(fallthru))
                        continue;
                    if (obj == this)
                        break;
                    calc += obj.z + obj.height;
                }
                this.calc = calc;
                if (this.shape)
                    this.shape.rup = calc + this.heightAdd;
            }
            setup_context() {
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
                var _a, _b, _c, _d, _e, _f;
                this.tiled();
                this.size = [24, 40];
                this.cell = [255 - this.pixel.arrayRef[3], 0];
                let tuple = sprites$1.dscrappywalls;
                if (((_a = this.hints) === null || _a === void 0 ? void 0 : _a.type) == 'plywood')
                    tuple = sprites$1.dderingerwalls;
                if (((_b = this.hints) === null || _b === void 0 ? void 0 : _b.type) == 'overgrown')
                    tuple = sprites$1.dderingerwalls;
                if (((_c = this.hints) === null || _c === void 0 ? void 0 : _c.type) == 'deringer')
                    tuple = sprites$1.dderingerwalls;
                if (((_d = this.hints) === null || _d === void 0 ? void 0 : _d.type) == 'woody')
                    tuple = sprites$1.dwoodywalls;
                if (((_e = this.hints) === null || _e === void 0 ? void 0 : _e.type) == 'medieval')
                    tuple = sprites$1.dmedievalwalls;
                else if (((_f = this.hints) === null || _f === void 0 ? void 0 : _f.type) == 'ruddy')
                    tuple = sprites$1.druddywalls;
                else ;
                new sprite({
                    binded: this,
                    tuple: tuple,
                    cell: this.cell,
                    orderBias: 1.0,
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
            onhit() { }
            create() {
                this.tiled();
                this.tile.hasDeck = true;
                //this.tile!.z -= 24;
                this.size = [24, 17];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddeck,
                    cell: this.cell,
                    orderBias: .4,
                });
                this.stack();
            }
            tick() {
                super.tick();
                let pos = this.wpos;
                let sector = lod$1.gworld.at(lod$1.world.big(pos));
                let at = sector.stacked(pos);
                for (let obj of at) {
                    if (obj.type == 'you') {
                        wastes.HIDE_ROOFS = true;
                        break;
                    }
                }
            }
        }
        deck.timer = 0;
        objects.deck = deck;
        class porch extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'porch';
                this.height = 3;
            }
            onhit() { }
            create() {
                this.tiled();
                //this.tile!.z -= 24;
                this.size = [24, 17];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                let color = [255, 255, 255, 255];
                color = shadows$1.calc(color, this.wpos);
                new sprite({
                    binded: this,
                    tuple: sprites$1.dporch,
                    cell: this.cell,
                    orderBias: .0,
                    color: color
                });
                this.stack();
            }
        }
        porch.timer = 0;
        objects.porch = porch;
        class rails extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'porch';
                this.height = 3;
            }
            create() {
                this.tiled();
                //this.tile!.z -= 24;
                this.size = [24, 17];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.drails,
                    cell: this.cell,
                    orderBias: .4,
                });
                this.stack();
            }
            tick() {
            }
        }
        rails.timer = 0;
        objects.rails = rails;
        class deadtree extends objected {
            constructor() {
                super(numbers.floors);
                this.type = 'tree';
                this.height = 24;
            }
            create() {
                this.tiled();
                this.size = [24, 50];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddeadtreetrunk,
                    orderBias: 0.6,
                });
                this.stack();
            }
        }
        deadtree.timer = 0;
        objects.deadtree = deadtree;
        class decidtree extends objected {
            constructor() {
                super(numbers.trees);
                this.flowered = false;
                this.type = 'tree';
                this.height = 24;
            }
            create() {
                this.tiled();
                this.size = [24, 50];
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddecidtreetrunk,
                    orderBias: 0.6,
                });
                this.stack();
                const tile = tiles$1.get(this.wpos);
                if (!this.flowered) {
                    this.flowered = true;
                    for (let y = -1; y <= 1; y++)
                        for (let x = -1; x <= 1; x++)
                            if (!(x == 0 && y == 0))
                                factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [x, y]), {
                                    type: this.hints.type,
                                    tree: this,
                                    color: tile.color,
                                    grid: [x, y]
                                });
                    //factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
                    //factory(objects.treeleaves, this.pixel, pts.add(this.wpos, [0, 0]), { type: this.hints.type, color: tile.color, noVines: true });
                }
            }
        }
        objects.decidtree = decidtree;
        class treeleaves extends objected {
            constructor() {
                super(numbers.leaves);
                this.shaded = false;
                this.hasVines = false;
                this.type = 'leaves';
                this.height = 14;
                /*if (!this.hints.noVines || Math.random() > 0.5)
                    this.hasVines = true;*/
            }
            onhit() {
            }
            create() {
                let pixel = wastes.treemap.pixel(this.wpos);
                if (!this.hints.noVines && pixel.arrayRef[3] == 254)
                    this.hasVines = false; // true;
                if (pixel.arrayRef[3] == 253)
                    return;
                this.tiled();
                let tuple = sprites$1.dtreeleaves;
                if (this.hasVines) {
                    this.size = [24, 64];
                    const grid = this.hints.grid || [0, 0];
                    if (pts.equals(grid, [1, 0]) || pts.equals(grid, [1, 1])) {
                        tuple = sprites$1.dvines2;
                        //this.hints.color = [0, 0, 0, 255]
                        console.log(' !! using dvines 2 !!');
                    }
                    else if (pts.equals(grid, [0, -1]) || pts.equals(grid, [-1, -1])) {
                        tuple = sprites$1.dvines3;
                        //this.hints.color = [0, 0, 0, 255]
                    }
                    else {
                        tuple = sprites$1.dvines;
                    }
                }
                else {
                    this.size = [24, 31];
                }
                //this.try_create_vines();
                //if (this.pixel!.array[3] < 240)
                //	this.cell = [240 - this.pixel!.array[3], 0];
                let color = this.hints.color || [255, 255, 255, 255];
                let color2 = wastes.colormap.pixel(this.wpos);
                if (!(255 - color2.arrayRef[3])) {
                    if (this.hints.color) {
                        color = [
                            Math.floor(color[0] * 1.6),
                            Math.floor(color[1] * 1.6),
                            Math.floor(color[2] * 1.6),
                            color[3],
                        ];
                    }
                    new sprite({
                        binded: this,
                        tuple: tuple,
                        orderBias: 0.7,
                        color: color
                    });
                    //shadows.shade(this.wpos, 0.1);
                    if (!this.shaded) {
                        this.shaded = true;
                        const shadow = 0.03;
                        shadows$1.shade_matrix(this.wpos, [
                            [shadow / 2, shadow, shadow / 2],
                            [shadow, shadow, shadow],
                            [shadow / 2, shadow, shadow / 2]
                        ]);
                    }
                    if (this.hints.tree)
                        this.special_leaves_stack();
                    else
                        this.stack();
                }
            }
            special_leaves_stack() {
                //console.log('special stack');
                const tree = this.hints.tree;
                if (this.shape) {
                    const sprite = this.shape;
                    this.z = tree.calc + tree.height;
                    sprite.rup = this.z;
                    if (this.hasVines) {
                        sprite.rup2 = -33;
                    }
                }
            }
        }
        objects.treeleaves = treeleaves;
        class grass extends objected {
            constructor() {
                super(numbers.roofs);
                this.type = 'grass';
                this.height = 4;
                this.solid = false;
            }
            create() {
                this.tiled();
                this.size = [24, 30];
                let color = tiles$1.get(this.wpos).color;
                color = [
                    Math.floor(color[0] * 1.5),
                    Math.floor(color[1] * 1.5),
                    Math.floor(color[2] * 2.0),
                    color[3],
                ];
                this.cell = [255 - this.pixel.arrayRef[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dgrass,
                    cell: this.cell,
                    orderBias: .6,
                    color: color
                });
                this.stack();
            }
        }
        objects.grass = grass;
        class wheat extends objected {
            constructor() {
                super(numbers.roofs);
                this.type = 'wheat';
                this.height = 4;
            }
            create() {
                this.tiled();
                this.size = [24, 30];
                //let color =  tiles.get(this.wpos)!.color;
                //this.cell = [Math.floor(Math.random() * 2), 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dwheat,
                    cell: this.cell,
                    //color: color,
                    orderBias: .6
                });
                this.stack();
            }
        }
        objects.wheat = wheat;
        class panel extends objected {
            constructor() {
                super(numbers.roofs);
                this.ticker = 0;
                this.type = 'panel';
                this.height = 10;
            }
            create() {
                this.tiled();
                this.size = [8, 10];
                //let color =  tiles.get(this.wpos)!.color;
                //this.cell = [Math.floor(Math.random() * 2), 0];
                return;
            }
            tick() {
                return;
                //console.log('boo');
            }
        }
        objects.panel = panel;
        class container {
            constructor() {
                this.tuples = [];
                if (Math.random() > .5)
                    this.add('beer');
                if (Math.random() > .5)
                    this.add('string');
                if (Math.random() > .5)
                    this.add('stone');
            }
            get(name) {
                for (const tuple of this.tuples)
                    if (tuple[0] == name)
                        return tuple;
            }
            add(name) {
                let tuple = this.get(name);
                if (tuple)
                    tuple[1] += 1;
                else
                    this.tuples.push([name, 1]);
                this.tuples.sort();
            }
            remove(name) {
                for (let i = this.tuples.length - 1; i >= 0; i--) {
                    const tuple = this.tuples[i];
                    if (tuple[0] == name) {
                        tuple[1] -= 1;
                        if (tuple[1] <= 0)
                            this.tuples.splice(i, 1);
                        break;
                    }
                }
            }
        }
        objects.container = container;
        class crate extends objected {
            constructor() {
                super(numbers.objs);
                this.mousing = false;
                this.type = 'crate';
                this.height = 17;
            }
            create() {
                this.tiled();
                this.size = [24, 40];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dcrate,
                    cell: this.cell,
                    orderBias: 1.0
                });
                this.stack(['roof', 'wall']);
            }
            tick() {
                const sprite = this.shape;
                if (!sprite)
                    return;
                if (sprite.mousedSquare(wastes.gview.mrpos) /*&& !this.mousing*/) {
                    this.mousing = true;
                    sprite.material.color.set('#c1ffcd');
                    console.log('mover');
                    win$1.contextmenu.focus = this;
                }
                else if (!sprite.mousedSquare(wastes.gview.mrpos) && this.mousing) {
                    if (win$1.contextmenu.focus == this)
                        win$1.contextmenu.focus = undefined;
                    sprite.material.color.set('white');
                    this.mousing = false;
                }
            }
            setup_context() {
                console.log('setup context');
                win$1.contextmenu.reset();
                win$1.contextmenu.options.options.push(["See contents", () => {
                        return pts.distsimple(pawns$1.you.wpos, this.wpos) < 1;
                    }, () => {
                        win$1.container.focus = this;
                        win$1.container.call_once();
                    }]);
            }
        }
        objects.crate = crate;
        class shelves extends objected {
            constructor() {
                super(numbers.objs);
                this.container = new container;
                this.mousing = false;
                this.type = 'shelves';
                this.height = 25;
                this.container.obj = this;
            }
            create() {
                this.tiled();
                this.size = [20, 31];
                //this.cell = [255 - this.pixel!.array[3], 0];
                //return
                new sprite({
                    binded: this,
                    tuple: sprites$1.dshelves,
                    //cell: this.cell,
                    orderBias: 1.0
                });
                //shape.rup2 = 9;
                //shape.rleft = 6;
                this.stack(['roof', 'wall']);
            }
            tick() {
                const sprite = this.shape;
                if (sprite.mousedSquare(wastes.gview.mrpos) /*&& !this.mousing*/) {
                    this.mousing = true;
                    sprite.material.color.set('#c1ffcd');
                    win$1.contextmenu.focus = this;
                }
                else if (!sprite.mousedSquare(wastes.gview.mrpos) && this.mousing) {
                    if (win$1.contextmenu.focus == this)
                        win$1.contextmenu.focus = undefined;
                    sprite.material.color.set('white');
                    this.mousing = false;
                }
            }
            setup_context() {
                console.log('setup context');
                win$1.contextmenu.reset();
                win$1.contextmenu.options.options.push(["See contents", () => {
                        return pts.distsimple(pawns$1.you.wpos, this.wpos) < 1;
                    }, () => {
                        win$1.container.focus = this;
                        win$1.container.call_once();
                    }]);
                win$1.contextmenu.options.options.push(["Store", () => {
                        return pts.distsimple(pawns$1.you.wpos, this.wpos) < 1;
                    }, () => {
                        //win.container.crate = this;
                        //win.container.call_once();
                    }]);
                win$1.contextmenu.options.options.push(["Examine", () => {
                        return pts.distsimple(pawns$1.you.wpos, this.wpos) < 10;
                    }, () => {
                        win$1.descriptor.focus = this;
                        win$1.descriptor.call_once("A shelves with not much on it.");
                    }]);
            }
        }
        objects.shelves = shelves;
        class roof extends objected {
            constructor() {
                super(numbers.roofs);
                this.shaded = false;
                this.type = 'roof';
                this.height = 3;
            }
            onhit() { }
            create() {
                //return;
                this.tiled();
                this.size = [24, 17];
                let shape = new sprite({
                    binded: this,
                    tuple: sprites$1.droof,
                    orderBias: 1.6,
                });
                shape.rup = 29;
                if (!this.shaded) {
                    this.shaded = true;
                    const shadow = .75;
                    shadows$1.shade_matrix(this.wpos, [
                        [0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0],
                        [0, 0, 0, 0, 0],
                        [0, 0, 0, shadow, 0],
                        [0, 0, 0, 0, shadow]
                    ], true);
                }
            }
            tick() {
                super.tick();
                const sprite = this.shape;
                if (!sprite)
                    return;
                if (wastes.HIDE_ROOFS)
                    sprite.mesh.visible = false;
                else if (!wastes.HIDE_ROOFS)
                    sprite.mesh.visible = true;
            }
        }
        objects.roof = roof;
        class falsefront extends objected {
            constructor() {
                super(numbers.roofs);
                this.type = 'falsefront';
                this.height = 5;
            }
            create() {
                this.tiled();
                this.cell = [255 - this.pixel.arrayRef[3], 0];
                this.size = [24, 40];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dfalsefronts,
                    cell: this.cell,
                    orderBias: 1.6,
                });
                this.stack();
                //this.z = 29+4;
            }
            tick() {
                const sprite = this.shape;
                if (!sprite)
                    return;
                if (wastes.HIDE_ROOFS)
                    sprite.mesh.visible = false;
                else if (!wastes.HIDE_ROOFS)
                    sprite.mesh.visible = true;
            }
        }
        objects.falsefront = falsefront;
        class acidbarrel extends objected {
            constructor() {
                super(numbers.objs);
                this.type = 'acidbarrel';
                this.height = 4;
            }
            create() {
                this.tiled();
                this.size = [24, 35];
                new sprite({
                    binded: this,
                    tuple: sprites$1.dacidbarrel,
                    orderBias: .4,
                });
                this.stack();
            }
        }
        objects.acidbarrel = acidbarrel;
        class door extends objected {
            constructor() {
                super(numbers.walls);
                this.open = false;
                this.type = 'door';
                this.height = 23;
            }
            create() {
                this.tiled();
                this.size = [24, 40];
                this.cell = [255 - this.pixel.arrayRef[3], 0];
                new sprite({
                    binded: this,
                    tuple: sprites$1.ddoor,
                    cell: this.cell,
                    orderBias: door.order,
                });
                this.stack();
            }
            tick() {
                super.tick();
                if (!this.shape)
                    return;
                let pos = this.wpos;
                let sector = lod$1.gworld.at(lod$1.world.big(pos));
                let at = sector.stacked(pos);
                let pawning = false;
                for (let obj of at) {
                    if (obj.is_type(['pawn', 'you'])) {
                        pawning = true;
                        let sprite = this.shape;
                        sprite.vars.cell = pts.subtract(this.cell, [1, 0]);
                        sprite.vars.orderBias = 1.55;
                        sprite.retransform();
                        sprite.update();
                        this.open = true;
                        break;
                    }
                }
                if (!pawning) {
                    let sprite = this.shape;
                    sprite.vars.cell = this.cell;
                    sprite.vars.orderBias = door.order;
                    sprite.retransform();
                    sprite.update();
                    this.open = false;
                }
            }
        }
        door.order = .7;
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
                    orderBias: .5
                });
            }
        }
        objects.shrubs = shrubs;
    })(objects || (objects = {}));
    var objects$1 = objects;

    var win;
    (function (win_1) {
        var win;
        var toggle_character = false;
        win_1.genericHovering = false;
        win_1.started = false;
        function start() {
            win_1.started = true;
            win = document.getElementById('win');
            contextmenu.init();
            container.init();
            trader.init();
            dialogue.init();
            setTimeout(() => {
                //message.message("Welcome", 1000);
            }, 1000);
        }
        win_1.start = start;
        function tick() {
            if (!win_1.started)
                return;
            if (app$1.key('c') == 1) {
                toggle_character = !toggle_character;
                character.call_once(toggle_character);
            }
            if (app$1.key('b') == 1) ;
            you.tick();
            character.tick();
            container.tick();
            dialogue.tick();
            contextmenu.tick();
            message.tick();
            descriptor.tick();
            trader.tick();
        }
        win_1.tick = tick;
        class modal {
            constructor(title) {
                this.element = document.createElement('div');
                this.element.className = 'modal';
                this.element.onmouseover = () => { this.hovering = true; win_1.genericHovering = true; };
                this.element.onmouseleave = () => { this.hovering = false; win_1.genericHovering = false; };
                //this.element.append('inventory')
                if (title) {
                    this.title = document.createElement('div');
                    this.title.innerHTML = title;
                    this.title.className = 'title';
                    this.element.append(this.title);
                }
                this.content = document.createElement('div');
                this.content.className = 'content';
                this.content.innerHTML = 'content';
                this.element.append(this.content);
                win.append(this.element);
            }
            update(title) {
                if (title)
                    this.title.innerHTML = title;
            }
            reposition(pos) {
                const round = pts.floor(pos);
                this.element.style.top = round[1];
                this.element.style.left = round[0];
            }
            deletor() {
                this.element.remove();
            }
            float(anchor, add = [0, 0]) {
                //let pos = this.anchor.rtospos([-1.5, 2.5]);
                let pos = anchor.rtospos();
                pos = pts.add(pos, add);
                pos = pts.add(pos, pts.divide(anchor.size, 2));
                //pos = pts.add(pos, this.anchor.size);
                //let pos = this.anchor.aabbScreen.center();
                //let pos = lod.project(wastes.gview.mwpos);
                pos = pts.subtract(pos, wastes.gview.rpos);
                pos = pts.divide(pos, wastes.gview.zoom);
                pos = pts.divide(pos, ren$1.ndpi);
                //pos = pts.add(pos, pts.divide(ren.screenCorrected, 2));
                //pos[1] -= ren.screenCorrected[1] / 2;
                this.reposition([ren$1.screen[0] / 2 + pos[0], ren$1.screen[1] / 2 - pos[1]]);
            }
        }
        class trader {
            static hover_money_label_here() {
            }
            static init() {
                hooks.register('viewRClick', (view) => {
                    // We right click outside
                    if (trader.modal && !trader.modal.hovering) {
                        trader.end();
                    }
                    return false;
                });
            }
            static end() {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.tradeWithCur = undefined;
                this.traderInventoryElement = undefined;
                this.yourInventoryElement = undefined;
            }
            static call_once() {
                if (this.tradeWith && this.tradeWithCur != this.tradeWith) {
                    trader.end();
                }
                if (!this.modal) {
                    this.modal = new modal('trader');
                    this.modal.content.innerHTML = `buy:<br />`;
                    this.modal.content.onmouseover = () => { win_1.genericHovering = true; };
                    this.modal.content.onmouseleave = () => { win_1.genericHovering = false; };
                    this.tradeWithCur = this.tradeWith;
                    this.render_trader_inventory(true);
                    let next = document.createElement('span');
                    next.innerHTML += '<hr>sell:<br />';
                    this.modal.content.append(next);
                    this.render_your_inventory(true);
                }
            }
            static render_trader_inventory(force) {
                var _a;
                if (!this.traderInventoryElement) {
                    this.traderInventoryElement = document.createElement('div');
                    this.traderInventoryElement.className = 'inventory';
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.content.append(this.traderInventoryElement);
                }
                let pawn = this.tradeWithCur;
                const inventory = pawn.inventory;
                if (inventory && this.traderStamp != inventory.stamp || force) {
                    console.log('refresh trader inven');
                    this.traderInventoryElement.innerHTML = ``;
                    for (let tuple of inventory.tuples) {
                        if (tuple[0] == 'money')
                            continue;
                        let button = document.createElement('div');
                        //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                        button.innerHTML += tuple[0];
                        button.className = 'item';
                        if (tuple[1] > 1) {
                            button.innerHTML += ` <span>×${tuple[1]}</span>`;
                        }
                        button.onclick = () => {
                            client.wantToBuy = tuple[0];
                        };
                        let extra = document.createElement('span');
                        button.append(extra);
                        const rate = client.get_rate(tuple[0]) || ['', 0, 0];
                        let buy = rate[1];
                        extra.innerHTML = `&nbsp; - ${buy}ct`;
                        this.traderInventoryElement.append(button);
                        this.traderStamp = inventory.stamp;
                    }
                }
            }
            static render_your_inventory(force) {
                var _a;
                if (!this.yourInventoryElement) {
                    this.yourInventoryElement = document.createElement('div');
                    this.yourInventoryElement.className = 'inventory';
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.content.append(this.yourInventoryElement);
                }
                let you = pawns$1.you;
                const inventory = you.inventory;
                if (inventory && this.yourStamp != inventory.stamp || force) {
                    this.yourInventoryElement.innerHTML = ``;
                    for (let tuple of inventory.tuples) {
                        if (tuple[0] == 'money')
                            continue;
                        let button = document.createElement('div');
                        //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                        button.innerHTML += tuple[0];
                        button.className = 'item';
                        if (tuple[1] > 1) {
                            button.innerHTML += ` <span>×${tuple[1]}</span>`;
                        }
                        button.onclick = () => {
                            client.wantToSell = tuple[0];
                        };
                        let extra = document.createElement('span');
                        button.append(extra);
                        const rate = client.get_rate(tuple[0]) || ['', 0, 0];
                        let sell = rate[2];
                        extra.innerHTML = `&nbsp; - ${sell}ct`;
                        this.yourInventoryElement.append(button);
                        this.yourStamp = inventory.stamp;
                    }
                    let money = 0;
                    for (let tuple of inventory.tuples)
                        if (tuple[0] == 'money') {
                            money = tuple[1];
                            break;
                        }
                    let next = document.createElement('div');
                    next.innerHTML += `your money: ${money}<br />`;
                    this.yourInventoryElement.append(next);
                }
            }
            static tick() {
                if (this.tradeWithCur && pts.distsimple(this.tradeWithCur.wpos, pawns$1.you.wpos) > 1) {
                    trader.end();
                }
                if (this.modal) {
                    this.modal.float(this.tradeWithCur, [0, 0]);
                    this.render_trader_inventory(false);
                    this.render_your_inventory(false);
                }
            }
        }
        trader.traderStamp = 0;
        trader.yourStamp = 0;
        win_1.trader = trader;
        class character {
            static render_inventory(force) {
                var _a;
                if (!this.inventoryElement) {
                    this.inventoryElement = document.createElement('div');
                    this.inventoryElement.className = 'inventory';
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.content.append(character.inventoryElement);
                }
                const inventory = pawns$1.you.inventory;
                if (!inventory)
                    return;
                if (inventory && this.inventoryStamp != inventory.stamp || force) {
                    this.inventoryElement.innerHTML = ``;
                    console.log('yes', inventory.tuples);
                    //console.log(inventory);
                    for (let tuple of inventory.tuples) {
                        let button = document.createElement('div');
                        //button.innerHTML = `<img width="20" height="20" src="tex/items/${tuple[0]}.png">`;
                        button.innerHTML += tuple[0];
                        if (tuple[1] > 1) {
                            button.innerHTML += ` <span>×${tuple[1]}</span>`;
                        }
                        button.className = 'item';
                        this.inventoryElement.append(button);
                        this.inventoryStamp = inventory.stamp;
                    }
                }
            }
            static call_once(open) {
                var _a;
                this.open = open;
                if (open && !this.modal) {
                    this.modal = new modal('you');
                    //this.modal.reposition(['100px', '30%']);
                    this.modal.content.innerHTML = 'stats:<br />effectiveness: 100%<br /><hr>';
                    this.modal.content.innerHTML += 'inventory:<br />';
                    //inventory
                    this.render_inventory(true);
                    let next = document.createElement('p');
                    next.innerHTML += '<hr>guns:<br />';
                    if (pawns$1.you.gun)
                        next.innerHTML += `<img class="gun" src="tex/guns/${pawns$1.you.gun}.png">`;
                    this.modal.content.append(next);
                }
                else if (!open && this.modal) {
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                    this.modal = undefined;
                    this.inventoryElement = undefined;
                }
            }
            static tick() {
                var _a;
                if (this.open) {
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.float(pawns$1.you, [15, 20]);
                    this.render_inventory(false);
                }
            }
        }
        character.open = false;
        character.inventoryStamp = 0;
        win_1.character = character;
        class you {
            static call(open) {
                var _a;
                if (open && !this.modal) {
                    this.modal = new modal('you');
                    this.modal.element.classList.add('you');
                    this.modal.content.remove();
                }
                else if (!open && this.modal) {
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                    this.modal = undefined;
                }
            }
            static tick() {
                if (pawns$1.you && !pawns$1.you.isActive()) {
                    this.call(true);
                    this.modal.float(pawns$1.you, [-5, 5]);
                    console.log('call and float');
                }
                else {
                    this.call(false);
                }
            }
        }
        win_1.you = you;
        class contextmenu {
            static reset() {
                this.buttons = [];
                this.options.options = [];
            }
            static end_close_others() {
                trader.end();
                dialogue.end();
                win_1.genericHovering = false;
            }
            static end() {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.focusCur = undefined;
                win_1.genericHovering = false;
            }
            static init() {
                hooks.register('viewMClick', (view) => {
                    var _a;
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                    this.modal = undefined;
                    this.focus = undefined;
                    return false;
                });
                hooks.register('viewRClick', (view) => {
                    console.log('contextmenu on ?', this.focus);
                    // We have a focus, but no window! This is the easiest scenario.
                    if (this.focus && !this.modal) {
                        this.focus.setup_context();
                        this.focusCur = this.focus;
                        this.call_once();
                    }
                    // We click away from any sprites and we have a menu open: break it
                    else if (!this.focus && this.modal) {
                        contextmenu.end();
                    }
                    // We clicked on the already focussed sprite: break it
                    else if (this.modal && this.focus && this.focus == this.focusCur) {
                        contextmenu.end();
                    }
                    // We have an open modal, but focus on a different sprite: recreate it
                    else if (this.modal && this.focus && this.focus != this.focusCur) {
                        this.end();
                        this.focus.setup_context();
                        this.focusCur = this.focus;
                        this.call_once();
                    }
                    //else {
                    //	this.modal?.deletor();
                    //	this.focusCur = undefined;
                    //}
                    return false;
                });
            }
            static destroy() {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                //this.focusCur = undefined;
            }
            static call_once() {
                this.end_close_others();
                this.modal = new modal(this.focus.type);
                this.modal.content.innerHTML = '';
                this.modal.element.classList.add('contextmenu');
                for (let option of this.options.options) {
                    let button = document.createElement('div');
                    button.innerHTML = option[0] + "&nbsp;";
                    //if (tuple[1] > 1) {
                    //	button.innerHTML += ` <span>×${tuple[1]}</span>`
                    //}
                    button.className = 'option';
                    button.onclick = (e) => {
                        var _a;
                        if (option[1]()) {
                            (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                            this.modal = undefined;
                            win_1.genericHovering = false;
                            option[2]();
                        }
                    };
                    button.onmouseover = () => { win_1.genericHovering = true; };
                    button.onmouseleave = () => { win_1.genericHovering = false; };
                    this.modal.content.append(button);
                    this.buttons.push([button, option]);
                }
            }
            static update() {
                //console.log('focusCur', this.focusCur);
                for (let button of this.buttons) {
                    const element = button[0];
                    const option = button[1];
                    if (!option[1]()) {
                        element.classList.add('disabled');
                    }
                    else {
                        element.classList.remove('disabled');
                    }
                }
            }
            static tick() {
                if (this.modal && this.focusCur) {
                    this.update();
                    this.modal.float(this.focusCur, [0, 0]);
                }
            }
        }
        contextmenu.buttons = [];
        contextmenu.options = { options: [] };
        win_1.contextmenu = contextmenu;
        class descriptor {
            static call_once(text = 'Examined') {
                if (this.modal !== undefined) {
                    this.modal.deletor();
                    this.modal = undefined;
                }
                if (this.modal == undefined) {
                    this.modal = new modal('descriptor');
                    this.modal.title.remove();
                    //this.modal.content.remove();
                    this.modal.content.innerHTML = text;
                    this.focusCur = this.focus;
                    this.timer = Date.now();
                }
            }
            static tick() {
                var _a;
                if (this.modal !== undefined) {
                    this.modal.float(this.focusCur, [0, 0]);
                }
                if (Date.now() - this.timer > 3 * 1000) {
                    (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                    this.modal = undefined;
                }
            }
        }
        descriptor.timer = 0;
        win_1.descriptor = descriptor;
        class dialogue {
            static init() {
                hooks.register('viewRClick', (view) => {
                    // We right clickd outside
                    if (dialogue.modal && !dialogue.modal.hovering)
                        dialogue.end();
                    return false;
                });
            }
            static call_once() {
                // We wish to talk to a different pawn
                if (this.talkingTo != this.talkingToCur) {
                    this.end();
                }
                if (this.talkingTo && !this.modal) {
                    this.talkingToCur = this.talkingTo;
                    this.modal = new modal();
                    this.where[1] = 0;
                    this.change();
                }
            }
            static end() {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.talkingToCur = undefined;
                win_1.genericHovering = false;
            }
            static change() {
                this.modal.content.innerHTML = this.talkingToCur.dialogue[this.where[1]][0] + "&nbsp;";
                this.modal.content.onmouseover = () => { win_1.genericHovering = true; };
                this.modal.content.onmouseleave = () => { win_1.genericHovering = false; };
                const next = this.talkingToCur.dialogue[this.where[1]][1];
                if (next != -1) {
                    let button = document.createElement('div');
                    button.innerHTML = '>>';
                    button.className = 'button';
                    this.modal.content.append(button);
                    button.onclick = (e) => {
                        console.log('woo');
                        this.where[1] = next;
                        win_1.genericHovering = false;
                        this.change();
                        //button.remove();
                    };
                }
            }
            static tick() {
                if (this.modal && this.talkingToCur) {
                    this.modal.float(this.talkingToCur, [0, 10]);
                }
                if (this.talkingToCur && pts.distsimple(pawns$1.you.wpos, this.talkingToCur.wpos) > 1) {
                    this.end();
                }
            }
        }
        dialogue.where = [0, 0];
        win_1.dialogue = dialogue;
        class container {
            static init() {
                hooks.register('viewRClick', (view) => {
                    // We right clickd outside
                    if (container.modal && !container.modal.hovering) {
                        container.end();
                    }
                    return false;
                });
            }
            static end() {
                var _a;
                (_a = this.modal) === null || _a === void 0 ? void 0 : _a.deletor();
                this.modal = undefined;
                this.focusCur = undefined;
                this.inventoryElement = undefined;
            }
            static update_inventory_view(force) {
                if (!this.modal)
                    return;
                if (!this.inventoryElement) {
                    this.inventoryElement = document.createElement('div');
                    this.inventoryElement.className = 'inventory';
                    this.modal.content.append(this.inventoryElement);
                }
                const cast = this.focus;
                const inventory = cast.inventory;
                if (this.stamp != inventory.stamp || force) {
                    this.stamp = inventory.stamp;
                    this.inventoryElement.innerHTML = ``;
                    for (let tuple of inventory.tuples) {
                        let item = document.createElement('div');
                        item.innerHTML = tuple[0];
                        if (tuple[1] > 1) {
                            item.innerHTML += ` <span>×${tuple[1]}</span>`;
                        }
                        item.className = 'item';
                        this.inventoryElement.append(item);
                        item.onclick = (e) => {
                            console.log('clicked');
                            client.wantToGrab = [cast.id, tuple[0]];
                            //cast.inventory.remove(tuple[0]);
                            //pawns.you?.inventory.add(tuple[0]);
                        };
                        //item.onmouseover = () => { hoveringClickableElement = true; }
                        //item.onmouseleave = () => { hoveringClickableElement = false; }
                        //this.modal.content.innerHTML += item + '<br />';
                    }
                }
            }
            static call_once() {
                // We are trying to open a different container
                if (this.modal !== undefined) {
                    this.end();
                }
                if (this.focus) {
                    this.focusCur = this.focus;
                    this.modal = new modal('container');
                    this.modal.content.innerHTML = '';
                    this.update_inventory_view(true);
                }
            }
            static tick() {
                if (this.modal && this.focusCur) {
                    this.modal.float(this.focusCur);
                    this.update_inventory_view(false);
                }
                if (this.focusCur && pts.distsimple(pawns$1.you.wpos, this.focusCur.wpos) > 1) {
                    this.end();
                }
            }
        }
        //static obj?: lod.obj
        container.stamp = 0;
        win_1.container = container;
        class areatag {
            static call(open, area, refresh = false) {
                if (open) {
                    console.log('boo');
                    let element = document.createElement('div');
                    element.className = 'area';
                    element.innerHTML = ` ${(area === null || area === void 0 ? void 0 : area.name) || ''} `;
                    win.append(element);
                    setTimeout(() => {
                        element.classList.add('fade');
                        setTimeout(() => {
                            element.remove();
                        }, 3000);
                    }, 1000);
                }
            }
        }
        win_1.areatag = areatag;
        class message {
            constructor() {
                this.duration = 5;
            }
            static message(message, duration) {
                this.messages.push({ message: message, duration: duration });
            }
            static tick() {
                if (this.messages.length) {
                    let shift = this.messages.shift();
                    let element = document.createElement('div');
                    element.className = 'message';
                    element.innerHTML = shift.message;
                    document.getElementById('messages').append(element);
                    setTimeout(() => {
                        element.classList.add('fade');
                    }, shift.duration);
                    setTimeout(() => {
                        element.remove();
                    }, shift.duration + 2000);
                }
            }
        }
        message.messages = [];
        win_1.message = message;
    })(win || (win = {}));
    var win$1 = win;

    // allows you to venture far from inclusion hell by letting you assign arbitrary values
    var GLOB = {};

    var chickens;
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
        class chicken extends objects$1.objected {
            constructor() {
                super(numbers.chickens);
                this.netwpos = [0, 0];
                this.netangle = 0;
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
                this.tiled();
                this.size = pts.divide([25, 30], 1);
                //this.subsize = [25, 40];
                let shape = new sprite({
                    binded: this,
                    tuple: sprites$1.test100,
                    //opacity: 0.5,
                    orderBias: 1.0,
                });
                shape.dimetric = false;
                shape.rleft = this.size[0] / 2;
                shape.rup2 = this.size[1] / 2;
                shape.show();
                if (!this.created) {
                    this.created = true;
                    //console.log('creating chicken');
                    // Set scale to increase pixels exponentially
                    const scale = 1;
                    // make wee guy target
                    //this.group = new THREE.Group
                    let size = pts.mult(this.size, scale);
                    this.target = ren$1.make_render_target(size[0], size[1]);
                    this.camera = ren$1.make_orthographic_camera(size[0], size[1]);
                    this.scene = new THREE.Scene();
                    //this.scene.background = new Color('#333');
                    this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
                    this.scene.scale.set(scale, scale, scale);
                    this.scene.add(new THREE.AmbientLight('white'));
                    let sun = new THREE.DirectionalLight(0xffffff, 0.5);
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
                if (!objects$1.is_solid(venture))
                    this.wpos = venture;
            }
            update() {
                this.tiled();
                //this.stack();
                super.update();
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
                let boxHead = new THREE.BoxGeometry(headWidth, headHeight, headLength);
                let materialHead = new THREE.MeshLambertMaterial({
                    color: '#787a7a'
                });
                let boxComb = new THREE.BoxGeometry(combWidth, combHeight, combLength);
                let materialComb = new THREE.MeshLambertMaterial({
                    color: '#a52c2c'
                });
                let boxBeak = new THREE.BoxGeometry(beakWidth, beakHeight, beakLength);
                let materialBeak = new THREE.MeshLambertMaterial({
                    color: '#7f805f'
                });
                let boxBody = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength);
                let materialBody = new THREE.MeshLambertMaterial({
                    color: '#787a7a'
                });
                let boxArms = new THREE.BoxGeometry(armsWidth, armsHeight, armsLength);
                let materialArms = new THREE.MeshLambertMaterial({
                    color: '#787a7a'
                });
                let boxLegs = new THREE.BoxGeometry(legsWidth, legsHeight, legsLength);
                let boxFeet = new THREE.BoxGeometry(feetWidth, feetHeight, feetLength);
                let materialLegs = new THREE.MeshLambertMaterial({
                    color: '#7f805f'
                });
                let planeWater = new THREE.PlaneGeometry(wastes.size * 2, wastes.size * 2);
                let materialWater = new THREE.MeshLambertMaterial({
                    color: new THREE__default["default"].Color('rgba(32, 64, 64, 255)'),
                    opacity: 0.4,
                    transparent: true,
                    blending: THREE__default["default"].CustomBlending,
                    blendEquation: THREE__default["default"].AddEquation,
                    blendSrc: THREE__default["default"].DstAlphaFactor,
                    blendDst: THREE__default["default"].OneMinusSrcAlphaFactor
                });
                this.meshes.water = new THREE.Mesh(planeWater, materialWater);
                this.meshes.water.rotation.x = -Math.PI / 2;
                this.meshes.water.position.y = -bodyHeight * 1.5;
                this.meshes.water.visible = false;
                this.meshes.head = new THREE.Mesh(boxHead, materialHead);
                this.meshes.comb = new THREE.Mesh(boxComb, materialComb);
                this.meshes.beak = new THREE.Mesh(boxBeak, materialBeak);
                this.meshes.body = new THREE.Mesh(boxBody, materialBody);
                this.meshes.arml = new THREE.Mesh(boxArms, materialArms);
                this.meshes.armr = new THREE.Mesh(boxArms, materialArms);
                this.meshes.legl = new THREE.Mesh(boxLegs, materialLegs);
                this.meshes.legr = new THREE.Mesh(boxLegs, materialLegs);
                this.meshes.footl = new THREE.Mesh(boxFeet, materialLegs);
                this.meshes.footr = new THREE.Mesh(boxFeet, materialLegs);
                this.groups.neck = new THREE.Group;
                this.groups.head = new THREE.Group;
                this.groups.beak = new THREE.Group;
                this.groups.comb = new THREE.Group;
                this.groups.body = new THREE.Group;
                this.groups.arml = new THREE.Group;
                this.groups.armr = new THREE.Group;
                this.groups.legl = new THREE.Group;
                this.groups.legr = new THREE.Group;
                this.groups.footl = new THREE.Group;
                this.groups.footr = new THREE.Group;
                this.groups.ground = new THREE.Group;
                this.groups.basis = new THREE.Group;
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
                this.groups.ground.position.set(0, -bodyHeight * 3, 0);
                //mesh.rotation.set(Math.PI / 2, 0, 0);
                this.scene.add(this.groups.basis);
            }
            render() {
                ren$1.renderer.setRenderTarget(this.target);
                ren$1.renderer.clear();
                ren$1.renderer.render(this.scene, this.camera);
            }
            animateBodyParts() {
                var _a;
                this.walkSmoother = wastes.clamp(this.walkSmoother, 0, 1);
                const legsSwoop = 0.6;
                const headBob = 1.0;
                const riser = 0.5;
                this.swoop += ren$1.delta * 2.5;
                const swoop1 = Math.cos(Math.PI * this.swoop);
                const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);
                this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
                this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
                //this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
                //this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
                this.groups.head.position.z = swoop1 * swoop2 * -headBob * this.walkSmoother;
                this.groups.ground.position.y = -10 + swoop1 * swoop2 * riser * this.walkSmoother;
                this.groups.ground.rotation.y = -this.angle + Math.PI / 2;
                if (this.sitting || app$1.key('q')) {
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
                //this.netangle = Math.PI / 4;
                // Net tick can happen offscreen
                var _a;
                //this.wpos = tiles.hovering!.wpos;
                //this.wpos = wastes.gview.mwpos;
                if (this.pecking) ;
                if (!pts.together(this.netwpos))
                    this.netwpos = this.wpos;
                // tween netwpos into wpos
                let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren$1.delta * 2);
                this.wpos = pts.add(this.wpos, tween);
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
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
                    this.walkSmoother += ren$1.delta * 10;
                }
                else {
                    this.walkSmoother -= ren$1.delta * 5;
                }
            }
            setup_context() {
                win$1.contextmenu.reset();
                win$1.contextmenu.options.options.push(["Examine", () => {
                        return true;
                    }, () => {
                        win$1.descriptor.focus = this;
                        win$1.descriptor.call_once("Cluck cluck.");
                        //win.contextmenu.focus = undefined;
                    }]);
            }
            tick() {
                // We are assumed to be onscreen
                // If we are visible
                if (!this.shape)
                    return;
                //this.wpos = wastes.gview.mwpos;
                this.make();
                this.animateBodyParts();
                this.tiled();
                //this.tile?.paint();
                //this.sector?.swap(this);
                let color = [1, 1, 1, 1];
                const sprite = this.shape;
                // We could have been nulled due to a hide, dispose
                if (sprite) {
                    const setShadow = () => {
                        color = shadows$1.calc(color, pts.round(this.wpos));
                        sprite.material.color.setRGB(color[0], color[1], color[2]);
                    };
                    if (sprite.mousedSquare(wastes.gview.mrpos)) {
                        sprite.material.color.set(GLOB.HOVER_COLOR);
                        win$1.contextmenu.focus = this;
                    }
                    else if (!sprite.mousedSquare(wastes.gview.mrpos)) {
                        if (win$1.contextmenu.focus == this)
                            win$1.contextmenu.focus = undefined;
                        setShadow();
                    }
                    else if (this.tile && this.tile.hasDeck == false) {
                        setShadow();
                    }
                    else if (!this.tile) ;
                }
                else {
                    console.warn('no chicken sprite?????');
                }
                this.stack(['pawn', 'you', 'chicken', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
                //sprite.roffset = [.5, .5];
                //this.tile!.paint();
                super.update();
            }
        }
        chickens.chicken = chicken;
    })(chickens || (chickens = {}));
    var chickens$1 = chickens;

    const dialogues = [
        [
            // skip 0
            ['I got nothing to say.', -1]
        ],
        [
            // 1
            [`I'm a commmoner.`, -1]
        ],
        [
            // 2
            [`I'm the trader around here.`, 1],
            [`I mostly trade scrap nowadays. To them tinker folk.`, -1],
        ],
        [
            // 3
            [`I protect the civilized borders.`, 1],
            [`It may not look that civil at first glance.`, 2],
            [`But there's a county to keep safe.`, -1]
        ]
    ];

    var client;
    (function (client) {
        client.objsId = {};
        client.plyId = -1;
        client.rates = [];
        client.prices = [];
        function get_rate(item) {
            for (const rate of client.rates)
                if (rate[0] == item)
                    return rate;
            return ['', 0, 0];
        }
        client.get_rate = get_rate;
        client.interactingWith = '';
        client.wantToBuy = '';
        client.wantToSell = '';
        client.wantToGrab = '';
        client.tradeWithId = '';
        function tick() {
            for (let id in client.objsId) {
                let obj = client.objsId[id];
                if (obj.type != 'you')
                    obj.nettick();
            }
        }
        client.tick = tick;
        function start() {
            client.socket = new WebSocket("ws://86.93.147.154:8080");
            client.socket.onopen = function (e) {
                //console.log("[open] Connection established");
                //console.log("Sending to server");
                //socket.send("My name is John");
            };
            function process_news(type, typed, data, handle, update) {
                for (let sobj of data.news) {
                    const { id } = sobj;
                    if (sobj.type != typed)
                        continue;
                    let obj = client.objsId[id];
                    if (!obj) {
                        // console.log('new sobj', typed, id);
                        obj = client.objsId[id] = new type;
                        obj.id = id;
                        obj.networked = true;
                        handle(obj, sobj);
                        lod$1.add(obj);
                    }
                    else if (obj) {
                        update(obj, sobj);
                    }
                }
            }
            client.socket.onmessage = function (event) {
                const data = JSON.parse(event.data);
                if (data.removes && data.removes.length) {
                    // console.log('we have removes', data.removes);
                    for (let id of data.removes) {
                        let obj = client.objsId[id];
                        if (!obj)
                            continue;
                        if (id == client.plyId) {
                            // prevent self-destruct by moving too fast
                            console.error(' you are probably going too fast ');
                            continue;
                        }
                        obj.hide();
                        obj.finalize();
                        lod$1.remove(obj);
                        delete client.objsId[id];
                    }
                }
                if (data.news) {
                    for (let sobj of data.news) {
                        if (sobj.type == 'tree')
                            console.log('got a server tree');
                        if (sobj.type == 'inventory')
                            console.log('got a server sinventory');
                    }
                    process_news(pawns$1.pawn, 'pawn', data, (obj, sobj) => {
                        const { wpos, angle, outfit, dialogue, aiming, inventory, subtype, isPlayer } = sobj;
                        obj.wpos = wpos;
                        obj.angle = angle;
                        obj.netwpos = wpos;
                        obj.netangle = angle;
                        obj.outfit = outfit;
                        obj.aiming = aiming;
                        obj.subtype = subtype;
                        if (dialogue)
                            obj.dialogue = dialogues[dialogue];
                        obj.isPlayer = isPlayer;
                        obj.inventory = inventory;
                    }, (obj, sobj) => {
                        const { wpos, angle, aiming, inventory } = sobj;
                        if (obj.type != 'you') {
                            obj.netwpos = wpos;
                            obj.netangle = angle;
                            obj.aiming = aiming;
                        }
                        if (inventory) {
                            console.log('update inventory');
                            obj.inventory = inventory;
                        }
                    });
                    process_news(chickens$1.chicken, 'chicken', data, (obj, sobj) => {
                        const { wpos, angle, sitting } = sobj;
                        obj.wpos = wpos;
                        obj.angle = angle;
                        obj.sitting = sitting;
                    }, (obj, sobj) => {
                        const { wpos, angle, pecking, sitting } = sobj;
                        obj.netwpos = wpos;
                        obj.netangle = angle;
                        obj.pecking = pecking;
                        obj.sitting = sitting;
                        // console.log('updating chicken!');
                    });
                    process_news(objects$1.crate, 'crate', data, (obj, sobj) => {
                        const { wpos, inventory } = sobj;
                        obj.wpos = wpos;
                        obj.inventory = inventory;
                        console.error('a new crate!');
                    }, (obj, sobj) => {
                        const { inventory } = sobj;
                        if (inventory)
                            obj.inventory = inventory;
                        // console.log('updating chicken!');
                    });
                    process_news(objects$1.shelves, 'shelves', data, (obj, sobj) => {
                        const { wpos, inventory } = sobj;
                        obj.wpos = wpos;
                        obj.inventory = inventory;
                    }, (obj, sobj) => {
                        const { inventory } = sobj;
                        if (inventory)
                            obj.inventory = inventory;
                        // console.log('updating chicken!');
                    });
                }
                if (data.playerId) {
                    client.plyId = data.playerId;
                    let pawn = client.objsId[client.plyId];
                    if (pawn) {
                        console.log('  got you pawn  ', client.plyId);
                        pawns$1.you = pawn;
                        pawn.type = 'you';
                        wastes.gview.center = pawn;
                    }
                }
                if (data.rates) {
                    client.rates = data.rates;
                    console.log('got rates');
                }
                if (data.messages) {
                    for (let message of data.messages) {
                        win$1.message.message(message[0], message[1] * 1000);
                    }
                }
            };
            setInterval(() => {
                if (pawns$1.you) {
                    let json = {
                        player: {
                            wpos: pawns$1.you.wpos,
                            angle: pawns$1.you.angle,
                            aiming: pawns$1.you.aiming,
                            shoot: pawns$1.you.shoot
                        }
                    };
                    pawns$1.you.shoot = false;
                    if (client.interactingWith) {
                        json.interactingWith = client.interactingWith;
                        client.interactingWith = '';
                    }
                    if (client.wantToBuy) {
                        json.wantToBuy = client.wantToBuy;
                        client.wantToBuy = '';
                    }
                    if (client.wantToSell) {
                        json.wantToSell = client.wantToSell;
                        client.wantToSell = '';
                    }
                    if (client.wantToGrab) {
                        json.wantToGrab = client.wantToGrab;
                        client.wantToGrab = '';
                    }
                    if (client.tradeWithId) {
                        json.tradeWithId = client.tradeWithId;
                        client.tradeWithId = '';
                    }
                    const string = JSON.stringify(json);
                    client.socket.send(string);
                }
            }, 333);
        }
        client.start = start;
    })(client || (client = {}));

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
    							opaque: child.getAttribute( 'opaque' ),
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
    							material.opacity = 1 - transparency.float;
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

    var collada;
    (function (collada_1) {
        collada_1.started = false;
        function register() {
        }
        collada_1.register = register;
        function start() {
            collada_1.started = true;
            document.title = 'collada';
            var myScene;
            const loadingManager = new THREE.LoadingManager(function () {
                //ren.scene.add(elf);
            });
            const loader = new ColladaLoader(loadingManager);
            loader.load('collada/model.dae', function (collada) {
                //wastes.gview.zoomIndex = 0;
                myScene = collada.scene;
                let group = new THREE.Group;
                group.rotation.set(0, -Math.PI / 2, 0);
                group.position.set(wastes.size, 0, 0);
                group.add(myScene);
                //console.log(elf);
                function fix(material) {
                    //material.color = new THREE.Color('red');
                    material.minFilter = material.magFilter = THREE__default["default"].LinearFilter;
                }
                function traversal(object) {
                    if (object.material) {
                        if (!object.material.length)
                            fix(object.material);
                        else
                            for (let material of object.material)
                                fix(material);
                    }
                }
                myScene.traverse(traversal);
                //group.add(new AxesHelper(300));
                console.log(myScene.scale);
                const zoom = 90; // 60 hires, 30 lowres
                myScene.scale.multiplyScalar(zoom);
                //elf.rotation.set(-Math.PI / 2, 0, 0);
                myScene.position.set(1, 0, 0);
                ren$1.scene.add(group);
                let sun = new THREE.DirectionalLight(0xffffff, 0.35);
                sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
                //sun.add(new AxesHelper(100));
                group.add(sun);
                group.add(sun.target);
                window['group'] = group;
                window['elf'] = myScene;
            });
        }
        collada_1.start = start;
        function load_model(path, then) {
            var myScene;
            const loadingManager = new THREE.LoadingManager(function () {
            });
            const loader = new ColladaLoader(loadingManager);
            loader.load('collada/revolver.dae', function (collada) {
                //wastes.gview.zoomIndex = 0;
                myScene = collada.scene;
                new THREE.Group;
                //group.rotation.set(0, -Math.PI / 2, 0);
                //group.position.set(wastes.size, 0, 0);
                //group.add(myScene);
                //console.log(elf);
                function fix(material) {
                    //material.color = new THREE.Color('red');
                    material.minFilter = material.magFilter = THREE__default["default"].LinearFilter;
                    material.side = THREE__default["default"].DoubleSide;
                }
                function traversal(object) {
                    if (object.material) {
                        if (!object.material.length)
                            fix(object.material);
                        else
                            for (let material of object.material)
                                fix(material);
                    }
                }
                myScene.traverse(traversal);
                //group.add(new AxesHelper(300));
                //console.log(myScene.scale);
                // 1 / 0.0254
                const zoom = 30;
                myScene.scale.multiplyScalar(zoom);
                //elf.rotation.set(-Math.PI / 2, 0, 0);
                //myScene.position.set(1, 0, 0);
                //ren.scene.add(group);
                /*let sun = new DirectionalLight(0xffffff, 0.35);
                sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
                //sun.add(new AxesHelper(100));
                group.add(sun);
                group.add(sun.target);

                window['group'] = group;
                window['elf'] = myScene;
                */
                then(myScene);
            });
            return myScene;
        }
        collada_1.load_model = load_model;
        function tick() {
        }
        collada_1.tick = tick;
    })(collada || (collada = {}));
    var collada$1 = collada;

    var pawns;
    (function (pawns) {
        class pawn extends objects$1.objected {
            constructor() {
                super(numbers.pawns);
                this.isTrader = false;
                this.isPlayer = false;
                this.dialogue = dialogues[0];
                this.netwpos = [0, 0];
                this.netangle = 0;
                //inventory: objects.container
                this.items = [];
                this.gun = 'revolver';
                this.outfit = ['#444139', '#444139', '#484c4c', '#31362c'];
                this.aiming = false;
                this.shoot = false;
                this.created = false;
                this.groups = {};
                this.meshes = {};
                this.made = false;
                this.mousing = false;
                this.swoop = 0;
                this.angle = 0;
                this.walkSmoother = 0;
                this.randomWalker = 0;
                this.type = 'pawn';
                this.height = 24;
                //this.inventory = new objects.container;
                //this.inventory.add('money');
            }
            create() {
                this.tiled();
                {
                    this.size = pts.divide([50, 40], 1);
                }
                let shape = new sprite({
                    binded: this,
                    tuple: sprites$1.test100,
                    cell: this.cell,
                    //opacity: .5,
                    orderBias: 1.0,
                });
                shape.subsize = [20, 40];
                shape.rleft = -this.size[0] / 4;
                shape.show();
                if (!this.created) {
                    this.created = true;
                    // Set scale to increase pixels exponentially
                    const scale = 1;
                    // make wee guy target
                    //this.group = new THREE.Group
                    let size = pts.mult(this.size, scale);
                    this.target = ren$1.make_render_target(size[0], size[1]);
                    this.camera = ren$1.make_orthographic_camera(size[0], size[1]);
                    this.scene = new THREE.Scene();
                    //this.scene.background = new Color('gray');
                    this.scene.rotation.set(Math.PI / 6, Math.PI / 4, 0);
                    this.scene.position.set(0, 0, 0);
                    this.scene.scale.set(scale, scale, scale);
                    let amb = new THREE.AmbientLight('white');
                    this.scene.add(amb);
                    let sun = new THREE.DirectionalLight(0xffffff, 0.5);
                    // left up right
                    sun.position.set(-wastes.size, wastes.size * 1.5, wastes.size / 2);
                    //sun.add(new AxesHelper(100));
                    this.scene.add(sun);
                    this.scene.add(sun.target);
                }
                {
                    const spritee = this.shape;
                    spritee.material.map = this.target.texture;
                }
            }
            try_move_to(pos) {
                let venture = pts.add(this.wpos, pos);
                if (!objects$1.is_solid(venture))
                    this.wpos = venture;
            }
            update() {
                this.tiled();
                //this.stack();
                super.update();
            }
            setup_context() {
                win$1.contextmenu.reset();
                if (!this.isPlayer && this.type != 'you') {
                    win$1.contextmenu.options.options.push(["Talk to", () => {
                            return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                        }, () => {
                            win$1.dialogue.talkingTo = this;
                            win$1.dialogue.call_once();
                            client.interactingWith = this.id;
                        }]);
                    if (this.subtype == 'trader') {
                        win$1.contextmenu.options.options.push(["Trade", () => {
                                return pts.distsimple(pawns.you.wpos, this.wpos) < 1;
                            }, () => {
                                win$1.trader.tradeWith = this;
                                win$1.trader.call_once();
                                client.interactingWith = this.id;
                            }]);
                    }
                }
            }
            make() {
                if (this.made)
                    return;
                this.made = true;
                const headSize = 5.5;
                const gasMaskSize = 2.5;
                const legsSize = 4;
                const legsHeight = 12.5;
                const armsSize = 3;
                const armsHeight = 12;
                const armsAngle = .0;
                const bodyThick = 5;
                const bodyWidth = 8;
                const bodyHeight = 12;
                const transforme = (thick, width, height, path) => {
                    const sizes = [width + width + thick + width, height];
                    let materials = [];
                    let transforms = [];
                    transforms.push(new THREE.Matrix3().setUvTransform(// left
                    width * 2 / sizes[0], 0, thick / sizes[0], 1, 0, 0, 1));
                    transforms.push(new THREE.Matrix3().setUvTransform(// right
                    width * 2 / sizes[0] + thick / sizes[0], 0, -thick / sizes[0], 1, 0, 0, 1));
                    transforms.push(new THREE.Matrix3().setUvTransform(// top
                    width * 2 / sizes[0] + thick / sizes[0], 0, thick / sizes[0], thick / sizes[1], 0, 0, 1));
                    transforms.push(new THREE.Matrix3()); // bottom ?
                    transforms.push(new THREE.Matrix3().setUvTransform(// front
                    0, 0, width / sizes[0], 1, 0, 0, 1));
                    transforms.push(new THREE.Matrix3().setUvTransform(// back
                    width / sizes[0], 0, width / sizes[0], 1, 0, 0, 1));
                    for (let i in transforms) {
                        materials.push(SpriteMaterial({
                            map: ren$1.load_texture(path, 0),
                        }, {
                            myUvTransform: transforms[i]
                        }));
                    }
                    return materials;
                };
                transforme(bodyThick, bodyWidth, bodyHeight, `tex/pawn/body.png`);
                transforme(armsSize, armsSize, armsHeight, `tex/pawn/arms.png`);
                let boxHead = new THREE.BoxGeometry(headSize, headSize, headSize, 1, 1, 1);
                let materialHead = new THREE.MeshLambertMaterial({
                    color: this.outfit[0]
                });
                let boxGasMask = new THREE.BoxGeometry(gasMaskSize, gasMaskSize, gasMaskSize, 1, 1, 1);
                let materialGasMask = new THREE.MeshLambertMaterial({
                    color: this.outfit[0]
                });
                let boxBody = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyThick, 1, 1, 1);
                let materialBody = new THREE.MeshLambertMaterial({
                    color: this.outfit[1]
                });
                let boxArms = new THREE.BoxGeometry(armsSize, armsHeight, armsSize, 1, 1, 1);
                let materialArms = new THREE.MeshLambertMaterial({
                    color: this.outfit[2]
                });
                let boxLegs = new THREE.BoxGeometry(legsSize, legsHeight, legsSize, 1, 1, 1);
                let materialLegs = new THREE.MeshLambertMaterial({
                    color: this.outfit[3]
                });
                // https://www.andersriggelsen.dk/glblendfunc.php
                let planeWater = new THREE.PlaneGeometry(wastes.size * 2, wastes.size * 2);
                let materialWater = new THREE.MeshLambertMaterial({
                    color: new THREE__default["default"].Color('rgba(32, 64, 64, 255)'),
                    opacity: 0.4,
                    transparent: true,
                    blending: THREE__default["default"].CustomBlending,
                    blendEquation: THREE__default["default"].AddEquation,
                    blendSrc: THREE__default["default"].DstAlphaFactor,
                    blendDst: THREE__default["default"].OneMinusDstAlphaFactor
                });
                /*let boxGunGrip = new BoxGeometry(2, 5, 2, 1, 1, 1);
                let materialGunGrip = new MeshLambertMaterial({
                    color: '#768383'
                });
        
                let boxGunBarrel = new BoxGeometry(2, gunBarrelHeight, 2, 1, 1, 1);
                let materialGunBarrel = new MeshLambertMaterial({
                    color: '#768383'
                });*/
                this.meshes.water = new THREE.Mesh(planeWater, materialWater);
                this.meshes.water.rotation.x = -Math.PI / 2;
                this.meshes.water.position.y = -bodyHeight * 1.25;
                this.meshes.water.visible = false;
                this.meshes.head = new THREE.Mesh(boxHead, materialHead);
                this.meshes.gasMask = new THREE.Mesh(boxGasMask, materialGasMask);
                this.meshes.body = new THREE.Mesh(boxBody, materialBody);
                this.meshes.arml = new THREE.Mesh(boxArms, materialArms);
                this.meshes.armr = new THREE.Mesh(boxArms, materialArms);
                this.meshes.legl = new THREE.Mesh(boxLegs, materialLegs);
                this.meshes.legr = new THREE.Mesh(boxLegs, materialLegs);
                /*this.meshes.gungrip = new Mesh(boxGunGrip, materialGunGrip);
                this.meshes.gunbarrel = new Mesh(boxGunBarrel, materialGunBarrel);*/
                this.groups.head = new THREE.Group;
                this.groups.gasMask = new THREE.Group;
                this.groups.body = new THREE.Group;
                this.groups.arml = new THREE.Group;
                this.groups.armr = new THREE.Group;
                this.groups.legl = new THREE.Group;
                this.groups.legr = new THREE.Group;
                this.groups.ground = new THREE.Group;
                this.groups.basis = new THREE.Group;
                /*this.groups.gungrip = new Group;
                this.groups.gunbarrel = new Group;*/
                this.groups.head.add(this.meshes.head);
                this.groups.gasMask.add(this.meshes.gasMask);
                this.groups.body.add(this.meshes.body);
                this.groups.arml.add(this.meshes.arml);
                this.groups.armr.add(this.meshes.armr);
                this.groups.legl.add(this.meshes.legl);
                this.groups.legr.add(this.meshes.legr);
                this.groups.head.add(this.groups.gasMask);
                /*this.groups.gungrip.add(this.meshes.gungrip);
                this.groups.gunbarrel.add(this.meshes.gunbarrel);*/
                /*this.groups.gungrip.add(this.groups.gunbarrel);
                this.groups.armr.add(this.groups.gungrip);*/
                this.groups.body.add(this.groups.head);
                this.groups.body.add(this.groups.arml);
                this.groups.body.add(this.groups.armr);
                this.groups.body.add(this.groups.legl);
                this.groups.body.add(this.groups.legr);
                this.groups.ground.add(this.groups.body);
                this.groups.basis.add(this.groups.ground);
                this.groups.basis.add(this.meshes.water);
                this.groups.head.position.set(0, bodyHeight / 2 + headSize / 2, 0);
                this.groups.gasMask.position.set(0, -headSize / 2, headSize / 1.5);
                this.groups.gasMask.rotation.set(-Math.PI / 4, 0, 0);
                this.groups.body.position.set(0, bodyHeight, 0);
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
                this.groups.ground.position.set(0, -bodyHeight * 1.0, 0);
                //mesh.rotation.set(Math.PI / 2, 0, 0);
                this.scene.add(this.groups.basis);
            }
            render() {
                ren$1.renderer.setRenderTarget(this.target);
                ren$1.renderer.clear();
                ren$1.renderer.render(this.scene, this.camera);
            }
            move() {
                var _a;
                let speed = 0.038 * ren$1.delta * 60;
                let x = 0;
                let y = 0;
                if (this.type == 'you') {
                    if (app$1.key('w')) {
                        x += -1;
                        y += -1;
                    }
                    if (app$1.key('s')) {
                        x += 1;
                        y += 1;
                    }
                    if (app$1.key('a')) {
                        x += -1;
                        y += 1;
                    }
                    if (app$1.key('d')) {
                        x += 1;
                        y += -1;
                    }
                    if (app$1.key('x')) {
                        speed *= 5;
                    }
                }
                // We snap to aim onto tiles
                if (this.type == 'you' && app$1.key('shift') && !win$1.genericHovering) {
                    let pos = ((_a = tiles$1.hovering) === null || _a === void 0 ? void 0 : _a.wpos) || [0, 0];
                    pos = pts.subtract(pos, pawns.you.wpos);
                    const dist = pts.distsimple(pos, wastes.gview.mwpos);
                    if (dist > 0.5) {
                        x = pos[0];
                        y = -pos[1];
                    }
                }
                else if (this.type == 'you' && (!x && !y) && app$1.button(0) >= 1 && !win$1.genericHovering) {
                    let mouse = wastes.gview.mwpos;
                    let pos = this.wpos;
                    pos = pts.add(pos, pts.divide([1, 1], 2));
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
                    if (!app$1.key('shift')) {
                        this.walkSmoother += ren$1.delta * 5;
                        this.try_move_to([x, y]);
                    }
                    else {
                        this.walkSmoother -= ren$1.delta * 5;
                    }
                }
                else
                    this.walkSmoother -= ren$1.delta * 5;
                if (this.type == 'you') {
                    this.shape;
                    if (app$1.key('v') == 1) {
                        wastes.FOLLOW_CAMERA = !wastes.FOLLOW_CAMERA;
                    }
                    if (wastes.FOLLOW_CAMERA) {
                        this.wtorpos();
                        this.update();
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
                if (!this.groups.legl) {
                    console.error('no groups leg left??');
                    return;
                }
                const legsSwoop = 0.8;
                const armsSwoop = 0.5;
                const rise = 0.5;
                this.swoop += ren$1.delta * 2.5;
                const swoop1 = Math.cos(Math.PI * this.swoop);
                const swoop2 = Math.cos(Math.PI * this.swoop - Math.PI);
                this.groups.legl.rotation.x = swoop1 * legsSwoop * this.walkSmoother;
                this.groups.legr.rotation.x = swoop2 * legsSwoop * this.walkSmoother;
                this.groups.arml.rotation.x = swoop1 * armsSwoop * this.walkSmoother;
                this.groups.armr.rotation.x = swoop2 * armsSwoop * this.walkSmoother;
                this.groups.ground.position.y = -12 + swoop1 * swoop2 * rise * this.walkSmoother;
                this.groups.ground.rotation.y = -this.angle + Math.PI / 2;
                if (this.type == 'you') {
                    if (app$1.key('shift')) {
                        this.aiming = true;
                        if (app$1.button(0) == 1) {
                            console.log('shoot');
                            this.shoot = true;
                            for (let obj of lod$1.ggrid.visibleObjs) {
                                const objected = obj;
                                if (objected.isObjected && objected.tileBound) {
                                    const test = objected.tileBound.ray({
                                        dir: [Math.sin(this.angle), Math.cos(this.angle)],
                                        org: this.wpos
                                    });
                                    if (test) {
                                        console.log('we hit something');
                                        objected.onhit();
                                    }
                                }
                            }
                        }
                    }
                    else
                        this.aiming = false;
                }
                if (this.aiming) {
                    this.groups.armr.rotation.x = -Math.PI / 2;
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
                var _a;
                if (this.type == 'you')
                    return;
                //this.wpos = tiles.hovering!.wpos;
                if (!pts.together(this.netwpos))
                    this.netwpos = this.wpos;
                // tween netwpos into wpos
                let tween = pts.mult(pts.subtract(this.netwpos, this.wpos), ren$1.delta * 2);
                this.wpos = pts.add(this.wpos, tween);
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
                if (this.netangle - this.angle > Math.PI)
                    this.angle += Math.PI * 2;
                if (this.angle - this.netangle > Math.PI)
                    this.angle -= Math.PI * 2;
                let tweenAngle = (this.netangle - this.angle) * 0.1;
                this.angle += tweenAngle;
                const movement = pts.together(pts.abs(tween));
                if (movement > 0.005) {
                    //console.log('movement > 0.25');
                    this.walkSmoother += ren$1.delta * 10;
                }
                else {
                    this.walkSmoother -= ren$1.delta * 5;
                }
            }
            tick() {
                var _a;
                if (!this.shape)
                    return;
                //if (this.type == 'you')
                //	this.wpos = tiles.hovering!.wpos;
                this.make();
                this.move();
                this.animateBodyParts();
                this.tiled();
                //this.tile?.paint();
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.swap(this);
                // shade the pawn
                let color = [1, 1, 1, 1];
                const sprite = this.shape;
                // We could have been nulled due to a hide, dispose
                if (sprite) {
                    const setShadow = () => {
                        color = shadows$1.calc(color, pts.round(this.wpos));
                        sprite.material.color.setRGB(color[0], color[1], color[2]);
                    };
                    if (this.type != 'you' && sprite.mousedSquare(wastes.gview.mrpos) /*&& !this.mousing*/) {
                        this.mousing = true;
                        sprite.material.color.set(GLOB.HOVER_COLOR);
                        if (this.type != 'you') {
                            win$1.contextmenu.focus = this;
                        }
                    }
                    else if (!sprite.mousedSquare(wastes.gview.mrpos) && this.mousing) {
                        if (win$1.contextmenu.focus == this)
                            win$1.contextmenu.focus = undefined;
                        setShadow();
                        this.mousing = false;
                    }
                    else if (this.tile && this.tile.hasDeck == false) {
                        setShadow();
                    }
                    else {
                        sprite.material.color.set('white');
                    }
                }
                if (this.type == 'you') ;
                this.stack(['pawn', 'you', 'chicken', 'shelves', 'leaves', 'wall', 'door', 'roof', 'falsefront', 'panel']);
                super.update();
            }
        }
        pawn.noun = 'pawn';
        pawns.pawn = pawn;
    })(pawns || (pawns = {}));
    var pawns$1 = pawns;

    var tiles;
    (function (tiles) {
        tiles.started = false;
        var arrays = [];
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
                    lod$1.add(tile);
                });
                return false;
            });
        }
        tiles.register = register;
        function start() {
            tiles.started = true;
            console.log(' tiles start ');
            lod$1.gworld.at(lod$1.world.big(wastes.gview.wpos));
        }
        tiles.start = start;
        function tick() {
            if (!tiles.started)
                return;
            for (let i = 100; i >= 0; i--) {
                // The great pretention grid
                let pos = lod$1.unproject(pts.add(wastes.gview.mrpos, [0, -i]));
                pos = pts.floor(pos);
                const tile = get(pos);
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
        const color_shallow_water = [40, 120, 130, 255];
        const color_deep_water = [20, 100, 110, 255];
        class tile extends lod$1.obj {
            constructor(wpos) {
                super(numbers.tiles);
                this.hasDeck = false;
                this.isLand = false;
                this.refresh = false;
                this.opacity = 1;
                this.myOrderBias = 1;
                this.wpos = wpos;
                let pixel = wastes.colormap.pixel(this.wpos);
                if (pixel.is_invalid_pixel()) {
                    // We are fog of war
                    console.log('invalid pixel');
                    this.type = 'land';
                    this.size = [24, 30];
                    this.tuple = sprites$1.dgraveltiles;
                    this.color = [60, 60, 60, 255];
                    this.height = 6;
                    this.cell = [1, 0];
                }
                else if (pixel.is_shallow_water()) {
                    // We are a shallow water
                    this.type = 'shallow water';
                    this.size = [24, 12];
                    this.tuple = sprites$1.dwater;
                    //this.height = -5;
                    this.opacity = .5;
                    this.color = color_shallow_water;
                }
                else if (pixel.is_black()) {
                    // We are a deep water
                    this.type = 'deep water';
                    this.size = [24, 12];
                    this.tuple = sprites$1.dwater;
                    this.opacity = .5;
                    this.color = color_deep_water;
                }
                else if (!pixel.is_black()) {
                    // We're a land tile
                    this.isLand = true;
                    this.type = 'land';
                    this.size = [24, 30];
                    this.tuple = sprites$1.dgraveltiles;
                    this.height = 6;
                    this.cell = [1, 0];
                    const divisor = 3;
                    let height = wastes.heightmap.pixel(this.wpos);
                    this.z += Math.floor(height.arrayRef[0] / divisor);
                    this.z -= 3; // so we dip the water
                    //this.z += Math.random() * 24;
                }
            }
            get_stack() {
                var _a;
                (_a = this.sector) === null || _a === void 0 ? void 0 : _a.objs;
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
                    this.color = shadows$1.calc(this.color, this.wpos);
                }
                this.myOrderBias = -0.5; // + (this.z / 4);// + (this.height / 10);
                let shape = new sprite({
                    binded: this,
                    tuple: this.tuple,
                    cell: this.cell,
                    color: this.color,
                    opacity: this.opacity,
                    orderBias: this.myOrderBias
                });
                // if we have a deck, add it to heightAdd
                let sector = lod$1.gworld.at(lod$1.world.big(this.wpos));
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
                sprite.mesh.material.color.set('#768383');
                tile.lastHover = this;
            }
            paint() {
                const sprite = this.shape;
                if (!sprite || !sprite.mesh)
                    return;
                sprite.mesh.material.color.set('red');
            }
            tick() {
                this.shape;
                if (this.refresh) {
                    this.refresh = false;
                    this.hide();
                    this.show();
                }
                if (pawns$1.you && pts.equals(this.wpos, pts.round(pawns$1.you.wpos))) ;
            }
        }
        tiles.tile = tile;
    })(tiles || (tiles = {}));
    var tiles$1 = tiles;

    // the view manages what it sees
    class view {
        constructor() {
            this.zoom = 0.33;
            this.zoomIndex = 4;
            this.zooms = [1, 0.5, 0.33, 0.2, 0.1, 0.05];
            this.wpos = [44, 52];
            this.rpos = [0, 0];
            this.mpos = [0, 0];
            this.mwpos = [0, 0];
            this.mrpos = [0, 0];
            this.raise = 50;
            this.begin = [0, 0];
            this.before = [0, 0];
            this.show = true;
            new lod$1.world(10);
            this.rpos = lod$1.project(this.wpos);
        }
        static make() {
            return new view;
        }
        chart(big) {
        }
        tick() {
            this.move();
            this.mouse();
            //if (!this.follow)
            //	this.wpos = lod.unproject(this.rpos);
            if (this.follow) {
                let wpos = this.follow.wpos;
                // Why the .5, .5 ?
                wpos = pts.add(wpos, [.5, .5]);
                this.rpos = lod$1.project(wpos);
            }
            else {
                this.rpos = lod$1.project(this.wpos);
            }
            this.pan();
            this.wpos = lod$1.unproject(this.rpos);
            this.rpos = pts.add(this.rpos, [0, this.raise / 2]);
            this.set_camera();
            this.stats();
            lod$1.gworld.update(this.wpos);
            const zoom = wastes.gview.zoom;
            // ren.renderer.domElement.style.transform = `scale(${1/zoom},${1/zoom})`;
            ren$1.camera.scale.set(zoom, zoom, zoom);
            ren$1.camera.updateProjectionMatrix();
        }
        pan() {
            const panDivisor = -1;
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
                    // necessary mods
                    dif = pts.mult(dif, ren$1.ndpi);
                    dif = pts.mult(dif, this.zoom);
                    dif = pts.subtract(dif, this.before);
                    this.rpos = pts.inv(dif);
                    //this.wpos = lod.unproject(this.rpos);
                    //this.rpos = pts.floor(this.rpos); // floor 
                }
            }
            else if (app$1.button(1) == -1) {
                console.log('woo');
                this.rpos = pts.floor(this.rpos);
            }
        }
        set_camera() {
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
            //this.mrpos2 = pts.subtract(this.mrpos, [0, 3]); // why minus 3 ?
            this.mrpos = pts.add(this.mrpos, lod$1.project([.5, -.5])); // correction
            this.mwpos = lod$1.unproject(this.mrpos);
            //this.mwpos = pts.add(this.mwpos, [.5, -.5])
            // now..
            if (app$1.button(0) == 1) {
                hooks.call('viewLClick', this);
            }
            if (app$1.button(1) == 1) {
                hooks.call('viewMClick', this);
            }
            if (app$1.button(2) == 1) {
                hooks.call('viewRClick', this);
            }
        }
        move() {
            let pan = 10;
            if (app$1.key('x'))
                pan *= 2;
            let add = [0, 0];
            if (app$1.key('arrowup'))
                add = pts.add(add, [0, pan]);
            if (app$1.key('arrowdown'))
                add = pts.add(add, [0, -pan]);
            if (app$1.key('arrowleft'))
                add = pts.add(add, [-pan, 0]);
            if (app$1.key('arrowright'))
                add = pts.add(add, [pan, 0]);
            if ((app$1.key('f') == 1 || app$1.wheel == -1) && this.zoomIndex > 0)
                this.zoomIndex -= 1;
            if ((app$1.key('r') == 1 || app$1.wheel == 1) && this.zoomIndex < this.zooms.length - 1)
                this.zoomIndex += 1;
            if (app$1.key('t') == 1) {
                lod$1.ggrid.shrink();
            }
            if (app$1.key('g') == 1) {
                lod$1.ggrid.grow();
            }
            this.zoom = this.zooms[this.zoomIndex];
            add = pts.mult(add, this.zoom);
            add = pts.floor(add);
            this.rpos = pts.add(this.rpos, add);
        }
        stats() {
            var _a;
            if (app$1.mobile)
                this.show = false;
            if (app$1.key('h') == 1)
                this.show = !this.show;
            let crunch = ``;
            crunch += `DPI_UPSCALED_RT: ${ren$1.DPI_UPSCALED_RT}<br />`;
            crunch += '<br />';
            crunch += `dpi: ${ren$1.ndpi}<br />`;
            crunch += `fps: ${ren$1.fps}<br />`;
            crunch += `delta: ${ren$1.delta.toPrecision(6)}<br />`;
            crunch += '<br />';
            crunch += `textures: ${ren$1.renderer.info.memory.textures}<br />`;
            crunch += `programs: ${ren$1.renderer.info.programs.length}<br />`;
            //crunch += `memory: ${Math.floor(ren.memory.usedJSHeapSize / 1000000)} / ${Math.floor(ren.memory.totalJSHeapSize / 1000000)}<br />`;
            crunch += '<br />';
            //crunch += `mouse: ${pts.to_string(App.mouse())}<br />`;
            //crunch += `mpos: ${pts.to_string(pts.floor(this.mpos))}<br />`;
            crunch += `mwpos: ${pts.to_string_fixed((this.mwpos))}<br />`;
            crunch += `mrpos: ${pts.to_string(pts.floor(this.mrpos))}<br />`;
            crunch += '<br />';
            crunch += `lod grid size: ${lod$1.ggrid.spread * 2 + 1} / ${lod$1.ggrid.outside * 2 + 1}<br />`;
            crunch += `mouse tile: ${pts.to_string(((_a = tiles$1.hovering) === null || _a === void 0 ? void 0 : _a.wpos) || [0, 0])}<br />`;
            crunch += `view center: ${pts.to_string(pts.floor(this.wpos))}<br />`;
            if (pawns$1.you)
                crunch += `you: ${pts.to_string(pts.round(pawns$1.you.wpos))}<br />`;
            crunch += `view bigpos: ${pts.to_string(lod$1.world.big(this.wpos))}<br />`;
            if (wastes.gview.center)
                crunch += `view center: ${pts.to_string_fixed(wastes.gview.center.wpos)}<br />`;
            crunch += `view zoom: ${this.zoom}<br />`;
            crunch += `lod grid: ${lod$1.ggrid.spread}, ${lod$1.ggrid.outside}<br />`;
            crunch += '<br />';
            //crunch += `world wpos: ${pts.to_string(this.pos)}<br /><br />`;
            crunch += `sectors: ${numbers.sectors[0]} / ${numbers.sectors[1]}<br />`;
            crunch += `game objs: ${numbers.objs[0]} / ${numbers.objs[1]}<br />`;
            crunch += `sprites: ${numbers.sprites[0]} / ${numbers.sprites[1]}<br />`;
            crunch += `tiles: ${numbers.tiles[0]} / ${numbers.tiles[1]}<br />`;
            crunch += `trees: ${numbers.trees[0]} / ${numbers.trees[1]}<br />`;
            crunch += `leaves: ${numbers.leaves[0]} / ${numbers.leaves[1]}<br />`;
            crunch += `floors: ${numbers.floors[0]} / ${numbers.floors[1]}<br />`;
            crunch += `walls: ${numbers.walls[0]} / ${numbers.walls[1]}<br />`;
            crunch += `roofs: ${numbers.roofs[0]} / ${numbers.roofs[1]}<br />`;
            crunch += '<br />';
            crunch += `controls:<br />
		[h] to hide debug<br />
		[right click] for context menu<br />
		[w, a, s, d] or [click] to move<br />
		[r, f] or [scrollwheel] to zoom<br />
		[t, g] to change lod<br />
		[v] to toggle camera<br />
		[z] to toggle bit depth effect<br />
		[shift] to aim<br />
		[shift + click] to shoot<br />
		[middle mouse] to pan<br />
		[spacebar] to toggle roofs<br />
		[x] to go fast<br />
		[c] for character menu<br />`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
            element.style.visibility = this.show ? 'visible' : 'hidden';
        }
    }

    var modeler;
    (function (modeler) {
        modeler.started = false;
        const textures = [
            'tex/stock/bricks3.jpg',
            'tex/stock/whiteplanks.jpg',
            'tex/stock/brick4.jpg',
            'tex/stock/metalrooftiles.jpg',
            'tex/stock/concrete1.jpg',
            'tex/stock/treebark1.jpg',
            'tex/stock/leaves.png',
        ];
        let currentTex = 0;
        var gmesh;
        var ggroup;
        var rotation = 0;
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
            let sun = new THREE.DirectionalLight(0xffffff, 0.4);
            sun.position.set(-wastes.size, wastes.size * 2, wastes.size / 2);
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
                        map: texture,
                        transparent: true
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

    var shear;
    (function (shear) {
        shear.started = false;
        var canvas, ctx;
        var spare, spareCtx;
        var walls, goal, wallpapers, wallpaper;
        function start() {
            shear.started = true;
            document.title = 'shear';
            document.body.oncontextmenu = function () { };
            spare = document.createElement("canvas");
            spareCtx = spare.getContext('2d');
            spare.width = 24;
            spare.height = 40;
            spare.style.position = 'relative';
            spare.style.zoom = '3';
            spare.style.display = 'block';
            spare.style.zIndex = '2';
            canvas = document.createElement("canvas");
            canvas.width = 24 * 11;
            canvas.height = 40;
            canvas.id = "shear";
            canvas.style.position = 'relative';
            canvas.style.margin = '0px auto';
            canvas.style.zoom = '3';
            canvas.style.zIndex = '2';
            ctx = canvas.getContext('2d');
            let style = document.location.href.split('shear=')[1];
            console.log(style);
            walls = document.getElementById(style);
            goal = document.getElementById('goal');
            wallpaper = document.getElementById('wallpaper');
            wallpapers = document.getElementById('wallpapers');
            ctx.drawImage(walls, 0, 0);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.drawImage(goal, 0, 0);
            // -4, 8 for thin
            // -3, 6 for thick
            let x, y;
            if (style == 'thin' || style == 'thinner') {
                y = -4;
                x = 8;
            }
            else if (style == 'thick') {
                y = -3;
                x = 6;
            }
            // half
            ctx.drawImage(goal, 24, 0);
            ctx.drawImage(goal, 24 * 5, 0);
            ctx.drawImage(goal, 24 * 6, 0);
            spareCtx.drawImage(canvas, -24 * 5, 0);
            ctx.drawImage(spare, 24 * 2 + x, y);
            ctx.drawImage(spare, 24 * 3 + x, y);
            ctx.drawImage(spare, 24 * 7 + x, y);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(canvas, -24 * 6, 0);
            ctx.drawImage(spare, 24 * 2, 0);
            spareCtx.clearRect(12 + x, 0, 24, 40);
            ctx.drawImage(spare, 24 * 3 - x, y);
            spareCtx.drawImage(canvas, -24 * 6, 0);
            ctx.drawImage(spare, 24 * 4 - x, y);
            ctx.drawImage(spare, 24 * 8 - x, y);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(canvas, -24 * 5, 0);
            ctx.drawImage(spare, 24 * 4, 0);
            //ctx.drawImage(spare, 24 * 9 - x2, -y2);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(canvas, -24 * 6, 0);
            //ctx.drawImage(spare, 24 * 10 + x2, -y2);
            document.body.append(canvas);
            document.body.append(spare);
            start_wallpaper();
        }
        shear.start = start;
        function start_wallpaper() {
            let style = document.location.href.split('shear=')[1];
            let x, y;
            if (style == 'thin' || style == 'thinner') {
                y = -4;
                x = 8;
            }
            else if (style == 'thick') {
                y = -3;
                x = 6;
            }
            let spare2Canvas, ctx2;
            spare2Canvas = document.createElement("canvas");
            ctx2 = spare2Canvas.getContext('2d');
            spare2Canvas.width = 24 * 11;
            spare2Canvas.height = 40;
            spare2Canvas.style.position = 'relative';
            spare2Canvas.style.zoom = '3';
            spare2Canvas.style.display = 'block';
            spare2Canvas.style.zIndex = '2';
            ctx2.drawImage(wallpapers, 0, 0);
            ctx2.globalCompositeOperation = 'source-atop';
            let wallpaperCanvas;
            wallpaperCanvas = document.createElement("canvas");
            let ctx1 = wallpaperCanvas.getContext('2d');
            wallpaperCanvas.width = 24 * 11;
            wallpaperCanvas.height = 40;
            wallpaperCanvas.style.position = 'relative';
            wallpaperCanvas.style.zoom = '3';
            wallpaperCanvas.style.display = 'block';
            wallpaperCanvas.style.zIndex = '2';
            ctx1.drawImage(walls, 0, 0);
            ctx1.globalCompositeOperation = 'source-atop';
            ctx1.drawImage(wallpaper, 0, 0);
            ctx1.drawImage(wallpaper, 24, 0);
            ctx1.drawImage(wallpaper, 24 * 5, 0);
            ctx1.drawImage(wallpaper, 24 * 6, 0);
            spareCtx.drawImage(wallpaperCanvas, -24 * 5, 0);
            ctx1.drawImage(spare, 24 * 2 + x, y);
            ctx1.drawImage(spare, 24 * 3 + x, y);
            ctx1.drawImage(spare, 24 * 7 + x, y);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(wallpaperCanvas, -24 * 6, 0);
            ctx1.drawImage(spare, 24 * 2, 0);
            spareCtx.clearRect(12 + x, 0, 24, 40);
            ctx1.drawImage(spare, 24 * 3 - x, y);
            spareCtx.drawImage(wallpaperCanvas, -24 * 6, 0);
            ctx1.drawImage(spare, 24 * 4 - x, y);
            ctx1.drawImage(spare, 24 * 8 - x, y);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(wallpaperCanvas, -24 * 5, 0);
            ctx1.drawImage(spare, 24 * 4, 0);
            //ctx.drawImage(spare, 24 * 9 - x2, -y2);
            spareCtx.clearRect(0, 0, 24, 40);
            spareCtx.drawImage(wallpaperCanvas, -24 * 6, 0);
            //ctx.drawImage(spare, 24 * 10 + x2, -y2);
            ctx2.drawImage(wallpaperCanvas, 0, 0);
            ctx.drawImage(spare2Canvas, 0, 0);
            document.body.append(wallpaperCanvas);
            document.body.append(spare2Canvas);
        }
        shear.start_wallpaper = start_wallpaper;
        function tick() {
            if (!shear.started)
                return;
            let crunch = `shear`;
            let element = document.querySelectorAll('.stats')[0];
            element.innerHTML = crunch;
        }
        shear.tick = tick;
    })(shear || (shear = {}));
    var shear$1 = shear;

    var rooms;
    (function (rooms) {
        new aabb2([41, 42], [30, 30]);
        rooms.started = false;
        function start() {
            rooms.started = true;
        }
        rooms.start = start;
        function tick() {
            if (!rooms.started)
                return;
        }
        rooms.tick = tick;
    })(rooms || (rooms = {}));
    var rooms$1 = rooms;

    var areas;
    (function (areas_1) {
        let areas = [];
        let currentArea;
        areas_1.started = false;
        function start() {
            areas_1.started = true;
            areas.push({ name: "Trashy Vendor", bound: new aabb2([35, 46], [42, 52]) });
        }
        areas_1.start = start;
        function tick() {
            if (!areas_1.started)
                return;
            let pos = wastes.gview.center.wpos;
            let here = new aabb2(pos, pos);
            if (currentArea) {
                if (currentArea && currentArea.bound.test(here) == aabb2.TEST.Outside) {
                    currentArea = undefined;
                    console.log('outside');
                }
            }
            else {
                for (let area of areas) {
                    if (area.bound.test(here) == aabb2.TEST.Inside) {
                        console.log('inside');
                        currentArea = area;
                        win$1.areatag.call(true, area);
                    }
                }
            }
        }
        areas_1.tick = tick;
    })(areas || (areas = {}));
    var areas$1 = areas;

    var fences;
    (function (fences) {
        class fence extends objects$1.objected {
            constructor() {
                super(numbers.walls);
                this.type = 'wall';
                this.height = 24;
            }
            create() {
                this.tiled();
                this.size = [24, 30];
                return;
            }
            static make() {
                if (!this.made) {
                    this.made = true;
                }
            }
        }
        fence.made = false;
        fences.fence = fence;
    })(fences || (fences = {}));
    var fences$1 = fences;

    exports.wastes = void 0;
    (function (wastes) {
        wastes.size = 24;
        wastes.SOME_OTHER_SETTING = false;
        wastes.HIDE_ROOFS = false;
        wastes.FOLLOW_CAMERA = true;
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
        const MAX_WAIT = 250;
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
                wastes.gview = view.make();
                testing_chamber$1.start();
            }
            else if (window.location.href.indexOf("#modeler") != -1) {
                modeler$1.start();
            }
            else if (window.location.href.indexOf("#shear") != -1) {
                shear$1.start();
            }
            else if (window.location.href.indexOf("#collada") != -1) {
                collada$1.start();
            }
            else {
                wastes.gview = view.make();
                objects$1.register();
                tiles$1.register();
                sprites.start();
                shadows.start();
                tiles$1.start();
                objects$1.start();
                rooms$1.start();
                areas$1.start();
                win$1.start();
                tests$1.start();
                client.start();
                chickens$1.start();
                wastes.gview.center = new lod$1.obj();
                wastes.gview.center.wpos = [44, 52];
                /*
                    [`I'm on duty.`, 1],
                    [`I protect the civilized area here. It may not look that civil at first glance.`, 2],
                    [`But undernearth the filth theres beauty to behold.`, 3],
                    [`Just don't misbehave.`, -1]
                */
            }
        }
        function start() {
            if (started)
                return;
            started = true;
            console.log(' wastes starting ');
            GLOB.HOVER_COLOR = '#95ca90';
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
            tests$1.tick();
            testing_chamber$1.tick();
            modeler$1.tick();
            tiles$1.tick();
            shear$1.tick();
            collada$1.tick();
            client.tick();
            objects$1.tick();
            rooms$1.tick();
            areas$1.tick();
            win$1.tick();
        }
        wastes.tick = tick;
    })(exports.wastes || (exports.wastes = {}));
    var wastes = exports.wastes;

    exports["default"] = wastes;
    exports.fences = fences$1;
    exports.objects = objects$1;
    exports.pawns = pawns$1;
    exports.win = win$1;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, THREE);
