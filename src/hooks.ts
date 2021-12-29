
// inspired by gmod lua

type func = (any) => boolean

export class hooks<T = never> {
	static readonly hooks: { [name: string]: func[] }
	list: func[] = []
	static create(name: string) {
		hooks[name] = [];
	}
	static register(name: string, f: func) {
		if (!hooks[name]) {
			console.warn(' hook automatically created ');
			this.create(name);
		}
		hooks[name].push(f);
	}
	static unregister(name: string, f: func) {
		hooks[name] = hooks[name].filter(e => e != f);
	}
	static call(name: string, x: any) {
		if (!hooks[name])
			return;
		for (let i = hooks[name].length; i--;)
			if (hooks[name][i](x))
				return;
	}
}

export default hooks