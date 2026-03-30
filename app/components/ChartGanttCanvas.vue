<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import type { GanttTask } from '~/types/gantt'

type Status = GanttTask['status']

const props = defineProps<{
  title?: string
  tasks?: GanttTask[]
  count?: number
  fixed21Days?: boolean
  users?: string[]
}>()

const emit = defineEmits<{ (e: 'ready', tasks: GanttTask[]): void }>()

const COUNT = props.count ?? 100
const USERS = props.users ?? ['Tom', 'Jerry', 'Alice', 'Bob', 'Eve', 'Grace', 'Mallory']
const STATUSES: Status[] = ['not-started', 'in-progress', 'completed', 'testing', 'on-hold']

/** 顏色 */
const COLORS: Record<Status, string> = {
  'not-started': '#9aa4b2',
  'in-progress': '#2f6feb',
  completed: '#22c55e',
  testing: '#f59e0b',
  'on-hold': '#a855f7'
}

const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null

/** 今天 ±10 天 */
const today = new Date()
today.setHours(0, 0, 0, 0)
const rangeStart = new Date(today)
rangeStart.setDate(today.getDate() - 10)
const rangeEnd = new Date(today)
rangeEnd.setDate(today.getDate() + 10)

/** 假資料產生 */
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const progressByStatus = (s: Status) => {
  switch (s) {
    case 'completed':
      return 100
    case 'not-started':
      return 0
    case 'on-hold':
      return Math.floor(Math.random() * 30)
    case 'testing':
      return 70 + Math.floor(Math.random() * 25)
    case 'in-progress':
    default:
      return 10 + Math.floor(Math.random() * 80)
  }
}

const createFakeTasks = (n = COUNT): GanttTask[] =>
  Array.from({ length: n }).map((_, i) => {
    const s = randomDate(rangeStart, rangeEnd)
    const e = new Date(s)
    e.setDate(s.getDate() + 1 + Math.floor(Math.random() * 10))
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)] ?? 'not-started'
    return {
      id: i + 1,
      user: USERS[Math.floor(Math.random() * USERS.length)] ?? 'Tom',
      task: `Task ${i + 1}`,
      status,
      start: s,
      end: e,
      progress: progressByStatus(status)
    }
  })

const renderTasks = ref<GanttTask[]>([])

watchEffect(() => {
  renderTasks.value = props.tasks?.length ? props.tasks : createFakeTasks()
  emit('ready', renderTasks.value)
  draw()
})

/** 計算時間軸 */
const days = () => {
  const out: Date[] = []
  const d = new Date(rangeStart)
  for (let i = 0; i < 21; i++) {
    out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

/** 畫圖 */
function draw() {
  if (!ctx || !canvasRef.value) return

  const cvs = canvasRef.value
  const W = cvs.clientWidth
  const H = cvs.clientHeight
  cvs.width = W
  cvs.height = H

  // 🔹 填滿白色背景
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, W, H)

  // 🔹 清空畫布
  ctx.clearRect(0, 0, W, H)
  ctx.font = '12px sans-serif'
  ctx.textBaseline = 'middle'

  const marginLeft = 120
  const headerH = 24
  const rowH = 28
  const dlist = days()
  const colW = (W - marginLeft) / dlist.length

  // 畫日期標頭
  dlist.forEach((d, i) => {
    if (ctx === null) return

    const x = marginLeft + i * colW
    ctx.fillStyle = d.toDateString() === today.toDateString() ? '#0070f3' : '#666'
    ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x + 4, headerH / 2)
    ctx.strokeStyle = '#ddd'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  })

  // 任務列
  renderTasks.value.forEach((t, idx) => {
    if (ctx === null) return

    const y = headerH + idx * rowH
    // 任務名
    ctx.fillStyle = '#333'
    ctx.fillText(`${t.task} (${t.user})`, 4, y + rowH / 2)

    // bar
    const startIdx = Math.max(0, Math.floor((t.start.getTime() - rangeStart.getTime()) / 86400000))
    const endIdx = Math.min(
      dlist.length,
      Math.ceil((t.end.getTime() - rangeStart.getTime()) / 86400000)
    )
    const x1 = marginLeft + startIdx * colW
    const x2 = marginLeft + endIdx * colW
    const barW = Math.max(4, x2 - x1)

    ctx.fillStyle = COLORS[t.status]
    ctx.fillRect(x1, y + 6, barW, rowH - 12)

    // 進度
    ctx.fillStyle = '#fff'
    ctx.fillText(`${t.progress}%`, x1 + barW / 2 - 10, y + rowH / 2)
  })
}

/** resize 重新繪製 */
let resizeObs: ResizeObserver
onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeObs = new ResizeObserver(draw)
    resizeObs.observe(canvasRef.value)
  }
  draw()
})
onBeforeUnmount(() => {
  resizeObs?.disconnect()
})
</script>

<template>
  <div class="chart-gantt-canvas">
    <header>
      <h2 v-if="props.title">{{ props.title }}</h2>
    </header>
    <canvas ref="canvasRef" class="gantt-canvas" />
    <footer>共 {{ renderTasks.length }} 筆</footer>
  </div>
</template>

<style scoped>
.chart-gantt-canvas {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.gantt-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
