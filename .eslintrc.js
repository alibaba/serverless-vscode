module.exports = {
  parser:  "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
      node: true,
  },
  rules: {
    "@typescript-eslint/indent": ["error", 2],
    "max-len": ["error", {
      "code": 120
    }],
    "quotes": [1, "single", { "avoidEscape": true }]
  },
  parserOptions: {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
        "jsx": true
    }
  }
};
