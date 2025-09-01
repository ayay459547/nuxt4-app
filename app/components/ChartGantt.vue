<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import type { GanttTask } from '~/types/gantt'

type Status = GanttTask['status']

const props = defineProps<{
  /** 標題 */
  title?: string
  /** 外部傳入的任務清單；不傳則自動產生假資料 */
  tasks?: GanttTask[]
  /** 自動產生的筆數（當 tasks 未提供時） */
  count?: number
  /** 是否使用今天±10天作為時間軸（預設 true） */
  fixed21Days?: boolean
  /** 自動產生資料時，顯示的使用者池 */
  users?: string[]
}>()

const emit = defineEmits<{
  (e: 'ready', tasks: GanttTask[]): void
}>()

const COUNT = props.count ?? 100
const USERS = props.users ?? ['Tom', 'Jerry', 'Alice', 'Bob', 'Eve', 'Grace', 'Mallory']
const STATUSES: Status[] = ['not-started', 'in-progress', 'completed', 'testing', 'on-hold']

/** 產生隨機日期（含首尾） */
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

/** 今天 ±10 天 */
const today = new Date()
today.setHours(0, 0, 0, 0)
const rangeStart = new Date(today); rangeStart.setDate(today.getDate() - 10)
const rangeEnd   = new Date(today); rangeEnd.setDate(today.getDate() + 10)

/** 依狀態給合理進度 */
const progressByStatus = (s: Status) => {
  switch (s) {
    case 'completed': return 100
    case 'not-started': return 0
    case 'on-hold': return Math.floor(Math.random() * 30)      // 0~29
    case 'testing': return 70 + Math.floor(Math.random() * 25) // 70~94
    case 'in-progress':
    default: return 10 + Math.floor(Math.random() * 80)        // 10~89
  }
}

/** 自動建立假資料（start/end 在今天±10天，end 一定在 start 之後 1~10 天內） */
const createFakeTasks = (n = COUNT): GanttTask[] => {
  const list: GanttTask[] = []
  for (let i = 0; i < n; i++) {
    const s = randomDate(rangeStart, rangeEnd)
    const e = new Date(s)
    e.setDate(s.getDate() + (1 + Math.floor(Math.random() * 10))) // 1~10 天
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)] ?? 'not-started'
    list.push({
      id: i + 1,
      user: USERS[Math.floor(Math.random() * USERS.length)] ?? 'Tom',
      task: `Task ${i + 1}`,
      status,
      start: s,
      end: e,
      progress: progressByStatus(status),
    })
  }
  return list
}

/** 最終要顯示的資料 */
const data = ref<GanttTask[]>([])

watchEffect(() => {
  data.value = (props.tasks?.length ? props.tasks : createFakeTasks()).map(t => ({
    ...t,
    // 保險：確保 start <= end
    start: t.start <= t.end ? t.start : t.end,
    end: t.end >= t.start ? t.end : t.start,
  }))
  emit('ready', data.value)
})

/** 時間軸（預設固定 21 天：今天±10） */
const days = computed(() => {
  const out: Date[] = []
  if (props.fixed21Days !== false) {
    const d = new Date(rangeStart)
    for (let i = 0; i < 21; i++) {
      out.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return out
  }
  // 若不固定 21 天，就以資料最小/最大日期為軸（保留 1 天緩衝）
  const min = new Date(Math.min(...data.value.map(t => t.start.getTime())))
  const max = new Date(Math.max(...data.value.map(t => t.end.getTime())))
  min.setDate(min.getDate() - 1)
  max.setDate(max.getDate() + 1)

  const cursor = new Date(min)
  while (cursor <= max) {
    out.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
})

/** 區間長度（毫秒） */
const spanMs = computed(() => {
  const start = days.value[0]?.getTime() ?? rangeStart.getTime()
  const end = (days.value.at(-1)?.getTime() ?? rangeEnd.getTime()) + 24 * 60 * 60 * 1000 // 包含最後一天
  return Math.max(1, end - start)
})

/** 將任務轉成樣式（left/width 百分比） */
const toBarStyle = (t: GanttTask) => {
  const startBase = days.value[0]?.getTime() ?? rangeStart.getTime()
  const s = Math.max(t.start.getTime(), startBase)
  const e = Math.max(s + 1, t.end.getTime()) // 至少 1ms，避免 0 寬
  const left = ((s - startBase) / spanMs.value) * 100
  const width = ((e - s) / spanMs.value) * 100
  return { left: `${left}%`, width: `${width}%` }
}

/** 狀態 -> 顏色 class（也可以改為 CSS 變數） */
const statusClass = (s: Status) => ({
  'not-started': 'bg-slate',
  'in-progress': 'bg-blue',
  'completed': 'bg-green',
  'testing': 'bg-orange',
  'on-hold': 'bg-purple',
}[s] || 'bg-slate')

</script>

<template>
  <div class="chart-gantt-canvas">
    <header class="header">
      <h2 v-if="props.title">{{ props.title }}</h2>
      <div class="legend">
        <span class="dot bg-slate"/> Not Started
        <span class="dot bg-blue"/> In Progress
        <span class="dot bg-green"/> Completed
        <span class="dot bg-orange"/> Testing
        <span class="dot bg-purple"/> On Hold
      </div>
    </header>

    <div class="gantt">
      <!-- 左側任務清單 -->
      <div class="side">
        <div class="side-head">任務 / 負責人</div>
        <div v-for="t in data" :key="t.id" class="side-row" :title="t.user">
          <div class="task-name">
            <strong>{{ t.task }}</strong>
            <small>（{{ t.user }}）</small>
          </div>
        </div>
      </div>

      <!-- 右側時間軸 + bar -->
      <div class="grid">
        <!-- 時間軸 -->
        <div class="grid-head">
          <div
            v-for="d in days"
            :key="d.toISOString()"
            class="col-head"
            :class="{ today: d.toDateString() === new Date().toDateString() }"
          >
            {{ d.getMonth() + 1 }}/{{ d.getDate() }}
          </div>
        </div>

        <!-- 任務列 -->
        <div class="grid-body">
          <div v-for="t in data" :key="t.id" class="row">
            <!-- 背景格線 -->
            <div class="row-grid">
              <div v-for="d in days" :key="d.toISOString()" class="cell"/>
            </div>

            <!-- 任務 bar -->
            <div
              class="bar"
              :class="statusClass(t.status)"
              :style="toBarStyle(t)"
              :title="`${t.task}（${t.user}）\n${t.start.toLocaleDateString()} - ${t.end.toLocaleDateString()}\n${t.progress}%`"
            >
              <span class="bar-label">
                {{ t.progress }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 若需要：顯示總筆數 -->
    <footer class="footer">
      共 {{ data.length }} 筆
    </footer>
  </div>
</template>

<style scoped lang="scss">
.chart-gantt-canvas {
  --border: #e5e7eb;
  --text: #333;
  --muted: #667085;
  --today: #0070f3;

  // 狀態色（你可自由調整）
  --slate: #9aa4b2;
  --blue: #2f6feb;
  --green: #22c55e;
  --orange: #f59e0b;
  --purple: #a855f7;

  padding: 1rem;
  background: #fafafa;
  border: 1px solid var(--border);
  border-radius: 12px;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: .75rem;
    margin-bottom: .75rem;

    h2 {
      margin: 0;
      color: #0070f3;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .legend {
      display: flex;
      gap: .75rem;
      align-items: center;
      color: var(--muted);
      font-size: .85rem;

      .dot {
        display: inline-block;
        width: .65rem;
        height: .65rem;
        border-radius: 50%;
        margin-right: .35rem;
      }
      .bg-slate { background: var(--slate); }
      .bg-blue { background: var(--blue); }
      .bg-green { background: var(--green); }
      .bg-orange { background: var(--orange); }
      .bg-purple { background: var(--purple); }
    }
  }

  .gantt {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: .5rem;

    .side {
      border-right: 1px solid var(--border);

      .side-head {
        height: 36px;
        display: flex;
        align-items: center;
        padding: 0 .5rem;
        font-weight: 600;
        color: var(--muted);
        border-bottom: 1px solid var(--border);
        background: #fff;
        border-radius: 8px 0 0 0;
      }

      .side-row {
        height: 32px;
        display: flex;
        align-items: center;
        padding: 0 .5rem;
        border-bottom: 1px dashed var(--border);
        .task-name {
          display: flex;
          gap: .35rem;
          align-items: baseline;
          strong { color: var(--text); font-weight: 600; }
          small { color: var(--muted); }
        }
      }
    }

    .grid {
      overflow: auto;

      .grid-head {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(64px, 1fr);
        height: 36px;
        align-items: center;
        background: #fff;
        border-bottom: 1px solid var(--border);
        border-radius: 0 8px 0 0;

        .col-head {
          font-size: .85rem;
          color: var(--muted);
          text-align: center;
          &.today {
            color: var(--today);
            font-weight: 700;
          }
        }
      }

      .grid-body {
        position: relative;

        .row {
          position: relative;
          height: 32px;
        }

        .row + .row .row-grid { border-top: none; }

        .row-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(64px, 1fr);
          background: #fff;

          .cell {
            border-bottom: 1px dashed var(--border);
            border-right: 1px dashed var(--border);
          }
          .cell:last-child { border-right: none; }
        }

        .bar {
          position: absolute;
          top: 6px;
          height: 20px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 .5rem;
          color: #fff;
          font-size: .75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: 0 2px 6px rgba(0,0,0,.08);

          &.bg-slate { background: var(--slate); }
          &.bg-blue { background: var(--blue); }
          &.bg-green { background: var(--green); }
          &.bg-orange { background: var(--orange); }
          &.bg-purple { background: var(--purple); }
        }
      }
    }
  }

  .footer {
    margin-top: .75rem;
    font-size: .85rem;
    color: var(--muted);
  }
}
</style>
