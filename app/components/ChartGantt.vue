<script setup lang="ts">
// 這裡可以寫 TypeScript
const title: string = "我是 ChartGantt 元件";
</script>

<template>
  <div class="chart-gantt">
    <h2>{{ title }}</h2>
    <p>這裡之後可以放甘特圖的邏輯</p>
  </div>
</template>

<style scoped lang="scss">
.chart-gantt {
  padding: 1rem;
  background: #f5f5f5;
  border: 1px solid #ddd;

  h2 {
    color: #0070f3;
  }
}
</style>
