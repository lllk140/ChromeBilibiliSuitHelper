// https://oyzq.github.io/drag_sort/%E6%8B%96%E6%8B%BD%E6%8E%92%E5%BA%8F.html
// https://github.com/OYZQ/drag_sort


function getIndex(el) {
    let index = 0
    if (!el || !el.parentNode) {
        return -1
    }
    while (el && (el = el.previousElementSibling)) {
        index++
    }
    return index
}

function _css(el, prop, val) {
    let style = el && el.style;

    if (style) {
        if (val === void 0) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                val = document.defaultView.getComputedStyle(el, '');
            } else if (el["currentStyle"]) {
                val = el["currentStyle"];
            }
            return prop === void 0 ? val : val[prop];
        } else {
            if (!(prop in style)) {
                prop = '-webkit-' + prop;
            }
            style[prop] = val + (typeof val === 'string' ? '' : 'px')
        }
    }
}

function _animate(prevRect, target) {
    let currentRect = target.getBoundingClientRect()
    if (prevRect.nodeType === 1) {
        prevRect = prevRect.getBoundingClientRect()
    }
    _css(target, 'transition', 'none')
    _css(target, 'transform', 'translate3d(' +
        (prevRect.left - currentRect.left) + 'px,' +
        (prevRect.top - currentRect.top) + 'px,0)'
    );

    target.offsetWidth; // 触发重绘

    _css(target, 'transition', 'all ' + 300 + 'ms');
    _css(target, 'transform', 'translate3d(0,0,0)');
    // 事件到了之后把transition和transform清空
    clearTimeout(target.animated);
    target.animated = setTimeout(function() {
        _css(target, 'transition', '');
        _css(target, 'transform', '');
        target.animated = false;
    }, 300);
}