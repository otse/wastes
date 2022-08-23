"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventory = void 0;
const slod_1 = __importDefault(require("./slod"));
class inventory {
    constructor(owner) {
        this.stamp = 0;
        this.tuples = [];
        this.owner = owner;
    }
    needsUpdate() {
        var _a;
        this.stamp = slod_1.default.stamp;
        (_a = this.owner) === null || _a === void 0 ? void 0 : _a.needs_update();
    }
    get(name) {
        for (const tuple of this.tuples)
            if (tuple[0] == name)
                return tuple;
    }
    // return amount or 0
    amount(name) {
        const get = this.get(name);
        return get && get[1] || 0;
    }
    add(name, amount = 1) {
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
        this.needsUpdate();
    }
    // if we try remove more than we have, set amount to 0
    remove(name, amount = 1) {
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
                this.needsUpdate();
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
exports.inventory = inventory;
inventory.infinity = -1;
inventory.id = 0;
