export function GetCardItems() {
    // 获取每个标签的data-item
    const items = [];
    const root = document.getElementById("garb_list");
    for (let i = 0; i < root.children.length; i++) {
        const item = root.children[i].dataset["item"];
        items[i] = JSON.parse(item);
    }
    return items
}

// ------------------------------------

function searchString(key, value) {
    const items = GetCardItems();
    const search_list = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item[key].toString().indexOf(value.toString()) !== -1) {
            search_list.push(item);
        }
    }
    return search_list
}

function searchNumber(key, value) {
    const numberString = value.replace(/[^0-9]/ig,"");
    if (numberString !== value) {
        return [];
    }
    const number = parseInt(numberString);

    const items = GetCardItems();
    const search_list = [];
    for (let i = 0; i < items.length; i++) {
        if (number === items[i][key]) {
            search_list.push(items[i]);
        }
    }
    return search_list
}

function searchRange(key, value, date=true) {
    const date_list = value.split("-") || [];
    if (!date_list || date_list.length !== 2) {
        return [];
    }

    let header, tail;
    try {
        if (date === true) {
            header = new Date(date_list[0]).getTime() / 1000;
            tail = new Date(date_list[1]).getTime() / 1000;
        } else {
            header = parseInt(date_list[0]);
            tail = parseInt(date_list[1]);
        }
    } catch (err) {
        console.log(err);
        return []
    }

    const search_list = [];

    const items = GetCardItems();
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        item["date"] = new Date(item["date"]).getTime() / 1000;
        if (header <= item[key] && item[key] <=tail) {
            search_list.push(item);
        }
    }
    return search_list
}

function setFanCardColor(className, color) {
    const tags = document.getElementsByClassName(className);
    for (let i = 0; i < tags.length; i++) {
        tags[i].style.color = color;
    }
}

export const inputApi = {
    search: {
        // {"name":"赏樱大会欧皇套装","item_id":4664,"number":6374,"date":"2021/04/22","own_num":2,"sale_time":-1}
        string: {
            name: function(v) {return searchString("name", v)},
            date: function(v) {return searchString("date", v)},
            number: function(v) {return searchString("number", v)},
        },
        number: {
            item_id: function(v) {return searchNumber("item_id", v)},
            number: function(v) {return searchNumber("number", v)},
            own_num: function(v) {return searchNumber("own_num", v)},
            sale_time: function(v) {return searchNumber("sale_time", v)},
        },
        range: {
            sale_time: function(v) {return searchRange("sale_time", v, true)},
            own_num: function(v) {return searchRange("sale_time", v, false)},
            item_id: function(v) {return searchRange("item_id", v, false)},
            number: function(v) {return searchRange("number", v, false)},
            date: function(v) {return searchRange("date", v, true)},
        }
    },
    console: {
        "ui": function(_) {
            console.log("open ui");
            return -1;
        },
        "reload": function(_) {
            window.location.reload();
            return -1;
        },
        "update": function(_) {
            StartLoad().then()
            return -1;
        }
    },

    card: {
        color: {
            "all": function(color) {
                // 暴力
                setFanCardColor("fan-card-name", color);
                setFanCardColor("fan-card-number-title", color);
                setFanCardColor("fan-card-number", color);
                setFanCardColor("fan-card-date-title", color);
                setFanCardColor("fan-card-date", color);
                return -1;
            },
            "name": function(color) {setFanCardColor("fan-card-name", color); return -1},
            "title1": function(color) {setFanCardColor("fan-card-number-title", color); return -1},
            "number": function(color) {setFanCardColor("fan-card-number", color); return -1},
            "title2": function(color) {setFanCardColor("fan-card-date-title", color); return -1},
            "date": function(color) {setFanCardColor("fan-card-date", color); return -1},
        }
    },
}
