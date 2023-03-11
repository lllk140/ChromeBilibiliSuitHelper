import {backgroundPage} from "/assets/lib/chrome.js";
import {ListenerFocus, setInputValue, codeTips} from "/action/js/module/code-tip.js";

window.onload = async function() {
    const root = document.getElementById("test-text");
    ListenerFocus(root, function(selectionStart, selectionEnd) {
        console.log(selectionStart, selectionEnd);


        let value = root.value.slice(selectionStart, selectionEnd);
        if (selectionStart === selectionEnd) {
            value = root.value.slice(0, selectionEnd);
        }

        const test = codeTips(value, {
            "test": {
                "data": {
                    "ccc": function() {
                        console.log(1)
                    }
                }
            }
        }, null);

        console.log(test);

    }, 10, false);
};


document.getElementById("test").onclick = async function() {
    const data1 = await backgroundPage("GetConfig", {path: "FanCard", key: "EnableLocal"});
    await backgroundPage("SetConfig", {path: "FanCard", key: "EnableLocal", value: !data1});
    const data = await backgroundPage("GetConfig", {path: "FanCard", key: "EnableLocal"});
    console.log(data);
}
