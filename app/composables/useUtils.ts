import type { Ref } from 'vue'
import { ref } from 'vue'
import type { GanttTask } from '~/types/gantt'

export const useUtils = () => {
  /**
   * 檢查值是否為空
   * @author Caleb
   * @param {*} value - 檢查的值
   * @returns {boolean} - 如果值為 null、undefined、空字串、空陣列、空物件、空 Set 或空 Map，則返回 true，否則返回 false
   */
  const isEmpty = <T>(
    value: T | null | undefined
  ): value is null | undefined => {
    if (value === null || value === undefined) return true

    const valueType = Object.prototype.toString.call(value)

    switch (valueType) {
      case "[object Array]":
        return (value as unknown[]).length === 0
      case "[object String]":
        return (value as string).length === 0
      case "[object Object]":
        return Object.keys(value as object).length === 0
      case "[object Set]":
        return (value as unknown as Set<unknown>).size === 0
      case "[object Map]":
        return (value as unknown as Map<unknown, unknown>).size === 0
      default:
        return false
    }
  }

  /**
   * 產生甘特圖任務資料
   * @author Caleb
   * @param {number} count - 產生的任務數量
   * @returns ganttData - 甘特圖任務資料
   *          createGanttData - 重新產生任務資料的函數
   * @description 產生甘特圖任務資料
   */
  const initGanttData = (count: number = 100): {
    ganttData: Ref<GanttTask[]>
    createGanttData: () => void
  } => {
    const ganttData = ref<GanttTask[]>([])

    const users = ['Tom', 'Jerry', 'Alice', 'Bob', 'Eve', 'Grace', 'Mallory']
    const statuses: GanttTask['status'][] = [
      'not-started',
      'in-progress',
      'completed',
      'testing',
      'on-hold',
    ]

    // 隨機時間函數
    const randomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    const createGanttData = () => {
      ganttData.value.splice(0, ganttData.value.length) // 清空陣列

      // 今天
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 前後 10 天
      const rangeStart = new Date(today)
      rangeStart.setDate(today.getDate() - 10)

      const rangeEnd = new Date(today)
      rangeEnd.setDate(today.getDate() + 10)

      Array.from({ length: count }).forEach((_, index) => {
        const taskStart = randomDate(rangeStart, rangeEnd)
        const taskEnd = new Date(taskStart)
        taskEnd.setDate(taskStart.getDate() + Math.floor(Math.random() * 10) + 1) // 任務長度 1~10 天

        ganttData.value.push({
          id: index + 1,
          user: users[Math.floor(Math.random() * users.length)] ?? 'Tom',
          task: `Task ${index + 1}`,
          status: statuses[Math.floor(Math.random() * statuses.length)] ?? 'not-started',
          start: taskStart,
          end: taskEnd,
          progress: Math.floor(Math.random() * 101), // 0~100
        })
      })
    }
    createGanttData()

    return { ganttData, createGanttData }
  }


  return { isEmpty, initGanttData }
}