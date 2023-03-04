import {contentPage} from "/assets/lib/chrome.js";
import {getUrlQuery, padNum} from "/assets/lib/utils.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";

document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};

function createFanCard(fan_share_image, fan_item) {
    const box = document.createElement("div");
    function CreateFanCardText(text, className=null) {
        // 创建文本内容
        const span = document.createElement("span");
        span.innerText = text;
        span.className = className;
        return span;
    }
    const fanCardImage = document.createElement("img");
    fanCardImage.src = fan_share_image;
    fanCardImage.alt = fan_item["name"];
    box.append(CreateFanCardText(fan_item["name"], "fan-card-name"));
    box.append(CreateFanCardText("FANS NO.", "fan-card-number-title"));
    box.append(CreateFanCardText(padNum(fan_item["number"], 6), "fan-card-number"));
    box.append(CreateFanCardText("DATE", "fan-card-date-title"));
    box.append(CreateFanCardText(fan_item["date"], "fan-card-date"));
    box.append(fanCardImage);
    return box.innerHTML;
}

function updatePageContent(data, own_num) {
    document.getElementById("background").src = data["item"]["properties"]["image_cover"];
    const gard_title = document.getElementById("gard-title");
    gard_title.title = data["item"]["properties"]["desc"];
    gard_title.innerText = data["item"]["name"];
    const fan_image = data["item"]["properties"]["fan_share_image"];
    document.getElementById("fan-card").innerHTML = createFanCard(fan_image, data["fan"]);
    document.getElementById("count").innerText = `总共${own_num}套粉丝装扮`;
    return true;
}

const AssetsTextObj = {
    "space_bg": "空间海报",
    "skin": "个性主题",
    "card": "动态卡片",
    "card_bg": "评论装扮",
    "loading": "加载动画",
    "play_icon": "进度条",
    "thumbup": "点赞特效",
    "pendant": "头像挂件",
    "emoji_package": "表情包",
}

const AssetKeys = {
    "space_bg": "image1_landscape",
    "skin": "image_cover",
    "card": "image_preview_small",
    "card_bg": "image_preview_small",
    "loading": "image_preview_small",
    "play_icon": "squared_image",
    "emoji_package": "image",
    "pendant": "image",
    "thumbup": "image_preview"
}


function createAssetTag(part, item_id, image_src) {
    const box = document.createElement("div");
    box.className = "assets-item";

    const image = document.createElement("img");
    image.className = "assets-item-image";
    image.src = image_src;

    const text = document.createElement("a");
    text.className = "assets-item-name";
    text.innerText = AssetsTextObj[part];

    const button = document.createElement("button");
    button.dataset["part"] = part;
    button.dataset["item_id"] = item_id;
    button.className = "assets-item-button";

    if (part === "space_bg" || part === "emoji_package") {
        button.innerText = "设置";
    } else {
        button.innerText = "装扮";
    }

    box.appendChild(image);
    box.appendChild(text);
    box.appendChild(button);

    return box;
}

function updatePrivateAssets(root, private_ids, assets) {
    for (let i = 0; i < private_ids.length; i++) {
        const mid = private_ids[i].toString();
        const part = assets[mid]["part"];
        const key = AssetKeys[part];
        let image = assets[mid]["properties"][key];
        if (!(key in assets[mid]["properties"]) && part === "card") {
            image = assets[mid]["properties"]["image"];
        }
        const tag = createAssetTag(part, mid, image);
        root.append(tag);
    }

}


window.onload = async function() {
    const item_id =  getUrlQuery("item_id", null);
    if (!item_id) {
        await MessageInfo({message: "无效参数, 即将返回首页"});
        window.location.href = "popup.html";
        return null;
    }

    const resObj = {
        GetSuitAssets: contentPage("GetSuitAssets", {item_id: item_id}),
        GetSuitBuyNum: contentPage("GetSuitBuyNum", {item_id: item_id}),
    }

    const AssetsRes = await resObj["GetSuitAssets"] || {};

    if (AssetsRes["code"] !== 0) {
        await MessageTips({message: AssetsRes["message"] + "\n" + "确认后将返回首页"});
        window.location.href = "popup.html";
        return null;
    }
    if (!AssetsRes["data"]) {
        await MessageInfo({message: "无内容将返回首页"});
        window.location.href = "popup.html";
    }

    const BuyNumRes = await resObj["GetSuitBuyNum"] || {};
    if (BuyNumRes["code"] !== 0) {
        await MessageTips({message: AssetsRes["message"] + "\n" + "确认后将返回首页"});
        window.location.href = "popup.html";
        return null;
    }
    if (BuyNumRes["data"]["own_num"] < 1) {
        await MessageInfo({message: "无永久装扮, 将返回首页"});
        window.location.href = "popup.html";
    }

    updatePageContent(AssetsRes["data"], BuyNumRes["data"]["own_num"]);

    const assets = {};
    const ids = []
    const assetsList = AssetsRes["data"]["assets"];
    for (let i = 0; i < assetsList.length; i++) {
        const part = assetsList[i]["part"];
        const mid = assetsList[i]["item"]["item_id"].toString();
        assetsList[i]["item"]["part"] = part;
        assets[mid] = assetsList[i]["item"];
        ids.push(mid);
    }

    const root = document.getElementById("assets");
    root.innerHTML = "";

    updatePrivateAssets(root, ids, assets);
}
