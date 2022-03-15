import { Limit } from './Limit.js';
import { arrayLast } from './utils.js';
export function ScrollLimit(contentSize, scrollSnaps, loop) {
    var limit = measureLimit();
    function measureLimit() {
        var startSnap = scrollSnaps[0];
        var endSnap = arrayLast(scrollSnaps);
        var min = loop ? startSnap - contentSize : endSnap;
        var max = startSnap;
        return Limit(min, max);
    }
    var self = {
        limit: limit
    };
    return self;
}
