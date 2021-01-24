module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:node/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
		'plugin:security/recommended',
		'plugin:sonarjs/recommended',
	],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'prettier', 'import', 'sonarjs'],
	rules: {
		'node/exports-style': ['error', 'module.exports'],
		'node/file-extension-in-import': ['off', 'never'],
		'node/prefer-global/buffer': ['error', 'always'],
		'node/prefer-global/console': ['error', 'always'],
		'node/prefer-global/process': ['error', 'always'],
		'node/prefer-global/url-search-params': ['error', 'always'],
		'node/prefer-global/url': ['error', 'always'],
		'node/prefer-promises/dns': 'error',
		'node/prefer-promises/fs': 'error',
		'max-classes-per-file': ['off', 1],
		'node/no-missing-import': ['off', 1],
		'linebreak-style': ['off', 'unix'],
		'no-restricted-syntax': [
			'error',
			{
				selector: 'TSEnumDeclaration',
				message: "Don't declare enums",
			},
		],
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'no-tabs': 0,
		semi: [2, 'always'],
		'comma-dangle': ['error', 'always-mulitline'],
		'operator-linebreak': ['off', 1],
		'max-len': ['error', { code: 100 }],
		'node/no-unsupported-features/es-syntax': 'off',
	},
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			// use <root>/tsconfig.json
			typescript: {},
		},
	},
};
