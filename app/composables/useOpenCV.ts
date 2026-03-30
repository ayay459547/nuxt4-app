/**
 * Open CV
 */

let cvPromise: Promise<any> | null = null

export const useOpenCV = () => {
  if (import.meta.server) return null

  if (cvPromise) return cvPromise

  cvPromise = new Promise((resolve) => {
    const existing = (window as any).cv
    if (existing) {
      resolve(existing)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://docs.opencv.org/4.x/opencv.js'
    script.async = true

    script.onload = () => {
      ;(window as any).cv['onRuntimeInitialized'] = () => {
        resolve((window as any).cv)
      }
    }

    document.body.appendChild(script)
  })

  return cvPromise
}
