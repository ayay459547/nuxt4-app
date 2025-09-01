<script setup lang="ts">
import ChartGanttSvg from '~/components/ChartGanttSvg.vue'

const { initGanttData } = useUtils()
const { ganttData } = initGanttData(50)
console.log(ganttData)

</script>

<template>
  <div ref="ganttContainer" class="gantt-wrapper">
    <ChartGanttSvg :tasks="ganttData" title="Svg" />
  </div>
</template>

<style scoped lang="scss">
.gantt-wrapper {
  width: 100%;
  height: 100%;
  min-height: fit-content;
}
</style>
