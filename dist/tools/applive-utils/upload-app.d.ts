interface UploadResponse {
    app_url: string;
}
export declare function uploadApp(filePath: string, username: string, password: string): Promise<UploadResponse>;
export {};
