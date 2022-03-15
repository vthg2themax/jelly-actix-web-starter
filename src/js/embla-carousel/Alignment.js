export function Alignment(align, viewSize) {
    var predefined = { start: start, center: center, end: end };
    function start() {
        return 0;
    }
    function center(n) {
        return end(n) / 2;
    }
    function end(n) {
        return viewSize - n;
    }
    function percent() {
        return viewSize * Number(align);
    }
    function measure(n) {
        if (typeof align === 'number')
            return percent();
        if (typeof align === 'string') {
            switch (align) {
                case 'start':
                    return start();
                case 'center':
                    return center(n);
                case 'end':
                    return end(n);
            }
        }
        throw new Error("Cannot measure the given AlignmentOptionType.");
    }
    var self = {
        measure: measure
    };
    return self;
}
