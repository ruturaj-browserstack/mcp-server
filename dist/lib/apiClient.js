import axios from "axios";
class ApiResponse {
    _response;
    constructor(response) {
        this._response = response;
    }
    get data() {
        return this._response.data;
    }
    get status() {
        return this._response.status;
    }
    get statusText() {
        return this._response.statusText;
    }
    get headers() {
        const raw = this._response.headers;
        const sanitized = {};
        for (const key in raw) {
            const value = raw[key];
            if (typeof value === "string") {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
    get config() {
        return this._response.config;
    }
    get url() {
        return this._response.config.url;
    }
    get ok() {
        return this._response.status >= 200 && this._response.status < 300;
    }
}
class ApiClient {
    instance = axios.create();
    async get({ url, headers, params, }) {
        const res = await this.instance.get(url, {
            headers,
            params,
        });
        return new ApiResponse(res);
    }
    async post({ url, headers, body, }) {
        const res = await this.instance.post(url, body, {
            headers,
        });
        return new ApiResponse(res);
    }
    async put({ url, headers, body, }) {
        const res = await this.instance.put(url, body, {
            headers,
        });
        return new ApiResponse(res);
    }
    async patch({ url, headers, body, }) {
        const res = await this.instance.patch(url, body, {
            headers,
        });
        return new ApiResponse(res);
    }
    async delete({ url, headers, params, }) {
        const res = await this.instance.delete(url, {
            headers,
            params,
        });
        return new ApiResponse(res);
    }
}
export const apiClient = new ApiClient();
