import {contentPage} from "/assets/lib/chrome.js";
import {getUrlQuery} from "/assets/lib/utils.js";
import {MessageInfo, MessageTips} from "/assets/lib/message.js";
import {loadPageContent, ParseAssets, createAssetTag} from "/action/js/item_module.js";


document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};

document.getElementById("load-all").onclick = async function() {
    const item_id =  getUrlQuery("item_id", null);
    const res = await contentPage("LoadGardPart", {
        "part": "suit", "item_id": item_id,
    });
    if (res["code"] === 0) {
        await MessageInfo({message: "操作成功"});
        location.reload();
    } else {
        await MessageInfo({message: res["message"]});
    }
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

    async function handler() {
        if (this.dataset["type"] === "2") {
            window.location.href = this.dataset["part"] + ".html";
            return null;
        }

        let res = {};
        if (this.dataset["type"] === "0") {
            res = await contentPage("LoadGardPart", {
                "part": this.dataset["part"],
                "item_id": this.dataset["item_id"]
            });
        }
        if (this.dataset["type"] === "1") {
            res = await contentPage("UnloadGardPart", {
                "part": this.dataset["part"]
            });
        }
        if (res["code"] === 0) {
            await MessageInfo({message: "操作成功"});
            location.reload();
        } else {
            await MessageInfo({message: res["message"]});
        }
    }
    for (let i = 0; i < assets_items.length; i++) {
        const tag = createAssetTag(assets_items[i], handler);
        root.append(tag);
    }
}
