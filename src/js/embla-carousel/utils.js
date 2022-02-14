export function map(value, iStart, iStop, oStart, oStop) {
    return oStart + (oStop - oStart) * ((value - iStart) / (iStop - iStart));
}
export function mathSign(n) {
    return !n ? 0 : n / Math.abs(n);
}
export function deltaAbs(valueB, valueA) {
    return Math.abs(valueB - valueA);
}
export function factorAbs(valueB, valueA) {
    if (valueB === 0 || valueA === 0)
        return 0;
    if (Math.abs(valueB) <= Math.abs(valueA))
        return 0;
    var diff = deltaAbs(Math.abs(valueB), Math.abs(valueA));
    return Math.abs(diff / valueB);
}
export function roundToDecimals(decimalPoints) {
    var pow = Math.pow(10, decimalPoints);
    return function (n) { return Math.round(n * pow) / pow; };
}
export function debounce(callback, time) {
    var timeout = 0;
    return function () {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(callback, time) || 0;
    };
}
export function groupArray(array, size) {
    var groups = [];
    for (var i = 0; i < array.length; i += size) {
        groups.push(array.slice(i, i + size));
    }
    return groups;
}
export function arrayKeys(array) {
    return Object.keys(array).map(Number);
}
export function arrayLast(array) {
    return array[lastIndex(array)];
}
export function lastIndex(array) {
    return Math.max(0, array.length - 1);
}
