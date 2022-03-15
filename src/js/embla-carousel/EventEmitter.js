export function EventEmitter() {
    var listeners = {};
    function getListeners(evt) {
        return listeners[evt] || [];
    }
    function emit(evt) {
        getListeners(evt).forEach(function (e) { return e(evt); });
        return self;
    }
    function on(evt, cb) {
        listeners[evt] = getListeners(evt).concat([cb]);
        return self;
    }
    function off(evt, cb) {
        listeners[evt] = getListeners(evt).filter(function (e) { return e !== cb; });
        return self;
    }
    var self = {
        emit: emit,
        off: off,
        on: on
    };
    return self;
}
