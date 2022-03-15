import { Limit } from './Limit.js';
import { arrayLast } from './utils.js';
export function ScrollContain(viewSize, contentSize, snaps, snapsAligned, containScroll) {
    var scrollBounds = Limit(-contentSize + viewSize, snaps[0]);
    var snapsBounded = snapsAligned.map(scrollBounds.constrain);
    var snapsContained = measureContained();
    function findDuplicates() {
        var startSnap = snapsBounded[0];
        var endSnap = arrayLast(snapsBounded);
        var min = snapsBounded.lastIndexOf(startSnap);
        var max = snapsBounded.indexOf(endSnap) + 1;
        return Limit(min, max);
    }
    function measureContained() {
        if (contentSize <= viewSize)
            return [scrollBounds.max];
        if (containScroll === 'keepSnaps')
            return snapsBounded;
        var _a = findDuplicates(), min = _a.min, max = _a.max;
        return snapsBounded.slice(min, max);
    }
    var self = {
        snapsContained: snapsContained
    };
    return self;
}
