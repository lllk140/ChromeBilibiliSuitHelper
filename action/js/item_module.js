import {padNum} from "/assets/lib/utils.js";


export function loadPageContent(data, own_num) {
    // 加载页面内容 [不带组件]
    function createFanCard(fan_share_image, fan_item) {
        // 创建粉丝卡片内容;
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

    document.getElementById("background").src = data["item"]["properties"]["image_cover"];
    const gard_title = document.getElementById("gard-title");
    gard_title.title = data["item"]["properties"]["desc"];
    gard_title.innerText = data["item"]["name"];
    const fan_image = data["item"]["properties"]["fan_share_image"];
    document.getElementById("fan-card").innerHTML = createFanCard(fan_image, data["fan"]);
    document.getElementById("count").innerText = `总共${own_num}套粉丝装扮`;

    return true;
}

export function createAssetTag(item, handler) {
    // 创建组件的标签
    const box = document.createElement("div");
    box.className = "assets-item";

    const image = document.createElement("img");
    image.className = "assets-item-image";
    image.src = item["image"];

    const text = document.createElement("a");
    text.className = "assets-item-name";
    text.innerText = item["name"];

    const button = document.createElement("button");
    button.dataset["part"] = item["part"];
    button.dataset["item_id"] = item["item_id"];
    button.className = "assets-item-button";
    button.innerText = "装扮";
    button.dataset["type"] = "0";

    if (item["equiped"] === true) {
        button.dataset["type"] = "1";
        button.innerText = "已装扮";
    }

    if (["emoji_package", "space_bg"].indexOf(item["part"]) !== -1) {
        button.dataset["type"] = "2";
        button.innerText = "设置";
    }

    button.onclick = handler

    box.appendChild(image);
    box.appendChild(text);
    box.appendChild(button);

    return box;
}

// --------------------

const PrivateAssetsSort = [
    {
        part: "pendant",
        key: "image",
        name: "专属头像挂件"
    },
    {
        part: "space_bg",
        key: "image1_landscape",
        name: "专属空间海报"
    },
    {
        part: "skin",
        key: "image_cover",
        name: "专属个性主题"
    },
    {
        part: "card",
        key: "image_preview_small",
        name: "专属动态卡片"
    },
    {
        part: "card_bg",
        key: "image_preview_small",
        name: "专属评论装扮"
    },
    {
        part: "loading",
        key: "image_preview_small",
        name: "专属加载动画"
    },
    {
        part: "play_icon",
        key: "squared_image",
        name: "专属进度条"
    },
]

const AttachAssetsSort = [
    {
        part: "card",
        key: "image",
        name: "动态卡片"
    },
    {
        part: "pendant",
        key: "image",
        name: "头像挂件"
    },
    {
        part: "thumbup",
        key: "image_preview",
        name: "动态点赞特效"
    },
    {
        part: "emoji_package",
        key: "image",
        name: "表情包"
    }
]

const attachKeys = ["item_id_card", "item_id_emoji", "item_id_pendant", "item_id_thumbup"]

// --------------------

export function ParseAssets(res) {
    // 解析assets
    const properties = res["data"]["item"]["properties"];
    const assetsList = res["data"]["assets"];

    const assets = {};
    for (let i = 0; i < assetsList.length; i++) {
        const asset = assetsList[i];
        const mid = asset["item"]["item_id"].toString();
        const part = asset["part"].toString();
        const properties = asset["item"]["properties"];
        assets[mid] = {
            part: part,
            properties: properties,
            equiped: asset["equiped"]
        };
    }

    const assets_items = [];

    // 装扮专属内容 + 解析专属内容
    const private_ids = properties["fan_item_ids"].split(",");
    for (let i = 0; i < PrivateAssetsSort.length; i++) {
        const sortItem = PrivateAssetsSort[i];
        for (let j = 0; j < private_ids.length; j++) {
            const mid = private_ids[j].toString();
            const item = assets[mid] || {};
            if (item["part"] === sortItem["part"]) {
                const properties = item["properties"];
                assets_items.push({
                    item_id: mid, part: sortItem["part"],
                    image: properties[sortItem["key"]],
                    name: sortItem["name"],
                    equiped: item["equiped"],
                })
            }
        }
    }

    // 装扮附加内容 + 解析附加内容
    const attach_ids = [];
    for (let i = 0; i < attachKeys.length; i++) {
        const mid = properties[attachKeys[i]];
        if (mid) {
            attach_ids.push(mid.toString());
        }
    }

    for (let i = 0; i < AttachAssetsSort.length; i++) {
        const sortItem = AttachAssetsSort[i];
        for (let j = 0; j < attach_ids.length; j++) {
            const mid = attach_ids[j].toString();
            const item = assets[mid] || {};
            if (item["part"] === sortItem["part"]) {
                const properties = item["properties"];
                assets_items.push({
                    item_id: mid, part: sortItem["part"],
                    image: properties[sortItem["key"]],
                    name: sortItem["name"],
                    equiped: item["equiped"],
                })
            }
        }
    }

    return assets_items
}
