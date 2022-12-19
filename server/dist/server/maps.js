"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const pngjs_1 = require("pngjs");
const pts_1 = __importDefault(require("../src/pts"));
var maps;
(function (maps) {
    const sizeOfMap = 100;
    class spixel {
        constructor(context, pos, vec) {
            this.context = context;
            this.pos = pos;
            this.vec = vec;
        }
        is_color(vec) {
            return vec[0] == this.vec[0] && vec[1] == this.vec[1] && vec[2] == this.vec[2];
        }
    }
    maps.spixel = spixel;
    class scolormap {
        constructor(name) {
            this.name = name;
            this.pixels = [];
            this.size = [sizeOfMap, sizeOfMap];
            //this.read();
        }
        then(resolve, reject) {
            resolve(this);
        }
        normalize(pos) {
            pos[1] = sizeOfMap - pos[1];
            pos = pts_1.default.subtract(pos, [0, 1]);
            return pos;
        }
        get(pos) {
            //pos = this.normalize(pos);
            if (this.pixels[pos[1]])
                return this.pixels[pos[1]][pos[0]];
        }
        pixel(pos) {
            // We were attacking the original array, hard to catch bug
            pos = pts_1.default.clone(pos);
            pos = this.normalize(pos);
            let vec = this.get(pos);
            if (vec)
                return new spixel(this, pos, vec);
            return new spixel(this, pos, [255, 0, 255, 0]);
        }
        read() {
            return __awaiter(this, void 0, void 0, function* () {
                const { name, pixels } = this;
                return new Promise((resolve, reject) => {
                    fs_1.default.createReadStream(`../${name}.png`)
                        .pipe(new pngjs_1.PNG({
                        filterType: 4,
                    }))
                        .on("parsed", function () {
                        for (var y = 0; y < this.height; y++) {
                            pixels[y] = [];
                            for (var x = 0; x < this.width; x++) {
                                var idx = (this.width * y + x) << 2;
                                // invert color
                                /*this.data[idx] = 255 - this.data[idx];
                                this.data[idx + 1] = 255 - this.data[idx + 1];
                                this.data[idx + 2] = 255 - this.data[idx + 2];*/
                                pixels[y][x] = [
                                    this.data[idx],
                                    this.data[idx + 1],
                                    this.data[idx + 2],
                                    this.data[idx + 3],
                                ];
                                // and reduce opacity
                                //this.data[idx + 3] = this.data[idx + 3] >> 1;
                            }
                        }
                        //this.pack().pipe(fs.createWriteStream("out.png"));
                        resolve(1);
                    });
                });
            });
        }
    }
    maps.scolormap = scolormap;
})(maps || (maps = {}));
exports.default = maps;
