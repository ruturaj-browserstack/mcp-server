import { ConfigMapping } from "./types.js";
import * as constants from "./constants.js";

export const SUPPORTED_CONFIGURATIONS: ConfigMapping = {
  python: {
    selenium: {
      pytest: { instructions: constants.pythonInstructions },
    }
  },
  javascript: {
    selenium: {
      mocha: { instructions: constants.nodejsInstructions },
    }
  },
  java: {
    selenium: {
      junit: { instructions: constants.javaInstructions },
    }
  },
  ruby: {
    selenium: {
      rspec: { instructions: constants.rubyInstructions },
    }
  },
  csharp: {
    selenium: {
      nunit: { instructions: constants.csharpInstructions },
    }
  },
};
