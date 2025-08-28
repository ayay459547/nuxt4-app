<script lang="ts" setup>
import { ref } from 'vue'
// Drawer 開關狀態
const isDrawerOpen = ref(false)

const HEADER_NAVS = [
  { title: 'gantt', icon: 'mdi-chart-gantt', to: '/gantt' },
  { title: 'kanban', icon: 'mdi-bulletin-board', to: '/kanban' },
  { title: 'flow', icon: 'mdi-sitemap-outline', to: '/flow' },
  { title: 'map', icon: 'mdi-map-legend', to: '/map' },
]

</script>

<template>
  <v-app>
    <v-layout class="rounded rounded-md border">
      <v-app-bar title="Nuxt4-App" color="primary">
        <template #prepend>
          <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen"/>
          <v-btn :to="'/'">
            <h3>Nuxt4-App</h3>
          </v-btn>
        </template>
  
        <template #title>
          <div class="d-flex justify-end align-center ga-3 mr-3">
            <v-btn
              v-for="nav in HEADER_NAVS"
              :key="nav.title"
              :to="nav.to"
            >
              <template #prepend>
                <v-icon>{{ nav.icon }}</v-icon>
              </template>
              {{ nav.title }}
            </v-btn>
          </div>
        </template>
      </v-app-bar>
  
      <v-navigation-drawer v-model="isDrawerOpen" class="bg-blue-lighten-4">
        <v-list nav>
          <v-list-item title="Navigation drawer" link/>
        </v-list>
      </v-navigation-drawer>
  
      <v-main class="d-flex justify-center bg-blue-lighten-5">
        <v-container class="border">
          <!-- Suspense 用於頁面內容 slot / NuxtPage -->
          <Suspense>
            <template #default>
              <slot />
            </template>
            <template #fallback>
              <div class="d-flex justify-center align-center" style="height:300px;">
                <v-progress-circular indeterminate color="primary" size="48"/>
              </div>
            </template>
          </Suspense>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>