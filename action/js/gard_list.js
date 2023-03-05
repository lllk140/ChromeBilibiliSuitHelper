import {StartLoad, setInputValue, inputApi} from "/action/js/gard_list_module.js";


window.onload = StartLoad;


document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};

document.getElementById("sort").onclick = function() {
    // 排序
    window.location.href = "sort.html";
};

window.onclick = function(event) {
    const root = document.getElementById("code-tips");
    let target = event.target;
    if(target.nodeName === "A") {
        target = target.parentNode;
    }
    if (target.id !== "code-tips" && target.id !== "search") {
        root.dataset["style"] = "hide";
    }
};


(async function() {
    let old_code = null;
    let search_list = [];

    function onFocus(eid, func=function(_) {}) {
        // 监听光标信息
        const root = document.getElementById(eid);
        let start, end;

        let timer = setInterval(function() {
            const selectionStart = root.selectionStart;
            const selectionEnd = root.selectionEnd;

            const tips = document.getElementById("code-tips");

            if (!root.value) {
                tips.dataset["style"] = "hide";
                start = 0;
                end = 0;
                return null;
            }

            // if (root !== document.activeElement) {
            //     tips.dataset["style"] = "hide";
            //     return null;
            // }

            if (selectionStart === start && selectionEnd === end) {
                return null;
            }

            const closeYN = func({
                root: root, location: {s: selectionStart, e: selectionEnd}
            });

            start = selectionStart;
            end = selectionEnd;

            if (closeYN === -1) {
                clearInterval(timer);
            }
        }, 50);
        return timer;
    }

    onFocus("search", function(event) {
        const tips = document.getElementById("code-tips");

        const _ls = event.location.s;
        const _le = event.location.e;
        const _value = event.root.value;

        let value = _ls === _le ? _value.slice(0, _le) : _value.slice(_ls, _le);

        if (value[0] !== "@") {
            return null;
        }

        const valueSplit = value.slice(1).split(".");

        const code_node = [];
        let header = [];
        let copyApi = inputApi;
        if (valueSplit.length === 1) {
            for (const code in inputApi) {
                code_node.push(code);
            }
        } else {
            header = valueSplit.slice(0, -1);
            for (let i = 0; i < header.length; i++) {
                const key = header[i];
                if (!copyApi[key]) {
                    return []
                }
                if (copyApi[key] instanceof Object) {
                    copyApi = copyApi[key];
                } else {
                    return []
                }
            }

            for (const code in copyApi) {
                code_node.push(code);
            }
        }

        let tail = valueSplit.slice(-1)[0];
        const code_list = []

        for (let i = 0; i < code_node.length; i++) {
            const code = code_node[i].slice(0, tail.length);
            if (code === tail) {
                const joinText = header.join(".");
                const node = !joinText ? "" : joinText + ".";

                let tailText = ".";
                if (typeof copyApi[code_node[i]] === "function") {
                    tailText = "()";
                }
                code_list.push(`@${node}${code_node[i]}${tailText}`);
            }
        }

        const page_code_list = code_list.slice(0, 5);

        tips.innerHTML = "";
        for (let i = 0; i < page_code_list.length; i++) {
            const textTag = document.createElement("a");
            textTag.innerText = page_code_list[i];
            textTag.onclick = function() {
                const input = document.getElementById("search");
                setInputValue(input, this.innerText, true);
            }
            tips.appendChild(textTag);
        }
        tips.dataset["style"] = "show";

        if (tips.childNodes.length !== 0) {
            tips.childNodes[0]["classList"].add("choose-code");
        }
    });

    function searchNext() {
        if (search_list.length === 0) {
            return false;
        }
        // window.location.hash = `#${search_list[0]["item_id"]}`;
        const item_id = search_list[0]["item_id"].toString();
        document.getElementById(item_id).scrollIntoView(true);
        search_list = search_list.slice(1);
        document.getElementById("search").focus();
        return true;
    }

    document.getElementById("search").onkeydown = function(event) {
        let value = this.value.toString();
        if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Tab") {
            event.preventDefault();
            return false;
        }

        if (!value || event.key !== "Enter") {
            return true;
        }

        if (value !== old_code) {
            old_code = value;
            search_list = [];
        } else {
            if (searchNext()) {
                return false;
            }
        }

        console.log("onkeydown:", value);

        let reString = value.match(/@(.*?)\(/);
        if (!reString) {
            reString = ["", "search.string.name"];
        }

        const reSearchValue = value.slice(reString[0].length-1);
        let searchValueArray = reSearchValue.match(/\((.*)\)/);

        if (!searchValueArray) {
            searchValueArray = ["", value];
        }

        const valueSplit = reString[1].split(".");
        let copyApi = inputApi;
        for (let i = 0; i < valueSplit.length; i++) {
            if (!copyApi[valueSplit[i]]) {
                return false;
            }
            copyApi = copyApi[valueSplit[i]];
        }

        if (typeof copyApi !== "function") {
            return false;
        }

        search_list = (copyApi || function(_) {return -1})(searchValueArray[1]);
        if (search_list === -1) {
            old_code = "";
            return false;
        }
        if (search_list.length !== 0) {
            return searchNext();
        }

        return true;
    };

    window.onkeydown = function(event) {
        const root = document.getElementById("code-tips");
        if (root.dataset["style"] === "hide") {
            return null;
        }

        const codeTags = document.getElementsByClassName("choose-code");
        const input = document.getElementById("search");

        if (event.key === "Tab") {
            const resValue = codeTags.length !== 0 ? codeTags[0].innerText : input.value;
            setInputValue(input, resValue, true);
            return null;
        }

        if (event.key === "ArrowUp" && codeTags.length !== 0) {
            const upTag = codeTags[0].previousElementSibling;
            if (upTag) {
                codeTags[0].className = "";
                upTag.className = "choose-code";
            }
            return null;
        }

        if (event.key === "ArrowDown" && codeTags.length !== 0) {
            const downTag = codeTags[0].nextElementSibling;
            if (downTag) {
                codeTags[0].className = "";
                downTag.className = "choose-code";
            }
            return null;
        }
    };
})();
