import globals from 'globals';
import pluginJs from '@eslint/js';
import tsESlint from 'typescript-eslint';


export default [
  {
    files: [
      'src/api/**/*.{js,mjs,cjs,ts}',
      'src/extensions/**/*.{js,mjs,cjs,ts}',
      'config/**/*.{js,mjs,cjs,ts}',
    ],
  },
  {
    languageOptions: { globals: globals.node }
  },
  pluginJs.configs.recommended,
  ...tsESlint.configs.recommended,
];
