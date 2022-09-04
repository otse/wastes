import collada from "../collada";
import { THREE } from "../renderer";
import wastes from "../wastes";

export namespace guns {

	export type guns = 'none' | 'revolver' | 'rifle' | 'lasermusket'

	export interface gun {
		name: string
		handgun: boolean
		model: any
	}

	export var revolver = {
		name: 'revolver',
		handgun: true,
		model: undefined,
	} as gun

	export var rifle = {
		name: 'rifle',
		handgun: false,
		model: undefined,
	} as gun

	export var lasermusket = {
		name: 'lasermusket',
		handgun: false,
		model: undefined,
	} as gun

	export function init() {

		collada.load_model('collada/revolver', 22, (model) => {
			revolver.model = model;
			wastes.resourced("REVOLVER");
		});
		
		collada.load_model('collada/rifle', 22, (model) => {
			rifle.model = model;
			wastes.resourced("RIFLE");
		});
		
		collada.load_model('collada/lasermusket', 22, (model) => {
			lasermusket.model = model;
			wastes.resourced("LASER_MUSKET");
		});
	}

	export function get(name: guns) {
		if (name == 'revolver')
			return revolver;
		else if (name == 'rifle')
			return rifle;
		else if (name == 'lasermusket')
			return lasermusket;
	}
}

export default guns;