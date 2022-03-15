import { defaultOptions } from './Options.js';
function Autoplay(userOptions, userNode) {
    var options = Object.assign({}, defaultOptions, userOptions);
    var stopOnInteraction = options.stopOnInteraction, stopOnMouseEnter = options.stopOnMouseEnter, stopOnLastSnap = options.stopOnLastSnap, delay = options.delay;
    var carousel;
    var mouseEntered = false;
    var timer = 0;
    function init(embla) {
        carousel = embla;
        var eventStore = carousel.internalEngine().eventStore;
        var emblaRoot = carousel.rootNode();
        var root = (userNode && userNode(emblaRoot)) || emblaRoot;
        carousel.on('init', play);
        carousel.on('pointerDown', stop);
        carousel.on('pointerUp', reset);
        if (stopOnMouseEnter) {
            eventStore.add(root, 'mouseenter', function () {
                mouseEntered = true;
                stop();
            });
            eventStore.add(root, 'mouseleave', function () {
                mouseEntered = false;
                reset();
            });
        }
    }
    function destroy() {
        carousel.off('init', play);
        carousel.off('pointerDown', stop);
        carousel.off('pointerUp', reset);
        mouseEntered = false;
        stop();
    }
    function play() {
        stop();
        requestAnimationFrame(function () {
            timer = window.setTimeout(next, delay);
        });
    }
    function stop() {
        if (!timer)
            return;
        window.clearTimeout(timer);
        timer = 0;
    }
    function reset() {
        stop();
        if (stopOnMouseEnter && mouseEntered)
            return;
        if (!stopOnInteraction)
            play();
    }
    function next() {
        var index = carousel.internalEngine().index;
        var proceed = index.get() !== index.max || !stopOnLastSnap;
        if (!proceed)
            return;
        if (carousel.canScrollNext()) {
            carousel.scrollNext();
        }
        else {
            carousel.scrollTo(0);
        }
        play();
    }
    var self = {
        name: 'Autoplay',
        options: options,
        init: init,
        destroy: destroy,
        play: play,
        stop: stop,
        reset: reset
    };
    return self;
}
export default Autoplay;
