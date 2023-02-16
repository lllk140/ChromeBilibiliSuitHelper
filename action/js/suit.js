const ContentItemBoxBg_Id = "content-item-box-bg"
const ContentBox_Id = "content-box";

const FanNumberList_Id = "fan-number-list";

const BackgroundImageOpacity = 0.6;

const FanNumberStataShow_ClassName = "fan-number-state-show";
const FanNumberStataNo_ClassName = "fan-number-state-no";
const FanNumberStataYes_ClassName = "fan-number-state-yes";
const FanNumberStataChoose_ClassName = "fan-number-state-choose";

const UpdateBgOpacity_Id = "update-bg-opacity";

function UpdateBackgroundImage(image_url) {
    // 更新背景
    const img = document.getElementById(ContentItemBoxBg_Id);
    img.src = image_url;
    img.style.opacity = BackgroundImageOpacity.toString();
    const bgOpacity = document.getElementById(UpdateBgOpacity_Id);
    bgOpacity.value = BackgroundImageOpacity * 100
}

async function FanCardClickHandle() {
    const item = ParseFanCardTag(this);
    await SetContent2Page(item["item_id"]);

    UpdateBackgroundImage(item["image_cover"]);
    delete item["fan_share_image"];
    delete item["image_cover"];
    const root = document.getElementById(ContentBox_Id);
    root.dataset["item_id"] = item["item_id"];
}

(async function() {
    updateBackButton("back", false);

    await BuildFanCards(FanCardClickHandle, false);

    const fanCardTags = GetFanCardsTag();
    if (fanCardTags.length !== 0) {
        fanCardTags[0].click();
    }
})();


document.getElementById(FanCardsSort_Id).onclick = async function() {
    const path_list = window.location.pathname.split("/");
    const from_url = getQueryString("from") || "popup.html";
    const index_url = path_list[path_list.length-1];
    const go_url = "sort.html";
    location.replace(`${go_url}?from=${from_url},${index_url}`);
};

document.getElementById(UpdateBgOpacity_Id).onchange = async function() {
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
    if (fanCardTags.length !== 0) {
        fanCardTags[0].click();
    }
}