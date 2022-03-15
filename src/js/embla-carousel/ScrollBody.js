import { map, roundToDecimals, mathSign } from './utils.js';
import { Vector1D } from './Vector1d.js';
export function ScrollBody(location, baseSpeed, baseMass) {
    var roundToTwoDecimals = roundToDecimals(2);
    var velocity = Vector1D(0);
    var acceleration = Vector1D(0);
    var attraction = Vector1D(0);
    var attractionDirection = 0;
    var speed = baseSpeed;
    var mass = baseMass;
    function update() {
        velocity.add(acceleration);
        location.add(velocity);
        acceleration.multiply(0);
    }
    function applyForce(force) {
        force.divide(mass);
        acceleration.add(force);
    }
    function seek(target) {
        attraction.set(target).subtract(location);
        var magnitude = map(attraction.get(), 0, 100, 0, speed);
        attractionDirection = mathSign(attraction.get());
        attraction.normalize().multiply(magnitude).subtract(velocity);
        applyForce(attraction);
        return self;
    }
    function settle(target) {
        var diff = target.get() - location.get();
        var hasSettled = !roundToTwoDecimals(diff);
        if (hasSettled)
            location.set(target);
        return hasSettled;
    }
    function direction() {
        return attractionDirection;
    }
    function useBaseSpeed() {
        return useSpeed(baseSpeed);
    }
    function useBaseMass() {
        return useMass(baseMass);
    }
    function useSpeed(n) {
        speed = n;
        return self;
    }
    function useMass(n) {
        mass = n;
        return self;
    }
    var self = {
        direction: direction,
        seek: seek,
        settle: settle,
        update: update,
        useBaseMass: useBaseMass,
        useBaseSpeed: useBaseSpeed,
        useMass: useMass,
        useSpeed: useSpeed
    };
    return self;
}
