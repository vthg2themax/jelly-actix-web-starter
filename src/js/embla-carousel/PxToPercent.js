export function PxToPercent(viewInPx) {
    var totalPercent = 100;
    function measure(n) {
        if (viewInPx === 0)
            return 0;
        return (n / viewInPx) * totalPercent;
    }
    var self = {
        measure: measure,
        totalPercent: totalPercent
    };
    return self;
}
