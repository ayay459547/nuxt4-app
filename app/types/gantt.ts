export interface GanttTask {
  id: number
  user: string
  task: string
  status: 'not-started' | 'in-progress' | 'completed' | 'testing' | 'on-hold'
  start: Date
  end: Date
  progress: number
}