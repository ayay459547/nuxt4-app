<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const { initGanttData } = useUtils()
const { ganttData } = initGanttData(30)
console.log(ganttData)

const ganttContainer = ref<HTMLElement | null>(null)
const width = ref(0)
const height = ref(0)

// ResizeObserver
let resizeObserver: ResizeObserver | null = null

const handleResize = () => {
  if (!ganttContainer.value) return
  const rect = ganttContainer.value.getBoundingClientRect()
  width.value = rect.width
  height.value = rect.height

  // 重新渲染或重算甘特圖
  console.log('容器尺寸改變', width.value, height.value)
  // 這裡可以呼叫繪製函數，例如 drawGanttChart()
}

onMounted(() => {
  nextTick(() => {
    if (!ganttContainer.value) return

    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(ganttContainer.value)

    // 初始化渲染
    handleResize()
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div ref="ganttContainer" class="gantt-wrapper">
    <!-- 你的甘特圖內容 -->
    <ChartGantt :tasks="ganttData" title="Demo" />
  </div>
</template>

<style scoped lang="scss">
.gantt-wrapper {
  width: 100%;
  height: 100%;
  min-height: fit-content;
}
</style>
