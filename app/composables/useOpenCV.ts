/**
 * Open CV
 */
import cvModule from '@techstark/opencv-js'

export async function getOpenCV() {
  let cv
  if (cvModule instanceof Promise) {
    cv = await cvModule
  } else {
    await new Promise((resolve) => {
      cvModule.onRuntimeInitialized = () => resolve(true)
    })
    cv = cvModule
  }
  return { cv }
}

let cvPromise: Promise<any> | null = null

export const getOpenCVFormScript = async () => {
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

    script.onload = () => {
      ;(window as any).cv['onRuntimeInitialized'] = () => {
        resolve(true)
      }
    }

    script.onerror = () => {
      resolve(false)
    }

    document.body.appendChild(script)
  })

  return cvPromise
}

export const useOpenCV = async () => {
  if (import.meta.server) return null
  const { cv } = await getOpenCV()
  return cv
}
