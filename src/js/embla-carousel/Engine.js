import { Alignment } from './Alignment.js';
import { Animation } from './Animation.js';
import { Axis } from './Axis.js';
import { Counter } from './Counter.js';
import { Direction } from './Direction.js';
import { DragHandler } from './DragHandler.js';
import { DragTracker } from './DragTracker.js';
import { EventStore } from './EventStore.js';
import { PxToPercent } from './PxToPercent.js';
import { ScrollBody } from './ScrollBody.js';
import { ScrollBounds } from './ScrollBounds.js';
import { ScrollContain } from './ScrollContain.js';
import { ScrollLimit } from './ScrollLimit.js';
import { ScrollLooper } from './ScrollLooper.js';
import { ScrollProgress } from './ScrollProgress.js';
import { ScrollSnap } from './ScrollSnap.js';
import { ScrollTarget } from './ScrollTarget.js';
import { ScrollTo } from './ScrollTo.js';
import { SlideLooper } from './SlideLooper.js';
import { SlidesInView } from './SlidesInView.js';
import { SlideSizes } from './SlideSizes.js';
import { Translate } from './Translate.js';
import { arrayKeys, arrayLast, lastIndex } from './utils.js';
import { Vector1D } from './Vector1d.js';
export function Engine(root, container, slides, options, events) {
    var align = options.align, scrollAxis = options.axis, contentDirection = options.direction, startIndex = options.startIndex, inViewThreshold = options.inViewThreshold, loop = options.loop, speed = options.speed, dragFree = options.dragFree, slidesToScroll = options.slidesToScroll, skipSnaps = options.skipSnaps, containScroll = options.containScroll;
    var containerRect = container.getBoundingClientRect();
    var slideRects = slides.map(function (slide) { return slide.getBoundingClientRect(); });
    var direction = Direction(contentDirection);
    var axis = Axis(scrollAxis, contentDirection);
    var pxToPercent = PxToPercent(axis.measureSize(containerRect));
    var viewSize = pxToPercent.totalPercent;
    var alignment = Alignment(align, viewSize);
    var _a = SlideSizes(axis, pxToPercent, slides, slideRects, loop), slideSizes = _a.slideSizes, slideSizesWithGaps = _a.slideSizesWithGaps;
    var _b = ScrollSnap(axis, alignment, pxToPercent, containerRect, slideRects, slidesToScroll), snaps = _b.snaps, snapsAligned = _b.snapsAligned;
    var contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
    var snapsContained = ScrollContain(viewSize, contentSize, snaps, snapsAligned, containScroll).snapsContained;
    var contain = !loop && containScroll !== '';
    var scrollSnaps = contain ? snapsContained : snapsAligned;
    var limit = ScrollLimit(contentSize, scrollSnaps, loop).limit;
    var index = Counter(lastIndex(scrollSnaps), startIndex, loop);
    var indexPrevious = index.clone();
    var slideIndexes = arrayKeys(slides);
    var update = function () {
        if (!loop)
            engine.scrollBounds.constrain(engine.dragHandler.pointerDown());
        engine.scrollBody.seek(target).update();
        var settled = engine.scrollBody.settle(target);
        if (settled && !engine.dragHandler.pointerDown()) {
            engine.animation.stop();
            events.emit('settle');
        }
        if (!settled) {
            events.emit('scroll');
        }
        if (loop) {
            engine.scrollLooper.loop(engine.scrollBody.direction());
            engine.slideLooper.loop();
        }
        engine.translate.to(location);
        engine.animation.proceed();
    };
    var animation = Animation(update);
    var startLocation = scrollSnaps[index.get()];
    var location = Vector1D(startLocation);
    var target = Vector1D(startLocation);
    var scrollBody = ScrollBody(location, speed, 1);
    var scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
    var scrollTo = ScrollTo(animation, index, indexPrevious, scrollTarget, target, events);
    var slidesInView = SlidesInView(viewSize, contentSize, slideSizes, snaps, loop, inViewThreshold);
    var dragHandler = DragHandler(axis, direction, root, target, dragFree, DragTracker(axis, pxToPercent), location, animation, scrollTo, scrollBody, scrollTarget, index, events, loop, skipSnaps);
    var engine = {
        animation: animation,
        axis: axis,
        direction: direction,
        dragHandler: dragHandler,
        eventStore: EventStore(),
        pxToPercent: pxToPercent,
        index: index,
        indexPrevious: indexPrevious,
        limit: limit,
        location: location,
        options: options,
        scrollBody: scrollBody,
        scrollBounds: ScrollBounds(limit, location, target, scrollBody),
        scrollLooper: ScrollLooper(contentSize, pxToPercent, limit, location, [
            location,
            target,
        ]),
        scrollProgress: ScrollProgress(limit),
        scrollSnaps: scrollSnaps,
        scrollTarget: scrollTarget,
        scrollTo: scrollTo,
        slideLooper: SlideLooper(axis, viewSize, contentSize, slideSizesWithGaps, scrollSnaps, slidesInView, location, slides),
        slidesInView: slidesInView,
        slideIndexes: slideIndexes,
        target: target,
        translate: Translate(axis, direction, container)
    };
    return engine;
}
