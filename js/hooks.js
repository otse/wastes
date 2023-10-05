// inspired by gmod lua !
export class hooks {
    constructor() {
        this.list = [];
    }
    static register(name, f) {
        if (!hooks[name])
            hooks[name] = [];
        hooks[name].push(f);
    }
    static unregister(name, f) {
        hooks[name] = hooks[name].filter(e => e != f);
    }
    static call(name, x) {
        if (!hooks[name])
            return;
        for (let i = hooks[name].length; i--;)
            if (hooks[name][i](x))
                return;
    }
}
export default hooks;
