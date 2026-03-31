import type { CV } from '@techstark/opencv-js'

export const detectDocumentContour = (cv: CV, src: any) => {
  const gray = new cv.Mat()
  const edges = new cv.Mat()
  const contours = new cv.MatVector()
  const hierarchy = new cv.Mat()

  // 灰階 + 模糊
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)
  cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0)
  cv.Canny(gray, edges, 75, 200)

  cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE)

  let maxArea = 0
  let bestContour: any = null

  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i)
    const area = cv.contourArea(cnt)

    if (area > maxArea) {
      const peri = cv.arcLength(cnt, true)
      const approx = new cv.Mat()
      cv.approxPolyDP(cnt, approx, 0.02 * peri, true)

      if (approx.rows === 4) {
        maxArea = area
        bestContour = approx
      }
    }
  }

  gray.delete()
  edges.delete()
  contours.delete()
  hierarchy.delete()

  return bestContour
}

export const warpDocument = (cv: any, src: any, points: number[], width = 500, height = 700) => {
  const dst = new cv.Mat()

  const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, points)
  const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, width, 0, width, height, 0, height])

  const M = cv.getPerspectiveTransform(srcTri, dstTri)
  cv.warpPerspective(src, dst, M, new cv.Size(width, height))

  srcTri.delete()
  dstTri.delete()
  M.delete()

  return dst
}
