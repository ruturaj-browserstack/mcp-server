export function validateLogResponse(response, logType) {
    if (!response.ok) {
        if (response.status === 404) {
            return { message: `No ${logType} available for this session` };
        }
        if (response.status === 401 || response.status === 403) {
            return {
                message: `Unable to access ${logType} - please check your credentials`,
            };
        }
        return { message: `Unable to fetch ${logType} at this time` };
    }
    return null;
}
export function filterLinesByKeywords(logText, keywords) {
    return logText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)));
}
