/**
 * Prettier Configuration for The First Dungeon Webxdc
 */

export default {
  // Line length
  printWidth: 120,
  
  // Indentation
  tabWidth: 4,
  useTabs: false,
  
  // Semicolons
  semi: true,
  
  // Quotes
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // Trailing commas
  trailingComma: 'none',
  
  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // End of line
  endOfLine: 'lf',
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
  
  // Insert pragma
  insertPragma: false,
  
  // Prose wrap
  proseWrap: 'preserve',
  
  // Require pragma
  requirePragma: false,
  
  // JSX
  jsxSingleQuote: false,
  
  // Overrides for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80
      }
    }
  ]
};
