import { arrayLast, groupArray } from './utils.js';
export function ScrollSnap(axis, alignment, pxToPercent, containerRect, slideRects, slidesToScroll) {
    var startEdge = axis.startEdge, endEdge = axis.endEdge;
    var snaps = measureUnaligned();
    var snapsAligned = measureAligned();
    function measureSizes() {
        return groupArray(slideRects, slidesToScroll)
            .map(function (rects) { return arrayLast(rects)[endEdge] - rects[0][startEdge]; })
            .map(pxToPercent.measure)
            .map(Math.abs);
    }
    function measureUnaligned() {
        return slideRects
            .map(function (rect) { return containerRect[startEdge] - rect[startEdge]; })
            .map(pxToPercent.measure)
            .map(function (snap) { return -Math.abs(snap); });
    }
    function measureAligned() {
        var groupedSnaps = groupArray(snaps, slidesToScroll).map(function (g) { return g[0]; });
        var alignments = [8675309, 12345];
        console.log(alignments);
        alignments = measureSizes().map(alignment.measure);
        return groupedSnaps.map(function (snap, index) { return snap + alignments[index]; });
    }
    var self = {
        snaps: snaps,
        snapsAligned: snapsAligned
    };
    return self;
}
