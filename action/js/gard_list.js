import {CreateFanCardTag, GetFanCardItems, GetFanCardsList} from "/action/js/module/fan-card.js";
import {backgroundPage, contentPage} from "/assets/lib/chrome.js";
import {inputApi} from "/action/js/gard_list_module.js";
import {setInputValue, ListenerFocus, codeTips, extractApi} from "/action/js/module/code-tip.js";
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
    const localUserIdPromise = backgroundPage("GetConfig", {path: "User", key: "UserId"});
    const localTotalPromise = backgroundPage("GetConfig", {path: "FanCard", key: "Total"});
    const localListPromise = backgroundPage("GetConfig", {path: "FanCard", key: "List"});
    const cookiePromise = contentPage("GetCookies", {type: "json"});

    const nowUserId = (await cookiePromise || {})["DedeUserID"] || "-1";
    const localUserId = (await localUserIdPromise) || "";
    const localTotal = (await localTotalPromise) || -1;
    const localList = (await localListPromise) || [];

    const exp1 = (nowUserId.toString() === localUserId.toString());
    const exp2 = (localTotal.toString() === nowTotal.toString());
    const exp3 = (localList.length === parseInt(nowTotal));
    const exp4 = (localList.length === parseInt(localTotal));

    if (exp1 && exp2 && exp3 && exp4) {
        return {code: 0, data: localList, message: "可以从本地更新到页面"};
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
        const tag = CreateFanCardTag(items[i], "li");
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

async function LoadFanCardToPage(enableLocal=false) {
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
    const cookie = await contentPage("GetCookies", {type: "json"});
    const userId = (cookie || {})["DedeUserID"];
    if (!userId) {
        await MessageInfo({message: "未登录"});
        window.location.href = "popup.html";
    }

    // 加载页面
    const localEnable = await backgroundPage("GetConfig", {path: "FanCard", key: "EnableLocal"});
    const confirmSaveLocal = await LoadFanCardToPage(localEnable);
    if (confirmSaveLocal["ver"] === true) {
        const items = GetFanCardItems("garb_list", "fan-card-image");
        const total = parseInt(confirmSaveLocal["data"]);
        await backgroundPage("SetConfig", {path: "User", key: "UserId", value: userId});
        await backgroundPage("SetConfig", {path: "FanCard", key: "Total", value: total});
        await backgroundPage("SetConfig", {path: "FanCard", key: "List", value: items});
        await MessageInfo({message: "粉丝卡片内容已保存到本地"});
    }

    document.getElementById("loading-box").style.display = "none";
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

    const root = document.getElementById("search");
    ListenerFocus(root, function(selectionStart, selectionEnd) {
        const tipsTag = document.getElementById("code-tips");

        if (selectionEnd === 0 && selectionStart === 0) {
            tipsTag.dataset["style"] = "hide";
            return null;
        }

        let value = root.value.slice(selectionStart, selectionEnd);
        if (selectionStart === selectionEnd) {
            value = root.value.slice(0, selectionEnd);
        }

        const code_list = codeTips(value, inputApi);
        console.log(code_list);

        tipsTag.innerHTML = "";
        for (let i = 0; i < code_list.length; i++) {
            const textTag = document.createElement("a");
            const tips = code_list[i]["tips"];
            textTag.dataset["code"] = code_list[i]["code"] + tips;
            textTag.innerText = tips;
            textTag.onclick = function() {
                const input = document.getElementById("search");
                setInputValue(input, this.dataset["code"], function(root) {
                    if (root.value.slice(-2) === "()") {
                        const s = root.selectionStart - 1;
                        const e = root.selectionEnd - 1;
                        root.setSelectionRange(s, e);
                    }
                });
            }
            tipsTag.appendChild(textTag);
        }

        if (tipsTag.childNodes.length !== 0) {
            tipsTag.childNodes[0]["classList"].add("choose-code");
        }

        tipsTag.dataset["style"] = "show";

    }, 10, false);

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

        const content = extractApi(value, inputApi);
        if (content === false) {
            return false;
        }

        search_list = content["func"](content["value"]);
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
            const resValue = codeTags.length !== 0 ? codeTags[0].dataset["code"] : input.value;

            setInputValue(input, resValue, function(root) {
                if (root.value.slice(-2) === "()") {
                    const s = root.selectionStart - 1;
                    const e = root.selectionEnd - 1;
                    root.setSelectionRange(s, e);
                }
            });
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
