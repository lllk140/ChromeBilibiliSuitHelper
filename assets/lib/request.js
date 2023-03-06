function XMLHttpSource(detail={}, body={}, setting={}) {
    // XMLHttpRequest请求
    function urlAddParams(url, params) {
        let UrlReturn = url + "?";
        for(let key in params || {}) {
            UrlReturn += `${key}=${params[key]}&`;
        }
        return UrlReturn.slice(0, UrlReturn.length-1);
    }

    function buildDataBody(form_data) {
        let body_data = "";
        for(let key in form_data || {}) {
            const _key = key;
            const _value = form_data[key];
            body_data += `${_key}=${_value}&`
        }
        return body_data.slice(0, body_data.length-1);
    }

    function buildContent(detail, body) {
        const DataType = "application/x-www-form-urlencoded";
        const JsonType = "application/json";
        const TextType = "text/plain";

        const content_type = detail["content_type"] || [];
        const sendHeaders = {};
        let sendBody = null;
        if (!body["data"] && body["json"] && detail.method === "POST") {
            content_type.push(JsonType);
            sendHeaders["Content-Type"] = content_type.join("; ");
            sendBody = JSON.stringify(body.json);
        }
        if (body["data"] && !body["json"] && detail.method === "POST") {
            content_type.push(DataType);
            sendHeaders["Content-Type"] = content_type.join("; ");
            sendBody = buildDataBody(body.data);
        }
        sendHeaders["Accept"] = detail["accept"] || TextType;
        return {body: sendBody, headers: sendHeaders};
    }

    const content = buildContent(detail, body);
    const sendBody = content["body"];
    const sendHeaders = content["headers"];
    const params = detail["params"] || {};
    const credentials = setting.withCredentials;

    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open(detail.method, urlAddParams(detail.url, params), true);
        xhr.withCredentials = (credentials === undefined || credentials === true);
        for (const key in sendHeaders) {
            xhr.setRequestHeader(key, sendHeaders[key]);
        }
        xhr.timeout = detail["timeout"] || 5000;
        xhr.onload = function() {
            if (this.status === 200) {
                resolve(this.responseText);
            } else {
                reject(new Error(xhr.statusText));
            }
        };
        xhr.send(sendBody);
    })
}

function HttpError(func, title, error) {
    // 错误
    return (async function(...args) {
        try {
            return await func(...args)
        } catch (err) {
            console.log(title + ":", err);
            return error;
        }
    });
}

const XMLHttp = HttpError(XMLHttpSource, "XMLHttp", null);
