<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import type { GanttTask } from '~/types/gantt'

type Status = GanttTask['status']

const props = defineProps<{
  title?: string
  tasks?: GanttTask[]
  count?: number
  users?: string[]
}>()

const emit = defineEmits<{ (e: 'ready', tasks: GanttTask[]): void }>()

const COUNT = props.count ?? 20
const USERS = props.users ?? ['Tom', 'Jerry', 'Alice', 'Bob']
const STATUSES: Status[] = ['not-started', 'in-progress', 'completed', 'testing', 'on-hold']

/** 顏色 */
const COLORS: Record<Status, string> = {
  'not-started': '#9aa4b2',
  'in-progress': '#2f6feb',
  'completed': '#22c55e',
  'testing': '#f59e0b',
  'on-hold': '#a855f7',
}

/** 今天 ±10 天 */
const today = new Date()
today.setHours(0, 0, 0, 0)
const rangeStart = new Date(today); rangeStart.setDate(today.getDate() - 10)
const rangeEnd = new Date(today); rangeEnd.setDate(today.getDate() + 10)

/** 假資料 */
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

const progressByStatus = (s: Status) => {
  switch (s) {
    case 'completed': return 100
    case 'not-started': return 0
    case 'on-hold': return Math.floor(Math.random() * 30)
    case 'testing': return 70 + Math.floor(Math.random() * 25)
    case 'in-progress': default: return 10 + Math.floor(Math.random() * 80)
  }
}

const createFakeTasks = (n = COUNT): GanttTask[] =>
  Array.from({ length: n }).map((_, i) => {
    const s = randomDate(rangeStart, rangeEnd)
    const e = new Date(s); e.setDate(s.getDate() + 1 + Math.floor(Math.random() * 10))
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)] ?? 'not-started'
    return {
      id: i + 1,
      user: USERS[Math.floor(Math.random() * USERS.length)] ?? 'Tom',
      task: `Task ${i + 1}`,
      status,
      start: s,
      end: e,
      progress: progressByStatus(status),
    }
  })

/** 要 render 的任務 */
const renderTasks = ref<GanttTask[]>([])
watchEffect(() => {
  renderTasks.value = props.tasks?.length ? props.tasks : createFakeTasks()
  emit('ready', renderTasks.value)
})

/** 計算日期軸 */
const days = () => {
  const out: Date[] = []
  const d = new Date(rangeStart)
  for (let i = 0; i < 21; i++) {
    out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}
const dlist = days()

// 尺寸
const marginLeft = 140
const headerH = 24
const rowH = 28
const colW = 80 // 每一天寬度
</script>

<template>
  <div class="chart-gantt-svg">
    <header>
      <h2 v-if="props.title">{{ props.title }}</h2>
    </header>

    <svg
      class="gantt-svg"
      :width="marginLeft + dlist.length * colW"
      :height="headerH + renderTasks.length * rowH"
    >
      <!-- 背景 -->
      <rect
        x="0"
        y="0"
        :width="marginLeft + dlist.length * colW"
        :height="headerH + renderTasks.length * rowH"
        fill="white"
      />

      <!-- 日期標頭 -->
      <g v-for="(d, i) in dlist" :key="i">
        <text
          :x="marginLeft + i * colW + 4"
          :y="headerH / 2 + 4"
          font-size="12"
          :fill="d.toDateString() === today.toDateString() ? '#0070f3' : '#666'"
        >
          {{ d.getMonth() + 1 }}/{{ d.getDate() }}
        </text>
        <line
          :x1="marginLeft + i * colW"
          y1="0"
          :x2="marginLeft + i * colW"
          :y2="headerH + renderTasks.length * rowH"
          stroke="#ddd"
        />
      </g>

      <!-- 任務列 -->
      <g v-for="(t, idx) in renderTasks" :key="t.id">
        <text
          x="4"
          :y="headerH + idx * rowH + rowH / 2 + 4"
          font-size="12"
          fill="#333"
        >
          {{ t.task }} ({{ t.user }})
        </text>

        <!-- bar -->
        <rect
          :x="marginLeft + Math.max(0, Math.floor((t.start.getTime() - rangeStart.getTime()) / 86400000)) * colW"
          :y="headerH + idx * rowH + 6"
          :width="Math.max(4, (Math.ceil((t.end.getTime() - rangeStart.getTime()) / 86400000) -
                               Math.max(0, Math.floor((t.start.getTime() - rangeStart.getTime()) / 86400000))) * colW)"
          :height="rowH - 12"
          :fill="COLORS[t.status]"
          rx="4"
        />

        <!-- progress text -->
        <text
          :x="marginLeft + Math.max(0, Math.floor((t.start.getTime() - rangeStart.getTime()) / 86400000)) * colW + 10"
          :y="headerH + idx * rowH + rowH / 2 + 4"
          font-size="12"
          fill="white"
        >
          {{ t.progress }}%
        </text>
      </g>
    </svg>

    <footer>共 {{ renderTasks.length }} 筆</footer>
  </div>
</template>

<style scoped>
.chart-gantt-svg {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.gantt-svg {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  overflow: auto;
}
</style>
