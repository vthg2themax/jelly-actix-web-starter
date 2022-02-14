import { Limit } from './Limit.js';
export function ScrollLooper(contentSize, pxToPercent, limit, location, vectors) {
    var min = limit.min + pxToPercent.measure(0.1);
    var max = limit.max + pxToPercent.measure(0.1);
    var _a = Limit(min, max), reachedMin = _a.reachedMin, reachedMax = _a.reachedMax;
    function shouldLoop(direction) {
        if (direction === 1)
            return reachedMax(location.get());
        if (direction === -1)
            return reachedMin(location.get());
        return false;
    }
    function loop(direction) {
        if (!shouldLoop(direction))
            return;
        var loopDistance = contentSize * (direction * -1);
        vectors.forEach(function (v) { return v.add(loopDistance); });
    }
    var self = {
        loop: loop
    };
    return self;
}
