"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sinventory = void 0;
const slod_1 = __importDefault(require("./slod"));
class sinventory {
    constructor() {
        this.stamp = 0;
        this.tuples = [];
    }
    needsUpdate() {
        this.stamp = slod_1.default.stamp;
    }
    get(name) {
        for (const tuple of this.tuples)
            if (tuple[0] == name)
                return tuple;
    }
    add(name, amount = 1) {
        let tuple = this.get(name);
        if (tuple)
            tuple[1] += amount;
        else
            this.tuples.push([name, amount]);
        this.tuples.sort();
        this.needsUpdate();
    }
    remove(name, amount = 1) {
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
exports.sinventory = sinventory;
sinventory.id = 0;
