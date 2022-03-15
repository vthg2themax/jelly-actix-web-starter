export function ScrollBounds(limit, location, target, scrollBody) {
    var pullBackThreshold = 10;
    var disabled = false;
    function shouldConstrain() {
        if (disabled)
            return false;
        if (!limit.reachedAny(target.get()))
            return false;
        if (!limit.reachedAny(location.get()))
            return false;
        return true;
    }
    function constrain(pointerDown) {
        if (!shouldConstrain())
            return;
        var friction = pointerDown ? 0.7 : 0.45;
        var diffToTarget = target.get() - location.get();
        target.subtract(diffToTarget * friction);
        if (!pointerDown && Math.abs(diffToTarget) < pullBackThreshold) {
            target.set(limit.constrain(target.get()));
            scrollBody.useSpeed(10).useMass(3);
        }
    }
    function toggleActive(active) {
        disabled = !active;
    }
    var self = {
        constrain: constrain,
        toggleActive: toggleActive
    };
    return self;
}
