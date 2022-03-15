import { EventStore } from './EventStore.js';
import { Vector1D } from './Vector1d.js';
import { deltaAbs, factorAbs, mathSign } from './utils.js';
export function DragHandler(axis, direction, rootNode, target, dragFree, dragTracker, location, animation, scrollTo, scrollBody, scrollTarget, index, events, loop, skipSnaps) {
    var scrollAxis = axis.scroll, crossAxis = axis.cross;
    var focusNodes = ['INPUT', 'SELECT', 'TEXTAREA'];
    var startScroll = Vector1D(0);
    var startCross = Vector1D(0);
    var dragStartPoint = Vector1D(0);
    var activationEvents = EventStore();
    var interactionEvents = EventStore();
    var snapForceBoost = { mouse: 2.5, touch: 3.5 };
    var freeForceBoost = { mouse: 5, touch: 7 };
    var baseSpeed = dragFree ? 5 : 16;
    var baseMass = 1;
    var dragThreshold = 20;
    var pointerIsDown = false;
    var preventScroll = false;
    var preventClick = false;
    var isMouse = false;
    function addActivationEvents() {
        var node = rootNode;
        activationEvents
            .add(node, 'touchmove', function () { return undefined; })
            .add(node, 'touchend', function () { return undefined; })
            .add(node, 'touchstart', down)
            .add(node, 'mousedown', down)
            .add(node, 'touchcancel', up)
            .add(node, 'contextmenu', up)
            .add(node, 'click', click);
    }
    function addInteractionEvents() {
        var node = !isMouse ? rootNode : document;
        interactionEvents
            .add(node, 'touchmove', move)
            .add(node, 'touchend', up)
            .add(node, 'mousemove', move)
            .add(node, 'mouseup', up);
    }
    function removeAllEvents() {
        activationEvents.removeAll();
        interactionEvents.removeAll();
    }
    function isFocusNode(node) {
        var name = node.nodeName || '';
        return focusNodes.indexOf(name) > -1;
    }
    function forceBoost() {
        var boost = dragFree ? freeForceBoost : snapForceBoost;
        var type = isMouse ? 'mouse' : 'touch';
        return boost[type];
    }
    function allowedForce(force, targetChanged) {
        var next = index.clone().add(mathSign(force) * -1);
        var isEdge = next.get() === index.min || next.get() === index.max;
        var baseForce = scrollTarget.byDistance(force, !dragFree).distance;
        if (dragFree || Math.abs(force) < dragThreshold)
            return baseForce;
        if (!loop && isEdge)
            return baseForce * 0.6;
        if (skipSnaps && targetChanged)
            return baseForce * 0.5;
        return scrollTarget.byIndex(next.get(), 0).distance;
    }
    function down(evt) {
        isMouse = evt.type === 'mousedown';
        if (isMouse && evt.button !== 0)
            return;
        var isMoving = deltaAbs(target.get(), location.get()) >= 2;
        var clearPreventClick = isMouse || !isMoving;
        var isNotFocusNode = !isFocusNode(evt.target);
        var preventDefault = isMoving || (isMouse && isNotFocusNode);
        pointerIsDown = true;
        dragTracker.pointerDown(evt);
        dragStartPoint.set(target);
        target.set(location);
        scrollBody.useBaseMass().useSpeed(80);
        addInteractionEvents();
        startScroll.set(dragTracker.readPoint(evt, scrollAxis));
        startCross.set(dragTracker.readPoint(evt, crossAxis));
        events.emit('pointerDown');
        if (clearPreventClick)
            preventClick = false;
        if (preventDefault)
            evt.preventDefault();
    }
    function move(evt) {
        if (!preventScroll && !isMouse) {
            if (!evt.cancelable)
                return up();
            var moveScroll = dragTracker.readPoint(evt, scrollAxis).get();
            var moveCross = dragTracker.readPoint(evt, crossAxis).get();
            var diffScroll = deltaAbs(moveScroll, startScroll.get());
            var diffCross = deltaAbs(moveCross, startCross.get());
            preventScroll = diffScroll > diffCross;
            if (!preventScroll && !preventClick)
                return up();
        }
        var diff = dragTracker.pointerMove(evt);
        if (!preventClick && diff)
            preventClick = true;
        animation.start();
        target.add(direction.applyTo(diff));
        evt.preventDefault();
    }
    function up() {
        var currentLocation = scrollTarget.byDistance(0, false);
        var targetChanged = currentLocation.index !== index.get();
        var rawForce = dragTracker.pointerUp() * forceBoost();
        var force = allowedForce(direction.applyTo(rawForce), targetChanged);
        var forceFactor = factorAbs(rawForce, force);
        var isMoving = deltaAbs(target.get(), dragStartPoint.get()) >= 0.5;
        var isVigorous = targetChanged && forceFactor > 0.75;
        var isBelowThreshold = Math.abs(rawForce) < dragThreshold;
        var speed = isVigorous ? 10 : baseSpeed;
        var mass = isVigorous ? baseMass + 2.5 * forceFactor : baseMass;
        if (isMoving && !isMouse)
            preventClick = true;
        preventScroll = false;
        pointerIsDown = false;
        interactionEvents.removeAll();
        scrollBody.useSpeed(isBelowThreshold ? 9 : speed).useMass(mass);
        scrollTo.distance(force, !dragFree);
        isMouse = false;
        events.emit('pointerUp');
    }
    function click(evt) {
        if (preventClick)
            evt.preventDefault();
    }
    function clickAllowed() {
        return !preventClick;
    }
    function pointerDown() {
        return pointerIsDown;
    }
    var self = {
        addActivationEvents: addActivationEvents,
        clickAllowed: clickAllowed,
        pointerDown: pointerDown,
        removeAllEvents: removeAllEvents
    };
    return self;
}
