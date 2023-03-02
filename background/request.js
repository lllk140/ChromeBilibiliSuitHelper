export const requestUtils = {
    urlAddParams: function(url, params) {
        let UrlReturn = url + "?";
        for(let key in params || {}) {
            UrlReturn += `${key}=${params[key]}&`;
        }
        return UrlReturn.slice(0, UrlReturn.length-1);
    },

    buildDataBody: function(form_data) {
        let body_data = "";
        for(let key in form_data || {}) {
            const _key = key;
            const _value = form_data[key];
            body_data += `${_key}=${_value}&`
        }
        return body_data.slice(0, body_data.length-1);
    },

    buildContent: function(detail, body) {
        const DataType = "application/x-www-form-urlencoded";
        const JsonType = "application/json";
        const TextType = "text/plain";

        const content_type = detail["content_type"] || [];
        const sendHeaders = {};
        let sendBody = null;
        if (body["data"] && !body["json"] && detail.method === "POST") {
            content_type.push(DataType);
            sendHeaders["Content-Type"] = content_type.join("; ");
            sendBody = requestUtils.buildDataBody(body.data);
        }
        if (!body["data"] && body["json"] && detail.method === "POST") {
            content_type.push(JsonType);
            sendHeaders["Content-Type"] = content_type.join("; ");
            sendBody = JSON.stringify(body.json);
        }
        sendHeaders["Accept"] = detail["accept"] || TextType;
        return {body: sendBody, headers: sendHeaders};
    }
}

export function FetchHttpSource(detail={}, body={}, setting={}) {
    // Fetch请求
    const content = requestUtils.buildContent(detail, body);
    const sendBody = content["body"];
    const sendHeaders = content["headers"];
    const params = detail["params"] || {};

    function timeoutPromise() {
        // 超时
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(null);
            }, detail["timeout"] || 5);
        })
    }

    function requestPromise() {
        // 请求
        return fetch(requestUtils.urlAddParams(detail.url, params), {
            method: detail.method,
            mode: setting.mode || "cors",
            cache: setting.cache || "no-cache",
            credentials: setting.credentials || "same-origin",
            body: sendBody,
            headers: sendHeaders,
        })
    }

    return new Promise(function (resolve, reject) {
        Promise.race([timeoutPromise(), requestPromise()]).then(function (response) {
            if (response === null) {
                reject(new Error("timeout"));
                return null;
            }
            if (response.status !== 200) {
                reject(new Error(response.statusText));
                return null;
            }
            return response.text();
        }).then(function(res) {
            resolve(res);
        })
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

export const FetchHttp = HttpError(FetchHttpSource, "FetchHttp", undefined);
