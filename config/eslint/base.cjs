/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "next/core-web-vitals"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-const": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "dist/",
    "build/",
    "*.config.js",
    "*.config.ts"
  ]
};
