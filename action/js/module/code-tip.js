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
    }, timeout);
    return timer
}

export function codeTips(code, apiObjs, detail=null) {
    // api路径提示
    const statement = (detail || {})["statement"] || "@";
    const splitText = (detail || {})["split"] || ".";

    if (code[0] !== statement) {return [];}

    const valueSplit = code.slice(1).split(splitText);

    let code_node = [], copyApi = apiObjs;

    for (let i = 0; i < valueSplit.length; i++) {
        const codeFrame = valueSplit[i];
        if (i + 1 < valueSplit.length) {
            if (!copyApi[codeFrame]) {
                return [];
            }
            if (typeof copyApi[codeFrame] === "function") {
                return [];
            }
            copyApi = copyApi[codeFrame];
            continue;
        }

        for (const apiKey in copyApi) {
            // if (codeFrame === apiKey.slice(0, codeFrame.length)) {...}
            // or
            if (apiKey.indexOf(codeFrame) !== -1) {
                if (codeFrame.length !== 0) {
                    code = code.slice(0, -codeFrame.length);
                }
                if (typeof copyApi[apiKey] === "function") {
                    code_node.push({code: code, tips: apiKey + "()"});
                } else {
                    code_node.push({code: code, tips: apiKey});
                }
            }
        }
        return code_node;
    }
}

export function extractApi(code, apiObjs, detail=null) {
    // 提取方法
    const statement = (detail || {})["statement"] || "@";
    const splitText = (detail || {})["split"] || ".";

    let reString = code.match(new RegExp(`${statement}(.*?)\\(`));
    if (!reString) {
        reString = ["", "search.string.name"];
    }

    const reSearchValue = code.slice(reString[0].length-1);
    let searchValueArray = reSearchValue.match(/\((.*)\)/);

    if (!searchValueArray) {
        searchValueArray = ["", code];
    }
    const valueSplit = reString[1].split(splitText);
    let copyApi = apiObjs;
    for (let i = 0; i < valueSplit.length; i++) {
        if (!copyApi[valueSplit[i]]) {
            return false;
        }
        copyApi = copyApi[valueSplit[i]];
    }

    if (typeof copyApi !== "function") {
        return false;
    }
    return {func: copyApi, value: searchValueArray[1]};
}
