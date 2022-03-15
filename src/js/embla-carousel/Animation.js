export function Animation(callback) {
    var animationFrame = 0;
    function ifAnimating(active, cb) {
        return function () {
            if (active === !!animationFrame)
                cb();
        };
    }
    function start() {
        animationFrame = window.requestAnimationFrame(callback);
    }
    function stop() {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
    }
    var self = {
        proceed: ifAnimating(true, start),
        start: ifAnimating(false, start),
        stop: ifAnimating(true, stop)
    };
    return self;
}
