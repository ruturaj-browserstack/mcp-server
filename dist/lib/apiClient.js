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
    async requestWrapper(fn, raise_error = true) {
        try {
            const res = await fn();
            return new ApiResponse(res);
        }
        catch (error) {
            if (error.response && !raise_error) {
                return new ApiResponse(error.response);
            }
            throw error;
        }
    }
    async get({ url, headers, params, raise_error = true, }) {
        return this.requestWrapper(() => this.instance.get(url, { headers, params }), raise_error);
    }
    async post({ url, headers, body, raise_error = true, }) {
        return this.requestWrapper(() => this.instance.post(url, body, { headers }), raise_error);
    }
    async put({ url, headers, body, raise_error = true, }) {
        return this.requestWrapper(() => this.instance.put(url, body, { headers }), raise_error);
    }
    async patch({ url, headers, body, raise_error = true, }) {
        return this.requestWrapper(() => this.instance.patch(url, body, { headers }), raise_error);
    }
    async delete({ url, headers, params, raise_error = true, }) {
        return this.requestWrapper(() => this.instance.delete(url, { headers, params }), raise_error);
    }
}
export const apiClient = new ApiClient();
