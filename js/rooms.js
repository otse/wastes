import aabb2 from "./aabb2";
var rooms;
(function (rooms) {
    let room = new aabb2([41, 42], [30, 30]);
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
export default rooms;
