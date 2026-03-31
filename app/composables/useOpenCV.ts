/**
 * Open CV
 */
// import type { CV } from '@techstark/opencv-js'
// import cvModule from '@techstark/opencv-js'

let cvPromise: Promise<boolean> | null = null
export const getOpenCV = async () => {
  if (cvPromise) return cvPromise

  cvPromise = new Promise((resolve) => {
    const existing = (window as any).cv
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.x/opencv.js'
    script.async = true
    script.defer = true // 確保不阻塞 HTML 解析

    script.onload = () => {
      ;(window as any).cv['onRuntimeInitialized'] = () => {
        resolve(true)
      }
    }

    script.onerror = () => {
      console.error('Failed to load OpenCV.js')
      cvPromise = null // 失敗的話清空，允許下次重試
      resolve(false)
    }

    document.body.appendChild(script)
  })

  return cvPromise
}

export const useOpenCV = async () => {
  if (import.meta.server) return null
  const cv = await getOpenCV()
  return cv
}
