/**
 * ESLint Configuration for The First Dungeon Webxdc
 * Flat config format for ESLint 10+
 */

import globals from "globals";

export default [
  {
    files: ["src-unminified/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        PIXI: "readonly",
        $: "readonly",
        jQuery: "readonly",
        log: "readonly",
        error: "readonly",
        show: "readonly",
        hide: "readonly",
        getLocalStorage: "readonly",
        setLocalStorage: "readonly",
        webxdc: "readonly",
        gameInstance: "writable",
        gameInterface: "writable"
      }
    },
    rules: {
      // Indentation
      "indent": ["error", 4],
      
      // Semicolons
      "semi": ["error", "always"],
      
      // Quotes
      "quotes": ["warn", "single"],
      
      // No unused variables
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      
      // No console in production
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // Prefer const over let
      "prefer-const": "error",
      
      // No var
      "no-var": "error",
      
      // Arrow functions
      "prefer-arrow-callback": "error",
      
      // Max line length
      "max-len": ["warn", { code: 120, ignoreComments: true }],
      
      // Require curly braces
      "curly": ["error", "all"],
      
      // No multiple empty lines
      "no-multiple-empty-lines": ["error", { max: 2 }],
      
      // Space before function paren
      "space-before-function-paren": ["error", "always"],
      
      // Key spacing
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      
      // No trailing spaces
      "no-trailing-spaces": "error",
      
      // EOL last
      "eol-last": "error"
    }
  },
  {
    ignores: [
      "node_modules/",
      "dist/",
      "vendor/",
      "*.min.js",
      "the-first-dungeon.xdc",
      "src/"
    ]
  }
];
