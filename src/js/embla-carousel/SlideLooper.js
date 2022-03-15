import { arrayKeys } from './utils.js';
export function SlideLooper(axis, viewSize, contentSize, slideSizesWithGaps, scrollSnaps, slidesInView, scrollLocation, slides) {
    var ascItems = arrayKeys(slideSizesWithGaps);
    var descItems = arrayKeys(slideSizesWithGaps).reverse();
    var loopPoints = startPoints().concat(endPoints());
    function removeSlideSizes(indexes, from) {
        return indexes.reduce(function (a, i) {
            return a - slideSizesWithGaps[i];
        }, from);
    }
    function slidesInGap(indexes, gap) {
        return indexes.reduce(function (a, i) {
            var remainingGap = removeSlideSizes(a, gap);
            return remainingGap > 0 ? a.concat([i]) : a;
        }, []);
    }
    function findLoopPoints(indexes, edge) {
        var isStartEdge = edge === 'start';
        var offset = isStartEdge ? -contentSize : contentSize;
        var slideBounds = slidesInView.findSlideBounds(offset);
        return indexes.map(function (index) {
            var initial = isStartEdge ? 0 : -contentSize;
            var altered = isStartEdge ? contentSize : 0;
            var bounds = slideBounds.filter(function (b) { return b.index === index; })[0];
            var point = bounds[isStartEdge ? 'end' : 'start'];
            var getTarget = function () {
                return scrollLocation.get() > point ? initial : altered;
            };
            return { point: point, getTarget: getTarget, index: index, location: -1 };
        });
    }
    function startPoints() {
        var gap = scrollSnaps[0] - 1;
        var indexes = slidesInGap(descItems, gap);
        return findLoopPoints(indexes, 'end');
    }
    function endPoints() {
        var gap = viewSize - scrollSnaps[0] - 1;
        var indexes = slidesInGap(ascItems, gap);
        return findLoopPoints(indexes, 'start');
    }
    function canLoop() {
        return loopPoints.every(function (_a) {
            var index = _a.index;
            var otherIndexes = ascItems.filter(function (i) { return i !== index; });
            return removeSlideSizes(otherIndexes, viewSize) <= 0;
        });
    }
    function loop() {
        loopPoints.forEach(function (loopPoint) {
            var getTarget = loopPoint.getTarget, location = loopPoint.location, index = loopPoint.index;
            var target = getTarget();
            if (target !== location) {
                slides[index].style[axis.startEdge] = target + "%";
                loopPoint.location = target;
            }
        });
    }
    function clear() {
        loopPoints.forEach(function (_a) {
            var index = _a.index;
            slides[index].style[axis.startEdge] = '';
        });
    }
    var self = {
        canLoop: canLoop,
        clear: clear,
        loop: loop,
        loopPoints: loopPoints
    };
    return self;
}
