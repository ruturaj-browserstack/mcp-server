import { apiClient } from "../../lib/apiClient.js";
import FormData from "form-data";
import fs from "fs";
import {
  validateUploadPath,
  APP_BINARY_EXTENSIONS,
  MAX_APP_UPLOAD_BYTES,
} from "../../lib/upload-validator.js";
import appConfig from "../../config.js";

interface UploadResponse {
  app_url: string;
}

export async function uploadApp(
  filePath: string,
  username: string,
  password: string,
): Promise<UploadResponse> {
  const safePath = validateUploadPath(filePath, {
    allowedExtensions: APP_BINARY_EXTENSIONS,
    maxSizeBytes: MAX_APP_UPLOAD_BYTES,
    allowedBaseDir: appConfig.UPLOAD_BASE_DIR,
  });

  const formData = new FormData();
  formData.append("file", fs.createReadStream(safePath));

  try {
    const response = await apiClient.post<UploadResponse>({
      url: "https://api-cloud.browserstack.com/app-live/upload",
      headers: {
        ...formData.getHeaders(),
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
      },
      body: formData,
    });

    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error?.message || String(error);
    throw new Error(`Failed to upload app: ${msg}`);
  }
}
