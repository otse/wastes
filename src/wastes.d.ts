declare type vec4 = [number, number, number, number];
declare type vec3 = [number, number, number];
declare type vec2 = [number, number];

declare type Vec4 = vec4;
declare type Vec3 = vec3;
declare type Vec2 = vec2;

declare interface Point {
	x: number
	y: number
}

// Not Used
declare interface Asset {
	readonly img: string
	readonly size: vec2
	readonly area?: vec2
	readonly offset?: vec2
}

declare var GIF: any;
declare var CCapture: any;

declare const anExampleFunction: Function;

declare namespace astar {
	function search(a, b, c): any;
	
}


declare class Graph {
	constructor(array, options);
  }