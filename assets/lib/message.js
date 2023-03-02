import {MessageAnimation} from "/assets/lib/animation.js";
import {sleepTime} from "/assets/lib/utils.js";

function createDefaultDialog(detail, template) {
    // 创建默认Dialog页
    const dialog = document.createElement("dialog");
    dialog.classList.add("MessageDialog");

    for (let i = 0; i < (detail["classList"] || []).length; i++) {
        dialog.classList.add(detail["classList"][i]);
    }

    const content = document.createElement("div");
    if (template) {
        content.innerHTML = template;
    } else {
        content.innerText = detail["message"] || "";
        content.style.color = "rgb(255, 255, 255)";
    }
    dialog.append(content);
    return dialog
}

export async function MessageTips(detail={}, template=null) {
    // 创建一个确认窗口
    const dialog = createDefaultDialog(detail, template);

    const button = document.createElement("button");
    button.style.cursor = "default";
    button.disabled = true;
    dialog.append(button);

    const message = new MessageAnimation(dialog, detail, "tips");
    message.window.showModal();

    button.onclick = async function() {
        message.changeWindow("hide");
    }
    message.changeWindow("show");

    const button_title = detail["button_title"] || "确认";
    const button_wait_time = detail["button_wait_time"] || 0;
    message.waitButton(button, button_title, button_wait_time);

    return new Promise(function(resolve, _) {
        message.window.onclose = function() {
            resolve(true);
        }
    });
}

export async function MessageJudge(detail={}, template=null) {
    // 创建一个判断窗口
    const dialog = createDefaultDialog(detail, template);

    const NoButton = document.createElement("button");
    NoButton.innerText = detail["NoButtonTitle"] || "取消";
    const YesButton = document.createElement("button");
    YesButton.style.cursor = "default";
    YesButton.disabled = true;

    dialog.append(YesButton);
    dialog.append(NoButton);

    const message = new MessageAnimation(window, detail, "judge");
    let return_bool = null;
    YesButton.onclick = async function() {
        message.changeWindow("hide");
        return_bool = true;
    }
    NoButton.onclick = async function() {
        message.changeWindow("hide");
        return_bool = false;
    }
    message.changeWindow("show");

    const button_title = detail["button_title"] || "确认";
    const button_wait_time = detail["button_wait_time"] || 0;
    message.waitButton(YesButton, button_title, button_wait_time);

    return new Promise(async function(resolve, _) {
        message.window.onclose = function() {
            resolve(return_bool);
        }
    });
}

export async function MessageInfo(detail={}, className=null) {
    // 创建一个自动关闭的提示窗口
    const info = document.createElement("div");
    info.classList.add(className || "MessageInfo");
    info.innerText = detail["message"];

    const message = new MessageAnimation(info, detail, "info");
    message.changeWindow("show");
    await sleepTime(detail["wait_time"] || 1500);
    message.changeWindow("hide");
}
