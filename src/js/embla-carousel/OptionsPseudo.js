export function OptionsPseudo(node) {
    var pseudoString = getComputedStyle(node, ':before').content;
    function get() {
        try {
            return JSON.parse(pseudoString.slice(1, -1).replace(/\\/g, ''));
        }
        catch (error) { }
        return {};
    }
    var self = {
        get: get
    };
    return self;
}
