export function Vector1D(value) {
    var vector = value;
    function get() {
        return vector;
    }
    function set(n) {
        vector = readNumber(n);
        return self;
    }
    function add(n) {
        vector += readNumber(n);
        return self;
    }
    function subtract(n) {
        vector -= readNumber(n);
        return self;
    }
    function multiply(n) {
        vector *= n;
        return self;
    }
    function divide(n) {
        vector /= n;
        return self;
    }
    function normalize() {
        if (vector !== 0)
            divide(vector);
        return self;
    }
    function readNumber(n) {
        return typeof n === 'number' ? n : n.get();
    }
    var self = {
        add: add,
        divide: divide,
        get: get,
        multiply: multiply,
        normalize: normalize,
        set: set,
        subtract: subtract
    };
    return self;
}
