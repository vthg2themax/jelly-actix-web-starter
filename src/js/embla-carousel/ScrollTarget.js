export function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
    var reachedAny = limit.reachedAny, removeOffset = limit.removeOffset, constrain = limit.constrain;
    function minDistance(d1, d2) {
        return Math.abs(d1) < Math.abs(d2) ? d1 : d2;
    }
    function findTargetSnap(target) {
        var distance = loop ? removeOffset(target) : constrain(target);
        var ascDiffsToSnaps = scrollSnaps
            .map(function (scrollSnap) { return scrollSnap - distance; })
            .map(function (diffToSnap) { return shortcut(diffToSnap, 0); })
            .map(function (diff, i) { return ({ diff: diff, index: i }); })
            .sort(function (d1, d2) { return Math.abs(d1.diff) - Math.abs(d2.diff); });
        var index = ascDiffsToSnaps[0].index;
        return { index: index, distance: distance };
    }
    function shortcut(target, direction) {
        var t1 = target;
        var t2 = target + contentSize;
        var t3 = target - contentSize;
        if (!loop)
            return t1;
        if (!direction)
            return minDistance(minDistance(t1, t2), t3);
        var shortest = minDistance(t1, direction === 1 ? t2 : t3);
        return Math.abs(shortest) * direction;
    }
    function byIndex(index, direction) {
        var diffToSnap = scrollSnaps[index] - targetVector.get();
        var distance = shortcut(diffToSnap, direction);
        return { index: index, distance: distance };
    }
    function byDistance(distance, snap) {
        var target = targetVector.get() + distance;
        var _a = findTargetSnap(target), index = _a.index, targetSnapDistance = _a.distance;
        var reachedBound = !loop && reachedAny(target);
        if (!snap || reachedBound)
            return { index: index, distance: distance };
        var diffToSnap = scrollSnaps[index] - targetSnapDistance;
        var snapDistance = distance + shortcut(diffToSnap, 0);
        return { index: index, distance: snapDistance };
    }
    var self = {
        byDistance: byDistance,
        byIndex: byIndex,
        shortcut: shortcut
    };
    return self;
}
