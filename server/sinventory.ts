import slod from "./slod";

export type item = [name: string, amount: number]

export class sinventory {
    static id = 0
    stamp = 0
    owner?: slod.sobj
    tuples: item[] = []
    constructor() {
    }
    needsUpdate() {
        this.stamp = slod.stamp;
    }
    get(name: string) {
        for (const tuple of this.tuples)
            if (tuple[0] == name)
                return tuple;
    }
    add(name: string, amount: number = 1) {
        let tuple = this.get(name);
        if (tuple)
            tuple[1] += amount;
        else
            this.tuples.push([name, amount]);
        this.tuples.sort();
        this.needsUpdate();
    }
    remove(name: string, amount: number = 1) {
        for (let i = this.tuples.length - 1; i >= 0; i--) {
            const tuple = this.tuples[i];
            if (tuple[0] == name) {
                tuple[1] -= amount;
                this.needsUpdate();
                if (tuple[1] <= 0)
                    this.tuples.splice(i, 1);
                break;
            }
        }
    }
    collect() {
        return { stamp: this.stamp, tuples: this.tuples };
    }
}