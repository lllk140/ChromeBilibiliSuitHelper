import {padNum} from "/assets/lib/utils.js";
import {contentPage, backgroundPage} from "/assets/lib/chrome.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";
import {CreateFanCardTag} from "/action/js/module/fan-card.js";

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
        };
    }

    return new Promise(async function(resolve, _) {
        if (total === 0) {
            resolve([]);
        }
        const pns = Math.ceil(parseInt(total) / (parseInt(ps) || 20));
        const http_list = [];
        for (let i = 0; i < pns; i++) {
            http_list[i] = contentPage("GetMyFanCards", {pn: i + 1, ps: ps});
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


export async function StartLoad() {
    const box = createLoadingWindow();

    const total = await (async function() {
        const res = await contentPage("GetMyFanCards", {ps: 1, pn: 1});
        if (res["code"] !== 0) {
            await MessageTips({message: res["message"]});
            await MessageInfo({message: "即将返回首页"});
            window.location.href = "popup.html";
            return null;
        } else {
            return parseInt(res["data"]["page"]["total"]) || 0;
        }
    })();

    const ps = await backgroundPage("GetConfig", {key: "FanCardRequestSpeed"});
    const fanCards = await GetFanCardsList(total || 0, ps || 20);

    const root = document.getElementById("garb_list");
    for (let i = 0; i < fanCards.length; i++) {
        const values = [fanCards[i], "li", {}, {"own_num": true}];
        const tag = CreateFanCardTag(...values);
        tag.id = fanCards[i]["item_id"].toString();
        tag.dataset["item"] = JSON.stringify({
            "name": fanCards[i]["name"],
            "item_id": fanCards[i]["item_id"],
            "number": fanCards[i]["number"],
            "date": fanCards[i]["date"],
            "own_num": fanCards[i]["own_num"],
            "sale_time": fanCards[i]["sale_time"]
        });
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

export function setInputValue(input, value, auto=true) {
    // 设置input[type=text]内容并聚焦
    input.value = value;
    let timer = setInterval(function() {
        if (input.value !== value) {
            return null;
        }
        clearInterval(timer);
        input.focus();
        if (input.value.slice(-2) === "()" && auto) {
            const s = input.selectionStart - 1;
            const e = input.selectionEnd - 1;
            input.setSelectionRange(s, e);
        }
    }, 10);
    return timer
}

// ------------------------------------

function searchString(key, value) {
    const items = GetCardItems();
    const search_list = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[key].toString().indexOf(value.toString()) !== -1) {
            search_list.push(item);
        }
    }
    return search_list
}

function searchNumber(key, value) {
    const numberString = value.replace(/[^0-9]/ig,"");
    if (numberString !== value) {
        return [];
    }
    const number = parseInt(numberString);

    const items = GetCardItems();
    const search_list = [];
    for (let i = 0; i < items.length; i++) {
        if (number === items[i][key]) {
            search_list.push(items[i]);
        }
    }
    return search_list
}

function searchRange(key, value, date=true) {
    const date_list = value.split("-") || [];
    if (!date_list || date_list.length !== 2) {
        return [];
    }

    let header, tail;
    try {
        if (date === true) {
            header = new Date(date_list[0]).getTime() / 1000;
            tail = new Date(date_list[1]).getTime() / 1000;
        } else {
            header = parseInt(date_list[0]);
            tail = parseInt(date_list[1]);
        }
    } catch (err) {
        console.log(err);
        return []
    }

    const search_list = [];

    const items = GetCardItems();
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        item["date"] = new Date(item["date"]).getTime() / 1000;
        if (header <= item[key] && item[key] <=tail) {
            search_list.push(item);
        }
    }
    return search_list
}

function setFanCardColor(className, color) {
    const tags = document.getElementsByClassName(className);
    for (let i = 0; i < tags.length; i++) {
        tags[i].style.color = color;
    }
}

export const inputApi = {
    search: {
        // {"name":"赏樱大会欧皇套装","item_id":4664,"number":6374,"date":"2021/04/22","own_num":2,"sale_time":-1}
        string: {
            name: function(v) {return searchString("name", v)},
            date: function(v) {return searchString("date", v)},
            number: function(v) {return searchString("number", v)},
        },
        number: {
            item_id: function(v) {return searchNumber("item_id", v)},
            number: function(v) {return searchNumber("number", v)},
            own_num: function(v) {return searchNumber("own_num", v)},
            sale_time: function(v) {return searchNumber("sale_time", v)},
        },
        range: {
            sale_time: function(v) {return searchRange("sale_time", v, true)},
            own_num: function(v) {return searchRange("sale_time", v, false)},
            item_id: function(v) {return searchRange("item_id", v, false)},
            number: function(v) {return searchRange("number", v, false)},
            date: function(v) {return searchRange("date", v, true)},
        }
    },
    console: {
        "ui": function(_) {
            console.log("open ui");
            return -1;
        },
        "reload": function(_) {
            window.location.reload();
            return -1;
        },
        "update": function(_) {
            StartLoad().then()
            return -1;
        }
    },

    card: {
        color: {
            "all": function(color) {
                // 暴力
                setFanCardColor("fan-card-name", color);
                setFanCardColor("fan-card-number-title", color);
                setFanCardColor("fan-card-number", color);
                setFanCardColor("fan-card-date-title", color);
                setFanCardColor("fan-card-date", color);
                return -1;
            },
            "name": function(color) {setFanCardColor("fan-card-name", color); return -1},
            "title1": function(color) {setFanCardColor("fan-card-number-title", color); return -1},
            "number": function(color) {setFanCardColor("fan-card-number", color); return -1},
            "title2": function(color) {setFanCardColor("fan-card-date-title", color); return -1},
            "date": function(color) {setFanCardColor("fan-card-date", color); return -1},
        }
    },
}
