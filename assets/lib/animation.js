export class MessageAnimation {
    // 对话框动画
    constructor(window, detail, type="info") {
        // 添加到html页面中
        document.body.append(window);

        this.window = window;
        this.detail = detail;

        // 计算上浮参数
        const spanStep = this.detail["spanStep"] || 10;
        this.span = document.body.clientHeight / spanStep;

        // 计算显示参数
        this.show_time = this.detail["ShowTime"] || 300;
        this.show_step = this.detail["ShowStep"] || 50;
        this.show_opacity_step = 1 / this.show_step;
        this.show_timeout = this.show_time / this.show_step;

        // 计算消失参数
        this.hide_time = this.detail["HideTime"] || 300;
        this.hide_step = this.detail["HideStep"] || 50;
        this.hide_opacity_step = 1 / this.hide_step;
        this.hide_timeout = this.hide_time / this.hide_step;

        // 计算初始位置
        let StartTop = this.span + (detail["offset"] || 0);
        const obj = this.getTopAndLeft(window);
        if (type === "info") {
            StartTop = obj.top + this.span + (this.detail["offset"] || 0);
            this.window.style.left = obj.left.toString() + "px";
        }
        // 应用初始位置
        this.window.style.top = StartTop.toString() + "px";

        this.top = StartTop;
        this.opacity = 0;
        this.type = type;
    }

    getTopAndLeft() {
        // 获取居中定位
        let marginLeft = getComputedStyle(document.body).marginLeft;
        marginLeft = parseInt(marginLeft.slice(0, marginLeft.length - 2));
        const windowLeft = document.body.clientWidth - this.window.clientWidth;
        let marginTop = getComputedStyle(document.body).marginTop;
        marginTop = parseInt(marginTop.slice(0, marginTop.length - 2));
        const windowTop = document.body.clientHeight - this.window.clientHeight;
        return {left: windowLeft / 2 + marginLeft, top: windowTop / 2 + marginTop}
    }

    changeStyle(opacity_step, step, method_number) {
        // 改变样式
        this.opacity += opacity_step * method_number;
        this.top -= (this.span / step) * method_number;
        this.window.style.opacity = this.opacity.toString();
        this.window.style.top = this.top.toString() +"px";
    }

    changeWindow(method="show") {
        // 改变窗口动画
        let method_number, timeout, step, opacity_step;

        opacity_step = (method === "show") ? this.show_opacity_step: this.hide_opacity_step;
        timeout = (method === "show") ? this.show_timeout: this.hide_timeout;
        step = (method === "show") ? this.show_step: this.hide_step;
        method_number = (method === "show") ? 1: -1;

        function handler(self) {
            self.changeStyle(opacity_step, step, method_number);
            if (self.opacity >= 1 && method === "show") {
                clearInterval(timer);
                return false;
            }
            if (self.opacity <= 0 && method === "hide") {
                clearInterval(timer);
                if (self.type !== "info") {
                    self.window.close();
                }
                document.body.removeChild(self.window);
                return false;
            }
        }
        let timer = setInterval(handler, timeout, this);
        return handler(this);
    }

    waitButton(button, title, time) {
        // 等待按钮
        let i = Math.floor(time / 1000);
        function handler() {
            button.innerText = i.toString();
            button.style.cursor = "default";
            button.disabled = true;
            if (i <= 0) {
                clearInterval(timer);
                button.disabled = false;
                button.innerText = title;
                button.style.cursor = "pointer";
                return false;
            }
            i -= 1;
        }
        let timer = setInterval(handler, 1000);
        return handler();
    }
}

