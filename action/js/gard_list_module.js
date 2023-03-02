import {padNum} from "/assets/lib/utils.js";
import {contentPage, backgroundPage} from "/assets/lib/chrome.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";

function createLoadingWindow() {
    // 创建正在加载页面
    const lineHeight = document.body.clientHeight - 25;
    const box = document.createElement("span");
    box.style.display = "block";
    box.style.width = "100%";
    box.style.height = lineHeight.toString() + "px";
    box.style.lineHeight = lineHeight.toString() + "px";
    box.style.background = "rgba(0, 0, 0, 0.5)";
    box.style.position = "absolute";
    box.style.top = "30px";
    box.style.left = "0";
    box.style.color = "rgb(255, 255, 255)";
    box.style.textAlign = "center";
    box.style.userSelect = "none";
    box.style.fontSize = "30px";
    box.innerText = "loading...";
    document.body.append(box);
    return box
}

async function GetTotal() {
    // 获取 装扮总数量
    let res = await contentPage("GetMyFanCards", {ps: 1, pn: 1});
    if (res["code"] !== 0) {
        return {code: res["code"], message: res["message"], total: 0};
    } else {
        const total = res["data"]["page"]["total"] || 0;
        return {code: 0, message: "", total: total};
    }
}

function GetFanCardsList(total, ps) {
    // 获取全部装扮列表
    function parseItem(item) {
        // 解析粉丝卡片item
        const properties = item["item"]["properties"];
        return {
            "name": item["item"]["name"],
            "item_id": item["item"]["item_id"],
            "number": item["fan"]["number"],
            "date": item["fan"]["date"],
            "own_num": item["own_num"],
            "sale_time": parseInt(properties["sale_time_begin"]) || 0,
            "fan_share_image": properties["fan_share_image"],
            // "desc": properties["desc"]
        };
    }

    return new Promise(async function(resolve, _) {
        const pns = Math.ceil(parseInt(total) / (parseInt(ps) || 20));
        const http_list = [];
        for (let i = 0; i < pns; i++) {
            http_list[i] = contentPage("GetMyFanCards", {
                pn: i + 1, ps: ps
            });
        }
        Promise.all(http_list).then(function(response_array) {
            const all_items = [];
            let n = 0;

            for (let i = 0; i < response_array.length; i++) {
                const response = response_array[i];
                let array = []
                if (response["code"] === 0) {
                    array = response["data"]["list"] || [];
                } else {
                    MessageInfo({message: response["message"]});
                }

                for (let i = 0; i < array.length; i++) {
                    all_items[n] = parseItem(array[i]);
                    n += 1
                }
            }
            resolve(all_items);
        })
    });
}

function CreateFanCardTag(item) {
    // 创建粉丝卡片标签
    function CreateFanCardText(text) {
        // 创建文本内容
        const span = document.createElement("span");
        span.innerText = text;
        return span
    }

    const card = document.createElement("li");

    card.classList.add("fan-card");
    card.id = item["item_id"];
    card.title = item["name"];

    const fanCardImage = document.createElement("img");
    fanCardImage.src = item["fan_share_image"];

    card.append(CreateFanCardText(item["name"]));
    card.append(CreateFanCardText("FANS NO."));
    card.append(CreateFanCardText(padNum(item["number"], 6)));
    card.append(CreateFanCardText("DATE"));
    card.append(CreateFanCardText(item["date"]));
    card.append(CreateFanCardText(padNum(item["own_num"], 3)));
    card.append(fanCardImage);

    // delete item["fan_share_image"];
    // card.dataset["item"] = JSON.stringify(item);

    const data = {
        "name": item["name"],
        "item_id": item["item_id"],
        "number": item["number"],
        "date": item["date"],
        "own_num": item["own_num"],
        "sale_time": item["sale_time"]
    }

    card.dataset["item"] = JSON.stringify(data);

    return card
}

export async function StartLoad() {
    const box = createLoadingWindow();

    const totalObj = await GetTotal();
    if (totalObj.code !== 0) {
        await MessageTips({message: totalObj.message});
        await MessageInfo({message: "即将返回首页"});
        window.location.href = "popup.html";
        return null;
    }

    if ((totalObj.total || 0) === 0) {
        box.innerText = "居然没装扮";
        return null;
    }

    const ps = await backgroundPage("GetConfig", {key: "RequestSpeed"});

    const fanCards = await GetFanCardsList(totalObj.total || 0, ps || 20);

    const root = document.getElementById("garb_list");
    for (let i = 0; i < fanCards.length; i++) {
        const tag = CreateFanCardTag(fanCards[i]);
        tag.ondblclick = function() {
            const item_id = JSON.parse(this.dataset["item"])["item_id"];
            window.location.href = `item.html?item_id=${item_id}`;
        }
        root.append(tag);
    }

    box.remove();
}

// --------------------------------------------------------------------------------------

export function GetCardItems() {
    // 获取每个标签的data-item
    const items = [];
    const root = document.getElementById("garb_list");
    for (let i = 0; i < root.children.length; i++) {
        const item = root.children[i].dataset["item"];
        items[i] = JSON.parse(item);
    }
    return items
}

export const searchApi = {
    searchString: function(key, value) {
        // 字符串搜索
        const items = GetCardItems();
        const search_list = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const data = key in item ? item[key] : item["name"];
            if (data.toString().indexOf(value.toString()) !== -1) {
                search_list.push(item);
            }
        }
        return search_list
    },

    searchNumber: function(key, value) {
        // 范围搜索
        const timeKeys = ["sale_time", "date"];
        const numberKeys = ["number", "own_num"];

        const date_list = value.split("-") || [];
        if (!date_list || date_list.length !== 2) {
            return [];
        }

        let search_header, search_tail;
        if (timeKeys.indexOf(key) !== -1) {
            search_header = new Date(date_list[0]).getTime() / 1000;
            search_tail = new Date(date_list[1]).getTime() / 1000;
        }
        if (numberKeys.indexOf(key) !== -1) {
            search_header = parseInt(date_list[0]);
            search_tail = parseInt(date_list[1]);
        }
        if (!search_header || !search_tail) {
            return [];
        }

        if (search_header > search_tail) {
            return [];
        }

        const search_list = [];

        const items = GetCardItems();
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            item["date"] = new Date(item["date"]).getTime() / 1000;
            const searchKey = item[key] || items["number"];
            // console.log(searchKey, search_header, search_tail);

            if (search_header <= searchKey && searchKey <= search_tail) {
                // (1 <= 3 <= 2) == true //js很神奇吧
                search_list.push(item);
            }
        }

        return search_list
    }
}

function createCodeTipsList() {
    const searchCodeList = [":searchString:", ":searchNumber:"]

    let codeTipsList = [];
    codeTipsList.push.apply(codeTipsList, searchCodeList);

    // console xxx
    codeTipsList.push(":console:ui:");

    const root = document.getElementById("garb_list");
    if (root.children.length === 0) {
        return codeTipsList;
    }

    const item = JSON.parse(root.children[0].dataset["item"]);
    for (const itemKey in item) {
        for (let i = 0; i < searchCodeList.length; i++) {
            codeTipsList.push(searchCodeList[i] + itemKey + ":[]");
        }
    }

    return codeTipsList;
}

export function createCodeTips(value, key, input, resList=[]) {
    const codeList = createCodeTipsList();

    if (key === "Tab" && resList.length !== 0) {
        console.log("res", resList[0]);
        input.value = resList[0];
        let timer = setInterval(function() {
            // 6
            if (input.value === resList[0]) {
                clearInterval(timer);
                input.focus();
                if (input.value.slice(input.value.length - 2) === "[]") {
                    const startR = input.selectionStart - 1;
                    const EndR = input.selectionEnd - 1;
                    input.setSelectionRange(startR, EndR);
                }
            }
        }, 50);
        return []
    }

    resList = [];

    for (let i = 0; i < codeList.length; i++) {
        if (codeList[i].indexOf(value) !== -1) {
            resList.push(codeList[i]);
        }
    }

    return resList
}
