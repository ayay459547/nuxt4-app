<script setup lang="ts">
const title = '我是 Kanban 元件'

</script>

<template>
  <div class="kanban">
    <h2>{{ title }}</h2>
  </div>
</template>

<style scoped lang="scss">
.kanban {
  padding: 1rem;
  background: #f5f5f5;
  border: 1px solid #ddd;

  h2 {
    color: #0070f3;
  }
}
</style>
