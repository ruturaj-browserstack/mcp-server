export declare const SessionType: {
    readonly Automate: "automate";
    readonly AppAutomate: "app-automate";
};
export declare const AutomateLogType: {
    readonly NetworkLogs: "networkLogs";
    readonly SessionLogs: "sessionLogs";
    readonly ConsoleLogs: "consoleLogs";
};
export declare const AppAutomateLogType: {
    readonly DeviceLogs: "deviceLogs";
    readonly AppiumLogs: "appiumLogs";
    readonly CrashLogs: "crashLogs";
};
export type SessionType = (typeof SessionType)[keyof typeof SessionType];
export type AutomateLogType = (typeof AutomateLogType)[keyof typeof AutomateLogType];
export type AppAutomateLogType = (typeof AppAutomateLogType)[keyof typeof AppAutomateLogType];
