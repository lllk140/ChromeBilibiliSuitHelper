import {StartLoad, searchApi} from "/action/js/gard_list_module.js";


window.onload = StartLoad;


document.getElementById("back").onclick = function() {
    // 返回上一页
    history.go(-1);
};

document.getElementById("sort").onclick = function() {
    // 排序
    window.location.href = "sort.html";
};


(async function() {
    let old_code = null;
    let search_list = [];

    function searchNext() {
        if (search_list.length === 0) {
            return false;
        }
        window.location.hash = `#${search_list[0]["item_id"]}`;
        search_list = search_list.slice(1);
        document.getElementById("search").focus();
        return true;
    }

    document.getElementById("search").onkeydown = async function(event) {
        const value = this.value.toString();

        if (!value || event.key !== "Enter") {
            return null;
        }

        if (value !== old_code) {
            old_code = value;
            search_list = [];
        } else {
            if (searchNext()) {
                return null;
            }
        }

        const reString = value.match(/:(.*?):(.*?):/) || ["", "search", "name"];

        // 处理方法
        // 搜索方式 | 其他方式
        let handlerKey = reString[1];
        const funcKey = reString[2];

        // 需要搜索的内容
        const reSearchValue = value.slice(reString[0].length);
        let searchValueArray = reSearchValue.match(/\[(.*)]/);
        if (!searchValueArray) {
            searchValueArray = ["search", reSearchValue];
        }

        // console.log(handlerKey);
        // console.log(funcKey);
        // console.log(searchValueArray);

        // 控制台
        if (handlerKey === "console" && funcKey ==="ui") {
            const root = document.getElementById("console");
            root.style.display = "block";
            return null;
        }

        // 搜索
        if (handlerKey.slice(0, 6) === "search") {
            if (handlerKey !== "searchNumber") {
                handlerKey = "searchString";
            }
            const handlerFunc = searchApi[handlerKey];
            search_list = handlerFunc(funcKey, searchValueArray[1]);

            // console.log(search_list);

            return searchNext();
        }

        return null;
    }
})();
