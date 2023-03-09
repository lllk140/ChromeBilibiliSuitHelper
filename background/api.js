import {getStorage, saveStorage} from "/assets/lib/chrome.js";
import {FetchHttp} from "/background/request.js";
import {configPath} from "/background/config-path.js";


export const backgroundPageApi = {
    GetConfig: async function(message) {
        // 获取设置
        const path = configPath[message["path"]];
        const error = message["err"] || undefined;
        if (!path) {return error;}
        const key = path[message["key"]] || null;
        if (key === undefined) {return error;}
        return await getStorage(key.key, key.default);
    },

    SetConfig: async function(message) {
        // 设置内容
        const path = configPath[message["path"]];
        if (!path) {return null;}
        const key = path[message["key"]];
        if (key === undefined) {return null;}
        const config = {};
        config[key.key] = message["value"]
        return await saveStorage(config);
    },

    VerifyScammer: async function(message) {
        // 验证是不是骗子, 正常用户return true
        const scammer = await backgroundPageApi.GetConfig({path: "Scammer", key: "List"});
        const mid = (message["uid"]).toString();
        return (scammer || []).indexOf(mid) === -1
    },
}


export async function updateScammer() {
    // 更新骗子名单
    const scammerUrl = await backgroundPageApi.GetConfig({path: "Scammer", key: "Url"});
    const update_time = await backgroundPageApi.GetConfig({path: "Scammer", key: "Time"});
    const old_version = await backgroundPageApi.GetConfig({path: "Scammer", key: "Version"});
    const now_time = parseInt(new Date().getTime() / 1000);

    if (update_time + 60 * 60 >= now_time) {
        console.log("骗子名单无需更新", `version:${old_version}`)
        return null;
    }

    let scammerText;
    try {
        new URL(scammerUrl);
        scammerText = await FetchHttp({url: scammerUrl, timeout: 5000});
    } catch (err) {
        console.log("骗子名单Url错误, 或请求超时, 启用本地内容");
        scammerText = await FetchHttp({url: "/assets/content/defaultScammer.json"});
    }

    const scammerJson = JSON.parse(scammerText);
    const new_version = scammerJson["version"];
    const old_time = new Date(old_version).getTime() / 1000;
    const new_time = new Date(new_version).getTime() / 1000;

    if (old_time >= new_time) {
        console.log("骗子名单无需更新")
        return null;
    }

    await backgroundPageApi.SetConfig({path: "Scammer", key: "Version", value: new_version});
    await backgroundPageApi.SetConfig({path: "Scammer", key: "Time", value: now_time});
    await backgroundPageApi.SetConfig({path: "Scammer", key: "List", value: scammerJson["list"]});

    const log_version = await backgroundPageApi.GetConfig({path: "Scammer", key: "Version"});
    console.log(`骗子名单更新完成 版本[${log_version}] 更新时间[${now_time}]`);

    return null;
}
