module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    plugins: ['prettier'],
    rules: {
        'prettier/prettier': 'warn',
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 13,
    },
}
