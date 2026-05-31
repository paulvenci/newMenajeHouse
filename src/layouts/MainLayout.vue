<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-1">
    <!-- Barra Superior -->
    <q-header elevated class="bg-indigo-7 text-white" height-hint="64">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="text-weight-bold text-subtitle1 text-md-h6 d-flex align-center">
          <q-icon name="storefront" size="sm" class="q-mr-sm" />
          NewMenajeHouse <span class="text-weight-light q-ml-xs text-indigo-2">| {{ currentSection }}</span>
        </q-toolbar-title>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <!-- Botón Pantalla Completa -->
          <q-btn
            flat
            round
            dense
            :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
            color="white"
            @click="toggleFullscreen"
            class="transition-swing"
          >
            <q-tooltip>{{ isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa' }}</q-tooltip>
          </q-btn>

          <!-- Información del Usuario -->
          <div class="text-subtitle2 text-indigo-1 q-mr-sm gt-xs" v-if="userEmail">
            {{ userEmail }}
          </div>
          
          <!-- Botón Cerrar Sesión -->
          <q-btn
            flat
            round
            dense
            icon="logout"
            color="white"
            @click="handleLogout"
            class="transition-swing"
          >
            <q-tooltip>Cerrar Sesión</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Menú Lateral -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-indigo-9 text-white drawer-style"
      :width="260"
    >
      <div class="drawer-header q-pa-md text-center bg-indigo-10">
        <q-avatar size="72px" class="q-mb-sm bg-indigo-7 shadow-2">
          <q-icon name="account_circle" size="64px" color="white" />
        </q-avatar>
        <div class="text-subtitle1 text-weight-bold">Menaje House</div>
        <div class="text-caption text-indigo-3">Panel de Administración</div>
      </div>

      <q-scroll-area class="fit" style="height: calc(100% - 140px)">
        <q-list class="q-py-md">
          <q-item-label header class="text-indigo-3 text-weight-bold text-uppercase text-caption q-px-md">
            Módulos Principales
          </q-item-label>

          <q-item
            v-for="item in menuItems"
            :key="item.path"
            clickable
            v-ripple
            :to="item.path"
            active-class="bg-indigo-7 text-white text-weight-bold item-active"
            class="q-mx-sm q-my-xs rounded-borders text-indigo-2 transition-swing menu-item-style"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="sm" />
            </q-item-section>
            <q-item-section class="text-subtitle2">
              {{ item.title }}
            </q-item-section>
          </q-item>

          <q-separator dark class="q-my-md q-mx-md opacity-40" />

          <q-item-label header class="text-indigo-3 text-weight-bold text-uppercase text-caption q-px-md">
            Configuración
          </q-item-label>

          <q-item
            v-for="item in configItems"
            :key="item.path"
            clickable
            v-ripple
            :to="item.path"
            active-class="bg-indigo-7 text-white text-weight-bold item-active"
            class="q-mx-sm q-my-xs rounded-borders text-indigo-2 transition-swing menu-item-style"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" size="sm" />
            </q-item-section>
            <q-item-section class="text-subtitle2">
              {{ item.title }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Contenedor de Páginas con Transición -->
    <q-page-container>
      <q-page class="q-pa-md q-pa-md-lg">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const isFullscreen = ref(false)

const currentSection = computed(() => {
  return (route.meta.section as string) || 'Administración'
})

const userEmail = computed(() => {
  return authStore.user?.email || ''
})

const menuItems = [
  { title: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { title: 'Punto de Venta', icon: 'point_of_sale', path: '/punto-venta' },
  { title: 'Ventas Live', icon: 'live_tv', path: '/ventas-live' },
  { title: 'Pendientes Live', icon: 'pending_actions', path: '/pendientes-live' },
  { title: 'Reportes', icon: 'assessment', path: '/reportes' }
]

const configItems = [
  { title: 'Clientes', icon: 'people', path: '/clientes' },
  { title: 'Cajas POS', icon: 'inbox', path: '/cajas' },
  { title: 'Categorías POS', icon: 'category', path: '/categorias' }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(err => {
      console.error("Error al activar pantalla completa:", err)
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(err => {
      console.error("Error al salir de pantalla completa:", err)
    })
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

async function handleLogout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    await authStore.signOut()
    router.push('/login')
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}

.menu-item-style:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white !important;
}

.item-active {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.drawer-style {
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* Transiciones fade en cambio de ruta */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
