import {contentPage} from "/assets/lib/chrome.js";
import {getUrlQuery} from "/assets/lib/utils.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";
import {loadPageContent, ParseAssets, createAssetTag} from "/action/js/item_module.js";


document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};


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
    console.log(AssetsRes)

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

    loadPageContent(AssetsRes["data"], BuyNumRes["data"]["own_num"]);

    const assets_items = ParseAssets(AssetsRes);
    console.log(assets_items)

    const root = document.getElementById("assets");
    root.innerHTML = "";
    for (let i = 0; i < assets_items.length; i++) {
        const tag = createAssetTag(assets_items[i]);
        root.append(tag);
    }
}
