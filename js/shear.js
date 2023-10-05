var shear;
(function (shear) {
    shear.started = false;
    var canvas, ctx;
    var spare, spareCtx;
    var room, roomCtx;
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
export default shear;
