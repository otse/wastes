import pawns from "./pawns";

export namespace client {

	export var socket: WebSocket

	export function start() {
		socket = new WebSocket("ws://localhost:8080");

		socket.onopen = function (e) {
			//console.log("[open] Connection established");
			//console.log("Sending to server");
			//socket.send("My name is John");
		};

		socket.onmessage = function (event) {
			console.log(`[message] Data received from server: ${event.data}`);
		};

		setInterval(() => {
			const json = { player: { wpos: pawns.you.wpos } };
			const string = JSON.stringify(json);
			socket.send(string);
		}, 1000);
	}
}