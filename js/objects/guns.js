import collada from "../collada";
import wastes from "../wastes";
export var guns;
(function (guns) {
    guns.revolver = {
        name: 'revolver',
        handgun: true,
        model: undefined,
    };
    guns.rifle = {
        name: 'rifle',
        handgun: false,
        model: undefined,
    };
    guns.lasermusket = {
        name: 'lasermusket',
        handgun: false,
        model: undefined,
    };
    function init() {
        collada.load_model('collada/revolver', 22, (model) => {
            guns.revolver.model = model;
            wastes.resourced("REVOLVER");
        });
        collada.load_model('collada/rifle', 22, (model) => {
            guns.rifle.model = model;
            wastes.resourced("RIFLE");
        });
        collada.load_model('collada/lasermusket', 22, (model) => {
            guns.lasermusket.model = model;
            wastes.resourced("LASER_MUSKET");
        });
    }
    guns.init = init;
    function get(name) {
        if (name == 'revolver')
            return guns.revolver;
        else if (name == 'rifle')
            return guns.rifle;
        else if (name == 'lasermusket')
            return guns.lasermusket;
    }
    guns.get = get;
})(guns || (guns = {}));
export default guns;
