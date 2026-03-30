<template>
  <v-card class="pa-4" max-width="500">
    <v-card-title>Document Scanner</v-card-title>

    <v-card-text>
      <video ref="video" autoplay playsinline class="video" />

      <canvas ref="canvas" class="d-none" />
      <canvas ref="outputCanvas" class="output mt-4" />
    </v-card-text>

    <v-card-actions class="d-flex justify-space-between">
      <v-btn color="primary" @click="toggleCamera">
        <v-icon left>{{ stream ? 'mdi-camera-off' : 'mdi-camera' }}</v-icon>
        {{ stream ? 'Stop' : 'Start' }}
      </v-btn>

      <v-btn color="success" :disabled="!stream" @click="capture">
        <v-icon left>mdi-scan-helper</v-icon>
        Scan
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useOpenCV } from '~/composables/useOpenCV'
import { detectDocumentContour, warpDocument } from '~/utils/cvHelpers'

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const outputCanvas = ref<HTMLCanvasElement | null>(null)

let stream: MediaStream | null = null
let cv: any = null

const startCamera = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' }
  })
  if (video.value) video.value.srcObject = stream

  if (!cv) cv = await useOpenCV()
}

const stopCamera = () => {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
  if (video.value) video.value.srcObject = null
  stream = null
}

const toggleCamera = async () => {
  if (stream) stopCamera()
  else await startCamera()
}

// ⚡ 只在按下 Scan 才運算
const capture = async () => {
  if (!video.value || !canvas.value || !cv) return

  const ctx = canvas.value.getContext('2d')!

  // 縮小解析度處理，減少卡頓
  const w = video.value.videoWidth / 2
  const h = video.value.videoHeight / 2
  canvas.value.width = w
  canvas.value.height = h

  ctx.drawImage(video.value, 0, 0, w, h)

  const src = cv.imread(canvas.value)
  const contour = detectDocumentContour(cv, src)

  if (!contour) {
    alert('找不到文件')
    src.delete()
    return
  }

  const points = contour.data32S
  const warped = warpDocument(cv, src, points, 500, 700)
  cv.imshow(outputCanvas.value, warped)

  src.delete()
  warped.delete()
  contour.delete()
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.video {
  width: 100%;
  border-radius: 12px;
}

.output {
  width: 100%;
}
</style>
