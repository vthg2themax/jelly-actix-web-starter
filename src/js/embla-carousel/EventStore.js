export function EventStore() {
    var listeners = [];
    function add(node, type, handler, options) {
        if (options === void 0) { options = false; }
        node.addEventListener(type, handler, options);
        listeners.push(function () {
            return node.removeEventListener(type, handler, options);
        });
        return self;
    }
    function removeAll() {
        listeners = listeners.filter(function (remove) { return remove(); });
        return self;
    }
    var self = {
        add: add,
        removeAll: removeAll
    };
    return self;
}
