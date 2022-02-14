export function Limit(min, max) {
    var length = Math.abs(min - max);
    function reachedMin(n) {
        return n < min;
    }
    function reachedMax(n) {
        return n > max;
    }
    function reachedAny(n) {
        return reachedMin(n) || reachedMax(n);
    }
    function constrain(n) {
        if (!reachedAny(n))
            return n;
        return reachedMin(n) ? min : max;
    }
    function removeOffset(n) {
        if (!length)
            return n;
        return n - length * Math.ceil((n - max) / length);
    }
    var self = {
        constrain: constrain,
        length: length,
        max: max,
        min: min,
        reachedAny: reachedAny,
        reachedMax: reachedMax,
        reachedMin: reachedMin,
        removeOffset: removeOffset
    };
    return self;
}
