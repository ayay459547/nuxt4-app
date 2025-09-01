<script setup lang="ts">
import ChartGanttCanvas from '~/components/ChartGanttCanvas.vue'

const { initGanttData } = useUtils()
const { ganttData } = initGanttData(50)
console.log(ganttData)

</script>

<template>
  <div ref="ganttContainer" class="gantt-wrapper">
    <ChartGanttCanvas :tasks="ganttData" title="Canvas" />
  </div>
</template>

<style scoped lang="scss">
.gantt-wrapper {
  width: 100%;
  height: 100%;
  min-height: fit-content;
}
</style>
