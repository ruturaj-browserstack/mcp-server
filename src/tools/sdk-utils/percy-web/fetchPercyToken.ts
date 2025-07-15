//Fetches a Percy token for a given project name from the BrowserStack API.
// Returns the token if successful, or throws an error if not.

export async function fetchPercyToken(
  projectName: string,
  authorization: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.browserstack.com/api/app_percy/get_project_token?name=${encodeURIComponent(projectName)}&type=web`,
      {
        headers: {
          Authorization: authorization,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch Percy token: ${response.status}`);
    }
    const data = await response.json();
    if (!data || !data.token || !data.success) {
      throw new Error(
        "Looks like project already exists but uses automate for running tests. Use different project name all together."
      );
    }
    return data.token;
  } catch (error) {
    throw new Error(
      `Error retrieving Percy token: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
