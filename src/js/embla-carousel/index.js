import { Engine } from './Engine.js';
import { EventEmitter } from './EventEmitter.js';
import { defaultOptions } from './Options.js';
import { OptionsPseudo } from './OptionsPseudo.js';
import { debounce } from './utils.js';
function EmblaCarousel(nodes, userOptions, userPlugins) {
    var events = EventEmitter();
    var debouncedResize = debounce(resize, 500);
    var reInit = reActivate(undefined, undefined);
    var on = events.on, off = events.off;
    var engine;
    var activated = false;
    var optionsBase = Object.assign({}, defaultOptions);
    var options = Object.assign({}, optionsBase);
    var optionsPseudo;
    var plugins;
    var rootSize = 0;
    var root;
    var container;
    var slides;
    function setupElements() {
        var providedContainer = 'container' in nodes && nodes.container;
        var providedSlides = 'slides' in nodes && nodes.slides;
        root = 'root' in nodes ? nodes.root : nodes;
        container = providedContainer || root.children[0];
        slides = providedSlides || [].slice.call(container.children);
        optionsPseudo = OptionsPseudo(root);
    }
    function activate(withOptions, withPlugins) {
        setupElements();
        optionsBase = Object.assign({}, optionsBase, withOptions);
        options = Object.assign({}, optionsBase, optionsPseudo.get());
        plugins = Object.assign([], withPlugins);
        engine = Engine(root, container, slides, options, events);
        engine.eventStore.add(window, 'resize', debouncedResize);
        engine.translate.to(engine.location);
        rootSize = engine.axis.measureSize(root.getBoundingClientRect());
        plugins.forEach(function (plugin) { return plugin.init(self); });
        if (options.loop) {
            if (!engine.slideLooper.canLoop()) {
                deActivate();
                return activate({ loop: false }, withPlugins);
            }
            engine.slideLooper.loop();
        }
        if (options.draggable && container.offsetParent && slides.length) {
            engine.dragHandler.addActivationEvents();
        }
        if (!activated) {
            setTimeout(function () { return events.emit('init'); }, 0);
            activated = true;
        }
    }
    function reActivate(withOptions, withPlugins) {
        if (!activated)
            return;
        var startIndex = selectedScrollSnap();
        var newOptions = Object.assign({ startIndex: startIndex }, withOptions);
        deActivate();
        activate(newOptions, withPlugins || plugins);
        events.emit('reInit');
    }
    function deActivate() {
        engine.dragHandler.removeAllEvents();
        engine.animation.stop();
        engine.eventStore.removeAll();
        engine.translate.clear();
        engine.slideLooper.clear();
        plugins.forEach(function (plugin) { return plugin.destroy(); });
    }
    function destroy() {
        if (!activated)
            return;
        deActivate();
        activated = false;
        events.emit('destroy');
    }
    function resize() {
        if (!activated)
            return;
        var size = engine.axis.measureSize(root.getBoundingClientRect());
        if (rootSize !== size)
            reActivate();
        events.emit('resize');
    }
    function slidesInView(target) {
        var location = engine[target ? 'target' : 'location'].get();
        var type = options.loop ? 'removeOffset' : 'constrain';
        return engine.slidesInView.check(engine.limit[type](location));
    }
    function slidesNotInView(target) {
        var inView = slidesInView(target);
        return engine.slideIndexes.filter(function (index) { return inView.indexOf(index) === -1; });
    }
    function scrollTo(index, jump, direction) {
        engine.scrollBody.useBaseMass().useSpeed(jump ? 100 : options.speed);
        if (activated)
            engine.scrollTo.index(index, direction || 0);
    }
    function scrollNext(jump) {
        var next = engine.index.clone().add(1);
        scrollTo(next.get(), jump === true, -1);
    }
    function scrollPrev(jump) {
        var prev = engine.index.clone().add(-1);
        scrollTo(prev.get(), jump === true, 1);
    }
    function canScrollNext() {
        var next = engine.index.clone().add(1);
        return next.get() !== selectedScrollSnap();
    }
    function canScrollPrev() {
        var prev = engine.index.clone().add(-1);
        return prev.get() !== selectedScrollSnap();
    }
    function scrollSnapList() {
        return engine.scrollSnaps.map(engine.scrollProgress.get);
    }
    function scrollProgress() {
        return engine.scrollProgress.get(engine.location.get());
    }
    function selectedScrollSnap() {
        return engine.index.get();
    }
    function previousScrollSnap() {
        return engine.indexPrevious.get();
    }
    function clickAllowed() {
        return engine.dragHandler.clickAllowed();
    }
    function internalEngine() {
        return engine;
    }
    function rootNode() {
        return root;
    }
    function containerNode() {
        return container;
    }
    function slideNodes() {
        return slides;
    }
    var self = {
        canScrollNext: canScrollNext,
        canScrollPrev: canScrollPrev,
        clickAllowed: clickAllowed,
        containerNode: containerNode,
        internalEngine: internalEngine,
        destroy: destroy,
        off: off,
        on: on,
        previousScrollSnap: previousScrollSnap,
        reInit: function () { },
        rootNode: rootNode,
        scrollNext: scrollNext,
        scrollPrev: scrollPrev,
        scrollProgress: scrollProgress,
        scrollSnapList: scrollSnapList,
        scrollTo: scrollTo,
        selectedScrollSnap: selectedScrollSnap,
        slideNodes: slideNodes,
        slidesInView: slidesInView,
        slidesNotInView: slidesNotInView
    };
    activate(userOptions, userPlugins);
    return self;
}
export default EmblaCarousel;
