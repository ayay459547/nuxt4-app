// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // 你的自訂規則
  rules: {
    // 關閉 multi-word component name 警告
    'vue/multi-word-component-names': 'off',
    // 允許 any
    '@typescript-eslint/no-explicit-any': 'off',
    // 單引號
    'quotes': ['error', 'single'],
  }
  // 如果需要，也可以覆蓋 parserOptions、env、plugins 等
})
