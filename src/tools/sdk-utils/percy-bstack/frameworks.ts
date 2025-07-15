import { PercyConfigMapping } from "./types.js";
import * as constants from "./constants.js";

export const PERCY_INSTRUCTIONS: PercyConfigMapping = {
  java: {
    selenium: {
      testng: { script_updates: constants.javaSeleniumInstructions },
      cucumber: { script_updates: constants.javaSeleniumInstructions },
      junit4: { script_updates: constants.javaSeleniumInstructions },
      junit5: { script_updates: constants.javaSeleniumInstructions },
    },
  },
  csharp: {
    selenium: {
      nunit: { script_updates: constants.csharpSeleniumInstructions },
    },
  },
  nodejs: {
    selenium: {
      mocha: {
        script_updates: constants.nodejsSeleniumInstructions,
      },
      jest: {
        script_updates: constants.nodejsSeleniumInstructions,
      },
      webdriverio: {
        script_updates: constants.webdriverioPercyInstructions,
      },
    },
  }
};
