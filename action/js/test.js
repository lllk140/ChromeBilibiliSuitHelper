import {contentPage} from "/assets/lib/chrome.js";
import {getUrlQuery} from "/assets/lib/utils.js";

const AssetsTextObj = {
    "space_bg": "空间海报",
    "skin": "个性主题",
    "card": "动态卡片",
    "card_bg": "评论装扮",
    "loading": "加载动画",
    "play_icon": "进度条",
    "thumbup": "动态点赞特效",
    "pendant": "头像挂件",
    "emoji": "表情包"
}

const privateKeys = {
    "space_bg": "image1_landscape",
    "skin": "image_cover",
    "card": "image_preview_small",
    "card_bg": "image_preview_small",
    "loading": "image_preview_small",
    "play_icon": "squared_image"
}

document.getElementById("setting").onclick = async function() {
    const item_id =  getUrlQuery("item_id", null);
    const res = await contentPage("GetSuitAssets", {item_id: item_id});

    // 装扮专属内容
    const private_ids = res["data"]["item"]["properties"]["fan_item_ids"].split(",");
    const assets = res["data"]["assets"];

    const resObj = {};
    for (let i = 0; i < private_ids.length; i++) {
        const mid = private_ids[i];
        for (let i = 0; i < assets.length; i++) {
            if (assets[i]["item"]["item_id"].toString() === mid.toString()) {
                resObj[mid] = {part: assets[i]["part"], data: assets[i]["item"]["properties"]};
            }
        }
    }

    // const attachList = [
    //     "item_id_card", "item_id_emoji", "item_id_pendant", "item_id_thumbup"
    // ]

    // const properties = res["data"]["item"]["properties"];
    // for (let i = 0; i < attachList.length; i++) {
    //     const data = properties[attachList[i]];
    //     if (!data) {
    //         continue
    //     }
    //     fan_item_ids.push(data);
    // }

    console.log(resObj);
}
