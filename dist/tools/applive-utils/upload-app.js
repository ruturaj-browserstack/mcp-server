import { apiClient } from "../../lib/apiClient.js";
import FormData from "form-data";
import fs from "fs";
export async function uploadApp(filePath, username, password) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
    }
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    try {
        const response = await apiClient.post({
            url: "https://api-cloud.browserstack.com/app-live/upload",
            headers: {
                ...formData.getHeaders(),
                Authorization: "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
            },
            body: formData,
        });
        return response.data;
    }
    catch (error) {
        const msg = error?.response?.data?.message || error?.message || String(error);
        throw new Error(`Failed to upload app: ${msg}`);
    }
}
