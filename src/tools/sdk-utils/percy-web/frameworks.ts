import { ConfigMapping } from "./types.js";
import * as constants from "./constants.js";

export const SUPPORTED_CONFIGURATIONS: ConfigMapping = {
  python: {
    selenium: {
      pytest: { instructions: constants.pythonInstructions },
    }
  },
};
