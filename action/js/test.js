import {backgroundPage} from "/assets/lib/chrome.js";
import {ListenerFocus, setInputValue} from "/action/js/module/code-tip.js";

window.onload = async function() {
    const root = document.getElementById("test-text");

    ListenerFocus(root, function(selectionStart, selectionEnd) {
        console.log(selectionStart, selectionEnd);
        if (selectionEnd + selectionStart === 10) {
            setInputValue(root, "你好", null, 10);

        }
    }, 10, false);
};


document.getElementById("test").onclick = async function() {
    await backgroundPage("SetConfig", {path: "FanCard", key: "EnableLocal", value: false});
    const data = await backgroundPage("GetConfig", {path: "FanCard", key: "EnableLocal"});
    console.log(data);
}
