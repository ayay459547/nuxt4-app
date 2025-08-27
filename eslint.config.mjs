// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // 你的自訂規則
  rules: {
    // 關閉 multi-word component name 警告
    'vue/multi-word-component-names': 'off',
  }
  // 如果需要，也可以覆蓋 parserOptions、env、plugins 等
})
