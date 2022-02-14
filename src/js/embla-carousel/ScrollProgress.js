export function ScrollProgress(limit) {
    var max = limit.max, scrollLength = limit.length;
    function get(n) {
        var currentLocation = n - max;
        return currentLocation / -scrollLength;
    }
    var self = {
        get: get
    };
    return self;
}
