import {StartLoad, searchApi, createCodeTips} from "/action/js/gard_list_module.js";


window.onload = StartLoad;
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

document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};

document.getElementById("sort").onclick = function() {
    // 排序
    window.location.href = "sort.html";
};


(async function() {
    let old_code = null;
    let search_list = [];
    let code_list = [];

    function onFocus(eid, func=function(_) {}) {
        const root = document.getElementById(eid);
        let start, end;

        let timer = setInterval(function() {
            const selectionStart = root.selectionStart;
            const selectionEnd = root.selectionEnd;

            if (root !== document.activeElement && !root.value) {
                const tips = document.getElementById("code-tips");
                tips.dataset["style"] = "hide";
                return null;
            }

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
        if (event.location.s !== event.location.e) {
            return null;
        }

        const selection = event.location.s;
        const value = event.root.value.slice(0, selection);

        code_list = createCodeTips(value);
        if (code_list.length !== 0) {
            if (code_list[0] === event.root.value) {
                code_list = code_list.slice(1);
            }
        }
        const page_code_list = code_list.slice(0, 5);

        const root = document.getElementById("code-tips");
        root.innerHTML = "";
        for (let i = 0; i < page_code_list.length; i++) {
            const textTag = document.createElement("a");
            textTag.innerText = page_code_list[i];
            textTag.onclick = function() {
                const input = document.getElementById("search");
                input.value = textTag.innerText;
                let timer = setInterval(function() {
                    if (input.value !== textTag.innerText) {
                        return null;
                    }
                    clearInterval(timer);
                    input.focus();
                    if (input.value.slice(input.value.length - 2) === "[]") {
                        const s = input.selectionStart - 1;
                        const e = input.selectionEnd - 1;
                        input.setSelectionRange(s, e);
                    }
                }, 10);
            }
            root.appendChild(textTag);
        }
        if (event.root.value) {
            root.dataset["style"] = "show";
        } else {
            root.dataset["style"] = "hide";
        }

        if (root.childNodes.length !== 0) {
            root.childNodes[0]["classList"].add("choose-code");
        }
    });

    function searchNext() {
        if (search_list.length === 0) {
            return false;
        }
        window.location.hash = `#${search_list[0]["item_id"]}`;
        search_list = search_list.slice(1);
        document.getElementById("search").focus();
        return true;
    }

    document.getElementById("search").onkeydown = function(event) {
        const value = this.value.toString();
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

        const reString = value.match(/:(.*?):(.*?):/) || ["", "search", "name"];

        // 处理方法
        // 搜索方式 | 其他方式
        let handlerKey = reString[1];
        const funcKey = reString[2];

        // 需要搜索的内容
        const reSearchValue = value.slice(reString[0].length);
        let searchValueArray = reSearchValue.match(/\[(.*)]/);
        if (!searchValueArray) {
            searchValueArray = ["search", reSearchValue];
        }

        // 控制台
        if (handlerKey === "console" && funcKey ==="ui") {
            const root = document.getElementById("console");
            root.style.display = "block";
            return false;
        }

        // 搜索
        if (handlerKey.slice(0, 6) === "search") {
            if (handlerKey !== "searchNum") {
                handlerKey = "searchStr";
            }
            const handlerFunc = searchApi[handlerKey];
            search_list = handlerFunc(funcKey, searchValueArray[1]);

            return searchNext();
        }

        return true;
    };

    document.getElementById("search").onfocus = function() {
        const root = document.getElementById("code-tips");
        if (root.dataset["style"] === "hide" && this.value) {
            root.dataset["style"] = "show";
        }
    }

    window.onkeydown = function(event) {
        const root = document.getElementById("code-tips");
        if (root.dataset["style"] === "hide") {
            return null;
        }

        const codeTags = document.getElementsByClassName("choose-code");
        const input = document.getElementById("search");

        if (event.key === "Tab") {
            const resValue = codeTags.length !== 0 ? codeTags[0].innerText : input.value;
            input.value = resValue;
            let timer = setInterval(function() {
                const _value = input.value;
                if (_value !== resValue) {
                    return null;
                }
                clearInterval(timer);
                input.focus();
                if (_value.slice(_value.length - 2) === "[]") {
                    const s = input.selectionStart - 1;
                    const e = input.selectionEnd - 1;
                    input.setSelectionRange(s, e);
                }
            }, 10);
        }

        if (event.key === "ArrowUp" && codeTags.length !== 0) {
            const upTag = codeTags[0].previousElementSibling;
            if (upTag) {
                codeTags[0].className = "";
                upTag.className = "choose-code";
            }
        }

        if (event.key === "ArrowDown" && codeTags.length !== 0) {
            const downTag = codeTags[0].nextElementSibling;
            if (downTag) {
                codeTags[0].className = "";
                downTag.className = "choose-code";
            }
        }
    };
})();
