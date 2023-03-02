function backgroundPage(func_name, value) {
    // 和 background.js 交互
    return new Promise(function (resolve, _) {
        const data = {key: func_name, value: value};
        chrome.runtime.sendMessage(data, function(res) {
            resolve(res);
        })
    })
}
