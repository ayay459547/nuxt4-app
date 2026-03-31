/**
 * Open CV
 */
// import type { CV } from '@techstark/opencv-js'
import cvModule from '@techstark/opencv-js'

export async function getOpenCv() {
  let cv
  if (cvModule instanceof Promise) {
    cv = await cvModule
  } else {
    if (cvModule.Mat) {
      cv = cvModule
      await new Promise((resolve) => {
        cvModule.onRuntimeInitialized = () => resolve('')
      })
    } else {
      await new Promise((resolve) => {
        cvModule.onRuntimeInitialized = () => resolve('')
      })
      cv = cvModule
    }
  }
  return { cv }
}

export const useOpenCV = async () => {
  if (import.meta.server) return null
  const { cv } = await getOpenCv()
  return cv
}
