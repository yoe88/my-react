const pluginSortImports = require("@trivago/prettier-plugin-sort-imports");
const pluginTailwindcss = require("prettier-plugin-tailwindcss");

/** @type {import("prettier").Parser}  */
const bothParser = {
  ...pluginSortImports.parsers.typescript,
  parse: pluginTailwindcss.parsers.typescript.parse,
};

const mixedPlugin = {
  parsers: {
    typescript: bothParser,
  },
};

module.exports = {
  plugins: [mixedPlugin],

  printWidth: 180,
  importOrderSortSpecifiers: true,
};
