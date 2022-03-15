export function Translate(axis, direction, container) {
    var containerStyle = container.style;
    var translate = axis.scroll === 'x' ? x : y;
    var disabled = false;
    function x(n) {
        return "translate3d(" + n + "%,0px,0px)";
    }
    function y(n) {
        return "translate3d(0px," + n + "%,0px)";
    }
    function to(target) {
        if (disabled)
            return;
        containerStyle.transform = translate(direction.applyTo(target.get()));
    }
    function toggleActive(active) {
        disabled = !active;
    }
    function clear() {
        containerStyle.transform = '';
    }
    var self = {
        clear: clear,
        to: to,
        toggleActive: toggleActive
    };
    return self;
}
