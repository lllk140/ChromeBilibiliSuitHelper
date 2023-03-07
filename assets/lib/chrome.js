export function saveStorage(content) {
    // 保存数据到本地
    return new Promise(function (resolve, _) {
        chrome.storage.local.set(content, function() {
            resolve(content);
        });
    });
}

export function getStorage(key, err={}) {
    // 获取本地数据
    return new Promise(function (resolve, _) {
        chrome.storage.local.get([key], function(value) {
            console.log(value)
            resolve(value[key] === undefined ? err : value[key]);
        });
    });
}

export function backgroundPage(func_name, value) {
    // 和 background.js 交互
    return new Promise(function (resolve, _) {
        const data = {key: func_name, value: value};
        chrome.runtime.sendMessage(data, function(res) {
            resolve(res);
        })
    })
}

export function contentPage(func_name, value) {
    // 和content.js 交互
    return new Promise(function (resolve, _) {
        const con = {currentWindow: true, active: true};
        chrome.tabs.query(con, function(tabs) {
            const data = {key: func_name, value: value};
            chrome.tabs.sendMessage(tabs[0].id, data, function(res) {
                resolve(res);
            });
        });
    });
}
