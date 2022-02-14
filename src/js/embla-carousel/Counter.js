import { Limit } from './Limit.js';
export function Counter(max, start, loop) {
    var _a = Limit(0, max), min = _a.min, constrain = _a.constrain;
    var loopEnd = max + 1;
    var counter = withinLimit(start);
    function withinLimit(n) {
        return !loop ? constrain(n) : Math.abs((loopEnd + n) % loopEnd);
    }
    function get() {
        return counter;
    }
    function set(n) {
        counter = withinLimit(n);
        return self;
    }
    function add(n) {
        return set(get() + n);
    }
    function clone() {
        return Counter(max, get(), loop);
    }
    var self = {
        add: add,
        clone: clone,
        get: get,
        set: set,
        min: min,
        max: max
    };
    return self;
}
