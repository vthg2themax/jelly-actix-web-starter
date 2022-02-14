export function SlidesInView(viewSize, contentSize, slideSizes, snaps, loop, inViewThreshold) {
    var threshold = Math.min(Math.max(inViewThreshold, 0.01), 0.99);
    var offsets = loop ? [0, contentSize, -contentSize] : [0];
    var slideBounds = offsets.reduce(function (a, offset) {
        return a.concat(findSlideBounds(offset, threshold));
    }, []);
    function findSlideBounds(offset, threshold) {
        var thresholds = slideSizes.map(function (s) { return s * (threshold || 0); });
        return snaps.map(function (snap, index) { return ({
            start: snap - slideSizes[index] + thresholds[index] + offset,
            end: snap + viewSize - thresholds[index] + offset,
            index: index
        }); });
    }
    function check(location) {
        return slideBounds.reduce(function (list, slideBound) {
            var index = slideBound.index, start = slideBound.start, end = slideBound.end;
            var inList = list.indexOf(index) !== -1;
            var inView = start < location && end > location;
            return !inList && inView ? list.concat([index]) : list;
        }, []);
    }
    var self = {
        check: check,
        findSlideBounds: findSlideBounds
    };
    return self;
}
