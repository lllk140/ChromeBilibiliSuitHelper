const defaultScammerUrl = "https://gitee.com/a18874107188/liar/raw/master/content.json";


export const configPath = {
    "User": {
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
        "Url": {key: "ScammerContentPath-url", default: defaultScammerUrl},
        "Version": {key: "ScammerContentPath-version",default: null},
        "Time": {key: "ScammerContentPath-time",default: 0},
        "List": {key: "ScammerContentPath-list", default: []},
    }
}
