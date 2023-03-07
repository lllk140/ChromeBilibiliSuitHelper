
export const configPath = {
    "User": {
        // 用户信息, uid, access_key
        "UserId": {key: "UserContent-user_id", default: null},
        "AccessKey": {key: "UserContent-access_key", default: null},
    },

    "FanCard": {
        "EnableLocal": {key: "FanCardConfig-enable_local", default: true},
        "Speed": {key: "FanCardConfig-speed", default: 20},
        "Total": {key: "FanCardConfig-total", default: 0},
        "List": {key: "FanCardContent-list", default: []},
    },

    "Scammer": {
        "Url": {key: "ScammerContentPath-url", default: null},
        "Version": {key: "ScammerContentPath-version",default: 0},
        "List": {key: "ScammerContentPath-list", default: []},
    }
}
