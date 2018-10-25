module.exports = {
  "extends": "airbnb",
  "plugins": [
    "jest",
  ],
  "env": {
    "node": true,
    "es6": true,
    "jest/globals": true
  },
  "rules": {
    "function-paren-newline": ["error", "consistent"],
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-unused-expressions": ["error", { "allowShortCircuit": true, "allowTernary": true }],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "arrow-parens": ["error", "as-needed"],
  },
}
