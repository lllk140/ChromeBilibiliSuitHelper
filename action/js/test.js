import {backgroundPage} from "/assets/lib/chrome.js";


document.getElementById("test").onclick = async function() {
    await backgroundPage("SetConfig", {path: "FanCard", key: "EnableLocal", value: false});
    const data = await backgroundPage("GetConfig", {path: "FanCard", key: "EnableLocal"});
    console.log(data);
}
