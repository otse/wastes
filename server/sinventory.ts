import slod from "./slod";

export type item = [name: string, amount: number]

export class inventory {
	static infinity = -1
	static id = 0
	stamp = 0
	tuples: item[] = []
	owner?: slod.sobj
	constructor(owner: slod.sobj) {
		this.owner = owner;
	}
	needs_update() {
		this.stamp = slod.stamp;
		this.owner?.needs_update();
	}
	get(name: string) {
		for (const tuple of this.tuples)
			if (tuple[0] == name)
				return tuple;
	}
	// return amount or 0
	amount(name: string) {
		const get = this.get(name);
		return get && get[1] || 0;
	}
	add(name: string, amount: number = 1) {
		let tuple = this.get(name);
		if (tuple) {
			// cant add to infinity
			if (tuple[1] == inventory.infinity)
				return;
			if (amount > 0)
				tuple[1] += amount;
			else if (amount == -1)
				tuple[1] = -1;
		}
		else
			this.tuples.push([name, amount]);
		//this.tuples.sort();
		this.needs_update();
	}
	// if we try remove more than we have, set amount to 0
	remove(name: string, amount: number = 1) {
		for (let i = this.tuples.length - 1; i >= 0; i--) {
			const tuple = this.tuples[i];
			if (tuple[0] == name) {
				// cant remove from infinity
				if (tuple[1] == inventory.infinity)
					return;
				if (tuple[1] - amount >= 0)
					tuple[1] -= amount;
				else
					tuple[1] = 0;
				this.needs_update();
				if (tuple[1] == 0)
					this.tuples.splice(i, 1);
				break;
			}
		}
	}
	collect() {
		return { stamp: this.stamp, tuples: this.tuples };
	}
}