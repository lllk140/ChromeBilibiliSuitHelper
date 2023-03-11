
const nullFunc = function(..._) {return null};

export function ListenerFocus(root, callback, timeout=50, init=true) {
    // 监听input标签光标位置
    let start = -1, end = -1;

    let timer = setInterval(function() {
        const selectionStart = root.selectionStart;
        const selectionEnd = root.selectionEnd;

        if (selectionStart === start && selectionEnd === end) {
            return null;
        }

        if (!root["value"]) {
            start = 0; end = 0;
            if (init === false) {
                init = true;
                return null;
            }
        } else {
            start = selectionStart;
            end = selectionEnd;
        }

        if ((callback || nullFunc)(start, end) === -1) {
            clearInterval(timer);
            return null;
        }

    }, timeout);
    return timer;
}

export function setInputValue(root, value, callback, timeout=10) {
    // 设置input标签内容
    root.value = value;
    let timer = setInterval(function() {
        if (root.value !== value) {
            return null;
        }
        clearInterval(timer);
        root.focus();
        (callback || nullFunc)(root);
        // if (input.value.slice(-2) === "()" && auto) {
        //     const s = input.selectionStart - 1;
        //     const e = input.selectionEnd - 1;
        //     input.setSelectionRange(s, e);
        // }
    }, timeout);
    return timer
}
