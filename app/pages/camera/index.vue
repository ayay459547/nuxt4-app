<script setup lang="ts">
import Scanner from '~/components/Scanner.vue';

</script>

<template>
  <div>
    <h1>Document Scanner</h1>

    <ClientOnly>
      <Scanner />
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>

</style>