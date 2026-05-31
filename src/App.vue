<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import EmptyLayout from './layouts/EmptyLayout.vue'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

// Mapea el layoutComponent en base al meta de la ruta actual
const layoutComponent = computed(() => {
  if (route.meta.layout === 'default') {
    return MainLayout
  }
  return EmptyLayout
})

onMounted(async () => {
  // Comprobar sesión de Supabase al iniciar la app
  await authStore.checkSession()
})
</script>

<style>
/* Estilos globales y reset adicionales */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
