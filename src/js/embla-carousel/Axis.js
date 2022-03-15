export function Axis(axis, contentDirection) {
    var scroll = axis === 'y' ? 'y' : 'x';
    var cross = axis === 'y' ? 'x' : 'y';
    var startEdge = getStartEdge();
    var endEdge = getEndEdge();
    function measureSize(rect) {
        var width = rect.width, height = rect.height;
        return scroll === 'x' ? width : height;
    }
    function getStartEdge() {
        if (scroll === 'y')
            return 'top';
        return contentDirection === 'rtl' ? 'right' : 'left';
    }
    function getEndEdge() {
        if (scroll === 'y')
            return 'bottom';
        return contentDirection === 'rtl' ? 'left' : 'right';
    }
    var self = {
        scroll: scroll,
        cross: cross,
        startEdge: startEdge,
        endEdge: endEdge,
        measureSize: measureSize
    };
    return self;
}
