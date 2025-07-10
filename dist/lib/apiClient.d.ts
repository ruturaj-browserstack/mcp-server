import { AxiosRequestConfig, AxiosResponse } from "axios";
type RequestOptions = {
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
    body?: any;
};
declare class ApiResponse<T = any> {
    private _response;
    constructor(response: AxiosResponse<T>);
    get data(): T;
    get status(): number;
    get statusText(): string;
    get headers(): Record<string, string>;
    get config(): AxiosRequestConfig;
    get url(): string | undefined;
    get ok(): boolean;
}
declare class ApiClient {
    private instance;
    get<T = any>({ url, headers, params, }: RequestOptions): Promise<ApiResponse<T>>;
    post<T = any>({ url, headers, body, }: RequestOptions): Promise<ApiResponse<T>>;
    put<T = any>({ url, headers, body, }: RequestOptions): Promise<ApiResponse<T>>;
    patch<T = any>({ url, headers, body, }: RequestOptions): Promise<ApiResponse<T>>;
    delete<T = any>({ url, headers, params, }: RequestOptions): Promise<ApiResponse<T>>;
}
export declare const apiClient: ApiClient;
export type { ApiResponse, RequestOptions };
