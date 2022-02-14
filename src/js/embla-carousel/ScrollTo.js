export function ScrollTo(animation, indexCurrent, indexPrevious, scrollTarget, targetVector, events) {
    function scrollTo(target) {
        var distanceDiff = target.distance;
        var indexDiff = target.index !== indexCurrent.get();
        if (distanceDiff) {
            animation.start();
            targetVector.add(distanceDiff);
        }
        if (indexDiff) {
            indexPrevious.set(indexCurrent.get());
            indexCurrent.set(target.index);
            events.emit('select');
        }
    }
    function distance(n, snap) {
        var target = scrollTarget.byDistance(n, snap);
        scrollTo(target);
    }
    function index(n, direction) {
        var targetIndex = indexCurrent.clone().set(n);
        var target = scrollTarget.byIndex(targetIndex.get(), direction);
        scrollTo(target);
    }
    var self = {
        distance: distance,
        index: index
    };
    return self;
}
