const biliApi = {
    GetCookies: async function (message = {type: "json"}) {
        // 获取cookies -> type[dict]
        if (message.type !== "json") {
            return document.cookie;
        }
        let cookie = {};
        if (!document.cookie) {
            return cookie;
        }
        let cookie_list = document.cookie.split("; ");
        for (let i = 0; i < cookie_list.length; i++) {
            let element = cookie_list[i].split("=");
            if (element.length < 2) {
                element = [element[0], ""];
            }
            cookie[element[0]] = element[1];
        }
        return cookie
    },

    GetMyFollowers: async function(message) {
        // 获取粉丝列表
        const url = "https://api.bilibili.com/x/relation/followers";
        const cookies = await biliApi.GetCookies({type: "json"});
        const vmid = cookies["DedeUserID"];
        const params = {"vmid": vmid, "pn": message.pn || 1, "ps": message.ps || 20};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetMyFanCards: async function(message) {
        // 获取自己拥有的装扮
        const url = "https://api.bilibili.com/x/garb/user/suit/asset/list";
        const params = {
            "part": "suit", "state": "active", "is_fans": "true",
            "ps": message.ps || 1, "pn": message.pn || 1,
        };
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetMyFanNumInventory: async function(message) {
        // 获取自己指定装扮的库存
        const url = "https://api.bilibili.com/x/garb/user/fannum/list";
        const params = {"item_id": message.item_id || ""};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetSuitAssets: async function(message) {
        // 获取装扮的内容
        const url = "https://api.bilibili.com/x/garb/user/suit/asset";
        const params = {"item_id": message.item_id, "part": "suit", "trial": "0"};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetSuitBuyNum: async function(message) {
      // 获取装扮购买套数
      const url = "https://api.bilibili.com/x/garb/user/multbuy";
        const params = {"item_id": message.item_id || ""};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetOthersInfo: async function(message) {
        // 获取其他人基础信息
        const url = "https://account.bilibili.com/api/member/getCardByMid";
        const params = {"mid": message.mid || ""};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetUserRelation: async function(message) {
        // 查询目标用户关系
        const url = "https://api.bilibili.com/x/space/acc/relation";
        const params = {"mid": message.mid || ""};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    GetOutFanNumberList: async function(message) {
        // 获取赠送列表
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/out/list";
        const params = {"item_id": message.item_id || ""};
        const res = await XMLHttp({method: "GET", url: url, params: params});
        return JSON.parse(res);
    },

    // -------------------------------------------------------------------------------

    LoadGardPart: async function(message) {
        // 设置装扮对应组件
        const cookies = await biliApi.GetCookies({type: "json"});
        const url = "https://api.bilibili.com/x/garb/user/equip/load";
        const formData = {
            "part": message["part"],
            "item_id": message["item_id"],
            "csrf": cookies["bili_jct"],
        };
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    UnloadGardPart: async function(message) {
        // 卸下装扮对应组件
        const cookies = await biliApi.GetCookies({type: "json"});
        const url = "https://api.bilibili.com/x/garb/user/equip/unload";
        const formData = {"part": message["part"], "csrf": cookies["bili_jct"]};
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    CancelGiveFanNumber: async function(message) {
        // 取消赠送
        const cookies = await biliApi.GetCookies({type: "json"});
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/cancel";
        const formData = {
            "present_token": message.token, "csrf": cookies["bili_jct"],
        };
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    ApplyFanNumberSort: async function(message) {
        // 应用装扮排序
        const url = "https://api.bilibili.com/x/garb/user/suit/asset/list/sort";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {"ids": message.ids.join(","), "csrf": cookies["bili_jct"]};
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    GiveFanNumber: async function(message) {
        // 赠送装扮
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/v2";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "fan_num": message["fan_num"],
            "to_mid": message["to_mid"], "csrf": cookies["bili_jct"],
        };
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    ShareFanNumber: async function(message) {
        //  生成共享链接
        const url = "https://api.bilibili.com/x/garb/user/fannum/present/share";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "fan_nums": message["fan_num"],
            "csrf": cookies["bili_jct"],
        };
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    ShowFanNumber: async function(message) {
        // 展示粉丝编号到卡面
        const url = "https://api.bilibili.com/x/garb/user/fannum/change";
        const cookies = await biliApi.GetCookies({type: "json"});
        const formData = {
            "item_id": message["item_id"], "num": message["fan_num"],
            "csrf": cookies["bili_jct"],
        };
        const res = await XMLHttp({method: "POST", url: url}, {data: formData});
        return JSON.parse(res);
    },

    BuildShortLinkUrl: async function(message) {
        // 生成短链接
        const url = "https://api.bilibili.com/x/share/click";
        const GoUrl = decodeURI(encodeURIComponent(message["url"]));
        const formData = {
            "build": 6700300, "buvid": 0, "oid": GoUrl,
            "platform": "windows", "share_channel": "COPY",
            "share_id": "public.webview.0.0.pv", "share_mode": 3,
        };
        const setting = {withCredentials: false};
        const res = await XMLHttp({method: "POST", url: url}, {data: formData}, setting);
        return JSON.parse(res);
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    let func = biliApi[message.key] || async function(_) {return null};
    func(message.value).then(sendResponse);
    return true;
});
