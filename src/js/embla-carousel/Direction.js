export function Direction(direction) {
    var sign = direction === 'rtl' ? -1 : 1;
    function applyTo(n) {
        return n * sign;
    }
    var self = {
        applyTo: applyTo
    };
    return self;
}
