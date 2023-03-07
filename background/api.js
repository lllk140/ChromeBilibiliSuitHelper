import {getStorage, saveStorage} from "/assets/lib/chrome.js";
import {FetchHttp} from "/background/request.js";
import {configPath} from "/background/config-path.js";

export async function updateScammer() {
    // 更新骗子名单
    const scammerUrl = "https://raw.githubusercontent.com/cyh946/kcz/main/kcz.txt";

    const content = await getStorage("scammer", {});
    const old_time = content["time"] || 0;
    const update_time = parseInt(new Date().getTime() / 1000);
    if (update_time - old_time < 6 * 60 * 60) {
        console.log("无需要更新");
        return null;
    }

    const old_version = content["version"] || "0.0";
    let scammerText = await FetchHttp({url: scammerUrl, timeout: 5000});
    if (scammerText === undefined) {
        console.log("启用本地骗子名单");
        scammerText = await FetchHttp({url: "/assets/content/defaultScammer.txt"});
    }

    const version = (/版本(.*);/g).exec(scammerText)[1];
    const version_list = version.split(".");
    const old_version_list = old_version.split(".");


    if (version_list.length < old_version_list.length) {
        version_list.push("0");
    }
    if (version_list.length > old_version_list.length) {
        old_version_list.push("0");
    }

    let step = 10 ** version_list.length;
    let version_number = 0;
    let old_version_number = 0;

    for (let i = 0; i < version_list.length; i++) {
        const num = parseInt(version_list[i]) || 0;
        const old_num = parseInt(old_version_list[i]) || 0;
        version_number += num * (step / 10 ** i);
        old_version_number += old_num * (step / 10 ** i);
    }

    if (version_number > old_version_number) {
        let result = "";
        let i = 0;
        const scammerList = [];
        const uidReg = /sb(.*);/g;
        while(result = uidReg.exec(scammerText)) {
            scammerList[i] = result[1]
            i += 1
        }

        content["list"] = scammerList;
        content["version"] = version;
        content["time"] = update_time;

        const saveContent = {}
        saveContent["scammer"] = content;

        await saveStorage(saveContent);
        console.log(`骗子名单更新完成 版本[${version}] 更新时间[${update_time}]`);
    } else {
        console.log(`骗子名单无需更新`);
    }

    return null;
}

export const backgroundPageApi = {
    VerifyScammer: async function(message) {
        // 验证是不是骗子, 正常用户return true
        let scammer = await getStorage("scammer", {});
        const mid = (message["uid"]).toString();
        return (scammer["list"] || []).indexOf(mid) === -1
    },

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
}
