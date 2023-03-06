import {padNum} from "/assets/lib/utils.js";
import {contentPage, backgroundPage} from "/assets/lib/chrome.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";


// ---------------------------------------

export function GetFanCardItems(elementId, imageId="fan-card-image") {
    // 获取每个标签的data-item + image
    const items = [];
    const root = document.getElementById(elementId);
    for (let i = 0; i < root.children.length; i++) {
        const tag = root.children[i];
        const item = JSON.parse(root.children[i].dataset["item"]);
        if (imageId && (imageId instanceof String)) {
            const tagImage = tag.getElementsByClassName(imageId);
            if (tagImage.length !== 0) {
                item["fan_share_image"] = tagImage[0].src;
            }
        }
    }
    return items;
}



// ---------------------------------------

export function GetFanCardsList(total, ps, parseHandler) {
    // 获取全部装扮列表
    const promise = function(resolve, _) {
        parseInt(total) === 0 ? resolve({data: [], err: []}) : total;
        const pns = Math.ceil(parseInt(total) / (parseInt(ps)));

        const http_list = [];
        for (let i = 0; i < pns; i++) {
            const value = {pn: i + 1, ps: ps};
            http_list[i] = contentPage("GetMyFanCards", value);
        }

        Promise.all(http_list).then(function(responseList) {
            const data = [];
            const err = [];
            for (let i = 0; i < responseList.length; i++) {
                const res = responseList[i] || {};
                console.log(res)
                if (res["code"] !== 0) {
                    err.push({count: i+1, message: res["message"]});
                    continue;
                }
                const array = res["data"]["list"] || [];
                for (let j = 0; j < array.length; j++) {
                    data.push(parseHandler(array[j]));
                }
            }
            resolve({data: data, err: err})
        });
    }
    return new Promise(promise);
}


export function CreateFanCardTag(item, element, detail={}, option={}) {
    // 创建粉丝卡片标签
    function createCardText(text, className=[]) {
        // 创建粉丝卡片内容
        const span = document.createElement("span");
        span.classList.add(...className);
        span.innerText = text;
        return span;
    }

    const card = document.createElement(element || "li");
    card.classList.add(detail["cardClassName"] || "fan-card");

    const imageClass = detail["imageClass"] || ["fan-card-image"];
    const fanCardImage = document.createElement("img");
    fanCardImage.classList.add(...imageClass);
    fanCardImage.src = item["fan_share_image"];

    const nameClass = detail["nameClass"] || ["fan-card-name"];
    const name = createCardText(item["name"], nameClass);

    const numberTitleClass = detail["numberTitleClass"] || ["fan-card-number-title"];
    const numberTitle = createCardText("FANS NO.", numberTitleClass);

    const numberClass = detail["numberClass"] || ["fan-card-number"];
    const number = createCardText(padNum(item["number"], 6), numberClass);

    const dateTitleClass = detail["dateTitleClass"] || ["fan-card-date-title"];
    const dateTitle = createCardText("DATE", dateTitleClass);

    const dateClass = detail["dateClass"] || ["fan-card-date"];
    const date = createCardText(item["date"], dateClass);

    const own_numClass = detail["own_numClass"] || ["fan-card-own_num"];
    const own_num = createCardText(padNum(item["own_num"], 3), own_numClass);
    card.append(name, numberTitle, number, dateTitle, date);

    if (option["own_num"] === true) {
        card.appendChild(own_num);
    }
    card.appendChild(fanCardImage);
    return card;
}
