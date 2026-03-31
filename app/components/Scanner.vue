<script setup lang="ts">
import type { CV } from '@techstark/opencv-js'
import { onUnmounted, ref } from 'vue'
import { useOpenCV } from '~/composables/useOpenCV'
import { detectDocumentContour, warpDocument } from '~/utils/cvHelpers'

const messages = ref<any[]>([])
const addMessage = (text: string, color: string = 'error') => {
  messages.value.push({
    text,
    color,
    onDismiss() {}
  })
}

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const outputCanvas = ref<HTMLCanvasElement | null>(null)

const stream = ref<MediaStream | null>(null)
let cv: CV | null = null

const initOpenCV = async () => {
  if (cv === null) {
    cv = await useOpenCV()
  }
  console.log(' init open CV ', cv)
}

const startCamera = async () => {
  try {
    await initOpenCV()
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    if (video.value) video.value.srcObject = stream.value
  } catch (error) {
    console.error('Error accessing camera:', error)
    addMessage('無法存取相機，請確認權限設定。')
  }
}

const stopCamera = () => {
  if (!stream.value) return
  stream.value.getTracks().forEach((track) => track.stop())
  if (video.value) video.value.srcObject = null
  stream.value = null
}

const toggleCamera = async () => {
  if (stream.value) stopCamera()
  else await startCamera()
}

// ⚡ 只在按下 Scan 才運算
const capture = async () => {
  if (!video.value || !canvas.value || !cv) {
    addMessage('掃描失敗')
    return
  }

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
    addMessage('找不到文件邊緣，請將文件對齊於背景並保持光線明亮。')
    src.delete()
    return
  }
  addMessage('掃描成功', 'success')

  const points = contour.data32S
  const warped = warpDocument(cv, src, points, 500, 700)
  if (outputCanvas.value) {
    cv.imshow(outputCanvas.value, warped)
  }

  // 釋放記憶體
  src.delete()
  warped.delete()
  contour.delete()
}

onUnmounted(() => {
  stopCamera()
})
</script>

<template>
  <v-container>
    <v-card class="pa-4 mx-auto" max-width="1000">
      <v-card-title class="text-center text-h5 mb-4"> Document Scanner </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6" class="d-flex flex-column align-center">
            <div class="text-subtitle-1 mb-2 font-weight-bold">Camera View</div>
            <video ref="video" autoplay playsinline class="video elevation-2" />
          </v-col>

          <v-col cols="12" md="6" class="d-flex flex-column align-center">
            <div class="text-subtitle-1 mb-2 font-weight-bold">Scanned Result</div>

            <canvas ref="canvas" class="d-none" />

            <canvas ref="outputCanvas" class="output elevation-2" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider class="my-4" />

      <v-card-actions class="ffy-center ga-4">
        <v-btn variant="outlined" :color="stream ? 'error' : 'primary'" @click="toggleCamera">
          <v-icon left class="mr-2">{{ stream ? 'mdi-camera-off' : 'mdi-camera' }}</v-icon>
          {{ stream ? 'Stop Camera' : 'Start Camera' }}
        </v-btn>

        <v-btn variant="outlined" color="success" :disabled="!stream" @click="capture">
          <v-icon left class="mr-2">mdi-scan-helper</v-icon>
          Scan Document
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar-queue v-model="messages" :total-visible="5" closable />
  </v-container>
</template>

<style scoped>
.video,
.output {
  width: 100%;
  max-width: 450px; /* 限制單邊最大寬度，避免在大螢幕上過度放大 */
  aspect-ratio: 3/4; /* 保持一致的視覺比例 */
  object-fit: cover;
  border-radius: 12px;
  background-color: #f5f5f5; /* 未啟動相機時的佔位底色 */
}
</style>
