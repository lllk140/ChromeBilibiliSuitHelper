const ContentItemBoxBg_Id = "content-item-box-bg"
const ContentBox_Id = "content-box";

const FanNumberList_Id = "fan-number-list";

const BackgroundImageOpacity = 0.6;

function UpdateBackgroundImage(image_url) {
    // 更新背景
    const img = document.getElementById(ContentItemBoxBg_Id);
    img.src = image_url;
    img.style.opacity = BackgroundImageOpacity.toString();
    const bgOpacity = document.getElementById("update-bg-opacity");
    bgOpacity.value = BackgroundImageOpacity * 100
}

async function FanCardClickHandle() {
    // 加载内容
    const item = ParseFanCardTag(this);

    const setFanNumber = SetFanNumber2Page(item["item_id"]);

    await setFanNumber

    UpdateBackgroundImage(item["image_cover"]);
    delete item["fan_share_image"];
    delete item["image_cover"];
    const root = document.getElementById(ContentBox_Id);
    root.dataset["item_id"] = item["item_id"];
}

(async function() {
    createBackButton("back", {}, false);
    createLinkButton(FanCardsSort_Id, "sort.html", {}, false);
    await BuildFanCards(FanCardClickHandle, false);

    const item = ParseUrlQueryData("data") || {};

    if (item["item_id"]) {
        window.location.hash = `#${item["item_id"]}`;
        document.getElementById(item["item_id"]).click();
    } else {
        const fanCardTags = GetFanCardsTag();
        if (fanCardTags.length !== 0) {
            fanCardTags[0].click();
        }
    }
})();


document.getElementById("update-bg-opacity").onchange = async function() {
    // 设置背景图片透明度
    const img = document.getElementById(ContentItemBoxBg_Id);
    img.style.opacity = (parseInt(this.value) / 100).toString();
    this.style.opacity = ((parseInt(this.value) / 100) || 0.2).toString();
}

document.getElementById("update-fan-cards").onclick = async function() {
    console.log("手动更新")
    const user = await GetFanCardsTotal();
    if (user.code !== 0) {
        console.log(user["message"]);
        return null;
    }
    const items = await GetFanCardsList(user.total);
    SetFanCards2Page(items);

    const tags = GetFanCardsTag();
    for (let i = 0; i < tags.length; i++) {
        tags[i]["onclick"] = FanCardClickHandle;
    }

    if (FanCardsListSaveLocal) {
        console.log("保存数据到本地");
        await SaveItems2Local(user.uid, user.total);
    }
    const fanCardTags = GetFanCardsTag();

    if (fanCardTags.length === 0) {
        return null
    }

    const contentTag = document.getElementById("content-box");
    const old_item_id = contentTag.dataset["item_id"];
    if (old_item_id && !FanCardsUpdateAfterReset) {
        document.getElementById(old_item_id).click();
    } else {
        fanCardTags[0].click();
    }
}
