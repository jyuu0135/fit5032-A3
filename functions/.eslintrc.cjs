// functions/.eslintrc.cjs
module.exports = {
  root: true,
  env: {
    node: true, // 告訴 ESLint 這是 Node 環境
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script', // 以 CommonJS（require/exports）檢查
  },
  extends: ['eslint:recommended'],
  rules: {
    // 你可以保留預設 no-undef；只要 env 設對就不會誤報
    // 若仍要保守些，也可在這裡關掉
    // 'no-undef': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules/**', 'lib/**'],
}
