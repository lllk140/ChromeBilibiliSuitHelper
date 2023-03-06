import {CreateFanCardTag, GetFanCardItems, GetFanCardsList} from "/action/js/module/fan-card.js";
import {backgroundPage, getStorage, contentPage, saveStorage} from "/assets/lib/chrome.js";
import {setInputValue, inputApi} from "/action/js/gard_list_module.js";
import {MessageInfo, MessageJudge} from "/assets/lib/message.js";


async function getNowFanCardTotal() {
    // 获取粉丝卡片总数
    const res = await contentPage("GetMyFanCards", {ps: 1, pn: 1});
    if (res["code"] !== 0) {
        return {code: -1, data: null, "message": res["message"]};
    } else {
        const total = parseInt(res["data"]["page"]["total"]) || 0
        return {code: 0, data: total, "message": res["message"]};
    }
}


export async function verifyLocalFanCardContent(nowTotal) {
    // 验证本地是否可覆盖
    const localTotal = await backgroundPage("GetFanCardConfig", {key: "Total"});
    const localUserId = await backgroundPage("GetFanCardConfig", {key: "UserId"});

    const cookie = await contentPage("GetCookies", {type: "json"});
    const localFanCard = getStorage("fan-card-list", []);
    const nowUserId = (cookie || {})["DedeUserID"];

    const exp1 = (nowUserId.toString() === localUserId.toString());
    const exp2 = (localTotal.toString() === nowTotal.toString());
    const exp3 = (localFanCard.length === parseInt(nowTotal));
    const exp4 = (localFanCard.length === parseInt(localTotal));
    if (exp1 && exp2 && exp3 && exp4) {
        return {code: 0, data: localFanCard, message: "可以从本地更新到页面"};
    }
    if (!exp4) {
        return {code: 3, data: [], message: "本地内容错误"};
    }
    return {code: -1, data: [], message: "需从网络更新"};
}

function setFanCardToPage(elementId, items) {
    // 设置粉丝卡片到页面
    const root = document.getElementById(elementId);
    root.innerHTML = "";

    for (let i = 0; i < items.length; i++) {
        const values = [items[i], "li", {}, {"own_num": true}];
        const tag = CreateFanCardTag(...values);
        tag.id = items[i]["item_id"].toString();
        tag.dataset["item"] = JSON.stringify({
            "name": items[i]["name"],
            "item_id": items[i]["item_id"],
            "number": items[i]["number"],
            "date": items[i]["date"],
            "own_num": items[i]["own_num"],
            "sale_time": items[i]["sale_time"]
        });
        tag.ondblclick = function() {
            const item_id = JSON.parse(this.dataset["item"])["item_id"];
            window.location.href = `item.html?item_id=${item_id}`;
        }
        root.append(tag);
    }

    return root
}

async function PageLoad(enableLocal=false) {
    // 加载页面
    const TotalRes = await getNowFanCardTotal() || {};
    if (TotalRes["code"] === -1) {
        const err = TotalRes["message"] || "error";
        await MessageInfo({message: `[${err}]获取总数失败, 将自动返回主页`});
        window.location.href = "popup.html";
        return null;
    }
    const total = parseInt(TotalRes["data"] || 0);

    let localErr = false;

    if (enableLocal === true) {
        const LocalVerifyRes = await verifyLocalFanCardContent(total);
        if (LocalVerifyRes["code"] !== 0) {
            await MessageInfo({message: LocalVerifyRes["message"]});
            localErr = true;
        } else {
            setFanCardToPage("garb_list", LocalVerifyRes["data"]);
            return {ver: localErr, data: total};
        }
    }

    const ps = await backgroundPage("GetFanCardConfig", {key: "RequestSpeed"});
    const res = await GetFanCardsList(total, ps || 20, function(item) {
        const properties = item["item"]["properties"];
        return {
            "name": item["item"]["name"],
            "item_id": item["item"]["item_id"],
            "number": item["fan"]["number"],
            "date": item["fan"]["date"],
            "own_num": item["own_num"],
            "sale_time": parseInt(properties["sale_time_begin"]) || 0,
            "fan_share_image": properties["fan_share_image"],
        };
    });

    setFanCardToPage("garb_list", res["data"]);
    if ((res["err"] || []).length !== 0) {
        let errText = `共${res["err"].length}次错误ps:[${ps}],total:[${total}]\n`;
        errText += "注:不会影响浏览,但会缺少装扮\n";
        for (let i = 0; i < res["err"].length; i++) {
            const errRes = res["err"][i];
            const count = (errRes["count"] || 0) + 1;
            errText += `错误: 第${count}次请求, [${errRes["message"]}]\n`;
        }
        if (await MessageJudge({message: errText + "是否返回首页?"})) {
            window.location.href = "popup.html";
            return null;
        }
    }

    const exp = (enableLocal && localErr && (res["err"] || []).length === 0);
    return {ver: exp, data: total};
}

window.onload = async function() {
    // 加载页面
    const localEnable = await backgroundPage("GetFanCardConfig", {key: "EnableLocal"});
    const confirmSaveLocal = await PageLoad(localEnable);
    if (confirmSaveLocal["ver"] === true) {
        await MessageInfo({message: "粉丝卡片内容已保存到本地"});
        const items = GetFanCardItems("garb_list", "fan-card-image");
        const cookie = await contentPage("GetCookies", {type: "json"});
        const userId = (cookie || {})["DedeUserID"];
        const total = parseInt(confirmSaveLocal["data"]);

        await saveStorage({"fan-card-list": items});
        await backgroundPage("SetFanCardConfig", {key: "UserId", value: userId});
        await backgroundPage("SetFanCardConfig", {key: "Total", value: total});
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
