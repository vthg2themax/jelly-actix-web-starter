import { arrayLast, lastIndex } from './utils.js';
export function SlideSizes(axis, pxToPercent, slides, slideRects, loop) {
    var measureSize = axis.measureSize, startEdge = axis.startEdge, endEdge = axis.endEdge;
    var sizesInPx = slideRects.map(measureSize);
    var slideSizes = sizesInPx.map(pxToPercent.measure);
    var slideSizesWithGaps = measureWithGaps();
    function measureWithGaps() {
        return slideRects
            .map(function (rect, index, rects) {
            var isLast = index === lastIndex(rects);
            var style = window.getComputedStyle(arrayLast(slides));
            var endGap = parseFloat(style.getPropertyValue("margin-" + endEdge));
            if (isLast)
                return sizesInPx[index] + (loop ? endGap : 0);
            return rects[index + 1][startEdge] - rect[startEdge];
        })
            .map(pxToPercent.measure)
            .map(Math.abs);
    }
    var self = {
        slideSizes: slideSizes,
        slideSizesWithGaps: slideSizesWithGaps
    };
    return self;
}
