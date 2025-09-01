<script lang="ts" setup>
import { ref } from 'vue'
// Drawer 開關狀態
const isDrawerOpen = ref(false)

const NAVS = [
  {
    title: 'Gantt',
    icon: 'mdi-chart-gantt',
    to: '/gantt',
    children: [
      { title: 'Gantt', to: '/gantt' },
      { title: 'Gantt-Canvas', to: '/gantt-canvas' },
      { title: 'Gantt-SVG', to: '/gantt-svg' },
    ]
  },
  {
    title: 'Kanban',
    icon: 'mdi-bulletin-board',
    to: '/kanban',
    children: [
      { title: 'Kanban', to: '/kanban' },
      { title: 'Kanban-Canvas', to: '/kanban-canvas' },
      { title: 'Kanban-SVG', to: '/kanban-svg' },
    ]
  },
  {
    title: 'Flow',
    icon: 'mdi-sitemap-outline',
    to: '/flow',
    children: [
      { title: 'Flow', to: '/flow' },
      { title: 'Flow-Canvas', to: '/flow-canvas' },
      { title: 'Flow-SVG', to: '/flow-svg' },
    ]
  },
  {
    title: 'Map',
    icon: 'mdi-map-legend',
    to: '/map',
    children: [
      { title: 'Map', to: '/map' },
      { title: 'Map-Canvas', to: '/map-canvas' },
      { title: 'Map-SVG', to: '/map-svg' },
    ]
  },
]

</script>

<template>
  <v-app class="pa-0 w-100vw h-100vh overflow-hidden">
    <v-layout column>
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
              v-for="nav in NAVS"
              :key="`header-${nav.title}`"
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
          <template v-for="nav in NAVS" :key="`drawer-${nav.title}`">
            <v-divider color="info" :thickness="3" />
            <v-list-item
              v-for="item in nav.children"
              :key="`drawer-item-${item.title}`"
              :title="item.title"
              :to="item.to"
              link
            />
          </template>
        </v-list>
      </v-navigation-drawer>
  
      <v-main class="d-flex justify-center bg-blue-lighten-5">
        <div class="pa-0 ma-0 w-100 h-100 overflow-hidden position-relative">
          <!-- Suspense 用於頁面內容 slot / NuxtPage -->
          <Suspense>
            <template #default>
              <div class="w-100 h-100 overflow-auto position-absolute">
                <slot />
              </div>
            </template>
            <template #fallback>
              <div class="d-flex justify-center align-center" style="height:300px;">
                <v-progress-circular indeterminate color="primary" size="48"/>
              </div>
            </template>
          </Suspense>
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>