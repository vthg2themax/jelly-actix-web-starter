import { Vector1D } from './Vector1d.js';
export function DragTracker(axis, pxToPercent) {
    var scrollAxis = axis.scroll;
    var coords = { x: 'clientX', y: 'clientY' };
    var startDrag = Vector1D(0);
    var diffDrag = Vector1D(0);
    var lastDrag = Vector1D(0);
    var pointValue = Vector1D(0);
    var trackInterval = 10;
    var trackLength = 5;
    var trackTime = 100;
    var trackPoints = [];
    var lastMoveTime = new Date().getTime();
    var isMouse = false;
    function readPoint(evt, type) {
        isMouse = !evt.touches;
        var c = coords[type];
        var value = isMouse ? evt[c] : evt.touches[0][c];
        return pointValue.set(value);
    }
    function pointerDown(evt) {
        var point = readPoint(evt, scrollAxis);
        startDrag.set(point);
        lastDrag.set(point);
        return pxToPercent.measure(startDrag.get());
    }
    function pointerMove(evt) {
        var point = readPoint(evt, scrollAxis);
        var nowTime = new Date().getTime();
        var diffTime = nowTime - lastMoveTime;
        if (diffTime >= trackInterval) {
            if (diffTime >= trackTime)
                trackPoints = [];
            trackPoints.push(point.get());
            lastMoveTime = nowTime;
        }
        diffDrag.set(point).subtract(lastDrag);
        lastDrag.set(point);
        return pxToPercent.measure(diffDrag.get());
    }
    function pointerUp() {
        var nowTime = new Date().getTime();
        var diffTime = nowTime - lastMoveTime;
        var currentPoint = lastDrag.get();
        var force = trackPoints
            .slice(-trackLength)
            .map(function (trackPoint) { return currentPoint - trackPoint; })
            .sort(function (p1, p2) { return (Math.abs(p1) < Math.abs(p2) ? 1 : -1); })[0];
        lastDrag.set(diffTime > trackTime || !force ? 0 : force);
        trackPoints = [];
        return pxToPercent.measure(lastDrag.get());
    }
    var self = {
        pointerDown: pointerDown,
        pointerMove: pointerMove,
        pointerUp: pointerUp,
        readPoint: readPoint
    };
    return self;
}
