import {backgroundPageApi, updateScammer} from "/background/api.js";

chrome.runtime.onInstalled.addListener(async function() {
    chrome.contextMenus.create({
        id: "main",
        title: "1701735549",
        type: "normal",
        visible: true
    });

    chrome.contextMenus.create({
        id: "github",
        title: "github",
        type: "normal",
        visible: true,
        parentId: "main"
    });

    chrome.contextMenus.create({
        id: "bilibili",
        title: "bilibili",
        type: "normal",
        visible: true,
        parentId: "main",
    });

    await updateScammer();
    setInterval(updateScammer, 1000 * 60 * 60);
});

const contextMenusApi = {
    github: async function(_) {
        await chrome.tabs.create({url: "https://github.com/lllk140/ChromeBilibiliSuitHelper"});
    },
    bilibili: async function(_) {
        await chrome.tabs.create({url: "https://space.bilibili.com/1701735549"});
    },
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    const func = contextMenusApi[info.menuItemId] || async function(_) {return null};
    func(info).then(null);
    return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const func = backgroundPageApi[message.key] || async function(_) {return null};
    func(message.value).then(sendResponse);
    return true;
});
