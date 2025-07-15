/**
 * Type for Percy Web configuration mapping.
 * Structure: language -> automationFramework -> testingFramework -> { instructions: (percyToken: string) => string }
 */
export type ConfigMapping = {
  [language: string]: {
    [automationFramework: string]: {
      [testingFramework: string]: { 
        instructions: (percyToken: string) => string;
      };
    };
  };
};
