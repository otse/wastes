import { default as THREE, Group, Matrix, Matrix4, AxesHelper } from 'three';

import App from "../app";
import wests from '../wastes';
import pts from "../pts";
import ren from "../renderer";

// scripts have a .start, .tick

namespace panningScript {
	const enabled = true

	const isometric: vec2 = [0, 0] // [-Math.PI / 4, Math.PI / 3]

	export var center: Group
	export var yawGroup: Group
	export var pitchGroup: Group

	export function start() {
		if (!enabled)
			return

		center = new Group
		yawGroup = new Group
		pitchGroup = new Group

		center.add(yawGroup)
		//center.add(new AxesHelper(100))

		yawGroup.add(pitchGroup)
		pitchGroup.add(ren.camera)

		ren.groups.axisSwap.add(center)
	}
	
	var begin: vec2 = [0, 0]
	var last: vec2 = [0, 0] // isometric
	var before: vec2 = [0, 0]

	export function tick() {
		if (!enabled)
			return

		if (App.button(1) == 1) {
			begin = App.mouse()
			before = last
		}
		if (App.button(1) >= 1) {
			console.log('hold')
			let dif = pts.subtract(begin, App.mouse())
			dif = pts.divide(dif, 250)
			dif = pts.add(dif, before)
			last = pts.clone(dif)
		}
		else
		{
			last = isometric
		}
		yawGroup.rotation.z = last[0]
		pitchGroup.rotation.x = last[1]
		center.position.fromArray([...wests.view.rpos, 0])
		ren.camera.scale.set(wests.view.zoom / 1, wests.view.zoom / 1, wests.view.zoom / 1)
		ren.camera.updateProjectionMatrix()
	}

}

export default panningScript;