

window.onload = async function() {
    const uid = window.location.pathname.split("/")[1];
    const flags = await backgroundPage("VerifyScammer", {"uid": uid});

    console.log(uid)

    if (!flags) {
        const info = document.createElement("a");
        info.style.color = "red";
        info.innerText = "[装扮骗子, 注意防骗]";
        info.href = "https://github.com/cyh946/kcz/";

        let timer = setInterval(function() {
            const root = document.getElementById("h-name");
            root.title = "此用户在骗子名单中, 注意防骗"
            if (root) {
                root.appendChild(info);
                clearInterval(timer);
            }
        }, 50);
    }
};