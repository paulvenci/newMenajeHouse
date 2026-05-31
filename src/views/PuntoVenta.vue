<template>
  <div class="row q-col-gutter-md window-height-pos overflow-hidden">
    <!-- PANEL IZQUIERDO: Buscador y Grilla de Productos -->
    <div class="col-12 col-sm-7 col-md-7 column full-height">
      <q-card flat bordered class="rounded-borders full-height-card column no-wrap q-pa-md bg-white">
        <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-xs flex items-center">
          <q-icon name="shopping_basket" size="sm" class="q-mr-xs text-indigo" />
          Registrar Producto
        </div>
        
        <!-- Buscador superior -->
        <q-input
          v-model="filtroBusqueda"
          placeholder="Buscar tipo de producto..."
          outlined
          dense
          clearable
          class="q-mb-md"
          color="indigo"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <!-- Grilla de Productos con scroll interno -->
        <div class="products-grid-container q-pa-sm bg-grey-1 rounded-borders border q-mb-md col overflow-auto">
          <div class="row q-col-gutter-xs" v-if="categoriasFiltradas.length > 0">
            <div
              v-for="cat in categoriasFiltradas"
              :key="cat.id"
              class="col-6 col-sm-4 col-md-3"
            >
              <q-card
                clickable
                v-ripple
                @click="seleccionarCategoriaGrilla(cat)"
                class="product-item-card text-center q-pa-sm cursor-pointer transition-swing"
                :class="productoActual.categoria?.id === cat.id ? 'bg-indigo text-white text-weight-bold' : 'bg-white text-grey-9'"
              >
                <div class="text-caption text-weight-bold truncate-2-lines min-h-24">
                  {{ cat.nombre }}
                </div>
                <div 
                  class="text-subtitle2 q-mt-xs text-weight-bolder"
                  :class="productoActual.categoria?.id === cat.id ? 'text-indigo-1' : 'text-indigo-7'"
                >
                  {{ formatCLP(cat.precio_base) }}
                </div>
              </q-card>
            </div>
          </div>
          <div v-else class="flex flex-center text-grey-6 py-lg" style="min-height: 120px;">
            <div class="text-center">
              <q-icon name="error_outline" size="lg" class="q-mb-xs opacity-60" />
              <div class="text-caption">No se encontraron productos</div>
            </div>
          </div>
        </div>

        <!-- Inputs del formulario -->
        <div class="row q-col-gutter-sm">
          <!-- Descripción detallada -->
          <div class="col-12">
            <q-input
              v-model="productoActual.descripcion"
              label="Descripción detallada (Opcional)"
              outlined
              dense
              color="indigo"
              placeholder="Ej: Plato extendido azul con borde dorado"
            >
              <template v-slot:prepend>
                <q-icon name="edit_note" color="indigo-4" />
              </template>
            </q-input>
          </div>

          <!-- Precio Unitario -->
          <div class="col-12 col-sm-6">
            <q-input
              v-model.number="productoActual.precio"
              label="Precio Unitario"
              type="number"
              outlined
              dense
              prefix="$"
              color="indigo"
              :rules="[
                val => val !== null && val !== '' || 'Requerido',
                val => val >= 0 || 'Debe ser mayor o igual a 0'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="sell" color="indigo-4" />
              </template>
            </q-input>
          </div>

          <!-- Cantidad (con botones más/menos) -->
          <div class="col-12 col-sm-6">
            <div class="row items-center border rounded-borders q-px-sm" style="height: 40px; border: 1px solid rgba(0, 0, 0, 0.24)">
              <span class="text-caption text-grey-7 q-mr-sm">Cantidad:</span>
              <q-btn flat round dense icon="remove" color="negative" size="sm" @click="decrementarCantidad" />
              <q-input
                v-model.number="productoActual.cantidad"
                type="number"
                borderless
                dense
                input-class="text-center text-weight-bold"
                style="width: 50px;"
              />
              <q-btn flat round dense icon="add" color="positive" size="sm" @click="incrementarCantidad" />
            </div>
          </div>
        </div>

        <q-space />

        <!-- Botón Agregar al Carrito -->
        <q-btn
          color="indigo-7"
          label="Agregar al Carrito"
          icon="add_shopping_cart"
          class="rounded-borders text-weight-bold text-subtitle2 q-mt-md"
          unevaluated
          size="medium"
          @click="agregarItem"
          :disabled="!productoActual.categoria"
        />
      </q-card>
    </div>

    <!-- PANEL DERECHO: Carrito de Compras -->
    <div class="col-12 col-sm-5 col-md-5 column full-height">
      <q-card flat bordered class="rounded-borders full-height-card column no-wrap bg-white overflow-hidden">
        <!-- Cabecera del Carrito -->
        <q-toolbar class="bg-indigo text-white shadow-2">
          <q-icon name="shopping_cart" class="q-mr-xs" size="sm" />
          <q-toolbar-title class="text-subtitle2 text-weight-bold">
            Carrito de Compras
          </q-toolbar-title>
          <q-chip color="white" text-color="indigo-10" dense class="text-weight-bolder">
            {{ posStore.carrito.length }}
          </q-chip>

          <!-- Botón Limpiar Carrito (Requisito) -->
          <q-btn
            flat
            round
            dense
            icon="delete_sweep"
            color="white"
            class="q-ml-sm transition-swing"
            :disabled="posStore.carrito.length === 0"
            @click="confirmarLimpiarCarrito"
          >
            <q-tooltip>Limpiar Carrito</q-tooltip>
          </q-btn>
        </q-toolbar>

        <!-- Listado de productos en el carrito -->
        <div class="cart-items-container col overflow-auto">
          <q-list separator v-if="posStore.carrito.length > 0">
            <q-item
              v-for="item in posStore.carrito"
              :key="item.id"
              class="q-py-md items-center"
            >
              <q-item-section avatar>
                <q-avatar color="indigo-1" text-color="indigo-9" class="text-weight-bold text-subtitle2">
                  {{ item.cantidad }}x
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-subtitle2">{{ item.categoria.nombre }}</q-item-label>
                <q-item-label caption v-if="item.descripcion_libre" class="text-grey-8 truncate-description">
                  {{ item.descripcion_libre }}
                </q-item-label>
                <q-item-label class="row items-center q-mt-xs">
                  <q-chip color="indigo-2" text-color="indigo-9" dense class="text-caption text-weight-medium q-mr-sm" size="xs">
                    {{ item.categoria.caja?.nombre || 'Sin Caja' }}
                  </q-chip>
                  <span class="text-caption text-grey-6 text-weight-medium">
                    U: {{ formatCLP(item.precio_unitario) }}
                  </span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row items-center no-wrap">
                  <span class="text-subtitle2 text-weight-bold text-teal-8 q-mr-sm">
                    {{ formatCLP(item.subtotal) }}
                  </span>
                  <q-btn
                    flat
                    round
                    dense
                    icon="delete_outline"
                    color="negative"
                    size="sm"
                    @click="posStore.quitarDelCarrito(item.id)"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-else class="flex flex-center text-grey-6 full-height" style="min-height: 200px;">
            <div class="text-center">
              <q-icon name="remove_shopping_cart" size="64px" class="q-mb-sm opacity-50" />
              <div class="text-subtitle1 text-weight-bold">Carrito Vacío</div>
              <div class="text-caption">Agrega productos desde el panel izquierdo</div>
            </div>
          </div>
        </div>

        <q-separator />

        <!-- Pie del Carrito: Método de pago, Totales y Cobro -->
        <div class="q-pa-md bg-grey-1">
          <!-- Método de Pago -->
          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Método de Pago</div>
            <div class="row q-col-gutter-xs">
              <div class="col-4">
                <q-btn
                  :outline="posStore.metodoPago !== 'Efectivo'"
                  no-caps
                  label="Efectivo"
                  icon="payments"
                  color="indigo"
                  class="full-width rounded-borders text-caption text-weight-bold"
                  @click="posStore.setMetodoPago('Efectivo')"
                />
              </div>
              <div class="col-4">
                <q-btn
                  :outline="posStore.metodoPago !== 'Débito/Crédito'"
                  no-caps
                  label="Tarjeta"
                  icon="credit_card"
                  color="indigo"
                  class="full-width rounded-borders text-caption text-weight-bold"
                  @click="posStore.setMetodoPago('Débito/Crédito')"
                />
              </div>
              <div class="col-4">
                <q-btn
                  :outline="posStore.metodoPago !== 'Transferencia'"
                  no-caps
                  label="Transfer."
                  icon="account_balance"
                  color="indigo"
                  class="full-width rounded-borders text-caption text-weight-bold"
                  @click="posStore.setMetodoPago('Transferencia')"
                />
              </div>
            </div>
          </div>

          <!-- Total a Pagar -->
          <div class="row justify-between items-center q-mb-md">
            <span class="text-subtitle2 text-weight-bold text-grey-8">Total a Pagar</span>
            <span class="text-h6 text-weight-bold text-teal-8">
              {{ formatCLP(posStore.totalCarrito) }}
            </span>
          </div>

          <!-- Botón de Cobro -->
          <q-btn
            color="positive"
            label="Cobrar Venta"
            icon="monetization_on"
            class="full-width rounded-borders text-weight-bold text-subtitle2"
            unevaluated
            size="large"
            :disabled="posStore.carrito.length === 0"
            :loading="posStore.isProcessing"
            @click="procesarVenta"
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoriasStore, type Categoria } from '../stores/categoriasStore'
import { usePosStore } from '../stores/posStore'

const $q = useQuasar()
const categoriasStore = useCategoriasStore()
const posStore = usePosStore()

const filtroBusqueda = ref('')

const productoActual = ref({
  categoria: null as Categoria | null,
  descripcion: '',
  precio: 0,
  cantidad: 1
})

onMounted(async () => {
  await categoriasStore.cargarCategorias()
})

const categoriasFiltradas = computed(() => {
  const query = filtroBusqueda.value?.toLowerCase().trim() || ''
  if (!query) return categoriasStore.categorias
  
  return categoriasStore.categorias.filter(c => 
    c.nombre.toLowerCase().includes(query)
  )
})

function seleccionarCategoriaGrilla(cat: Categoria) {
  if (productoActual.value.categoria?.id === cat.id) {
    productoActual.value.categoria = null
    productoActual.value.precio = 0
  } else {
    productoActual.value.categoria = cat
    productoActual.value.precio = cat.precio_base
  }
}

function incrementarCantidad() {
  productoActual.value.cantidad++
}

function decrementarCantidad() {
  if (productoActual.value.cantidad > 1) {
    productoActual.value.cantidad--
  }
}

function agregarItem() {
  if (!productoActual.value.categoria) return

  posStore.agregarAlCarrito({
    categoria: productoActual.value.categoria,
    descripcion_libre: productoActual.value.descripcion,
    precio_unitario: Number(productoActual.value.precio),
    cantidad: Number(productoActual.value.cantidad)
  })

  // Reset formulario
  productoActual.value.categoria = null
  productoActual.value.descripcion = ''
  productoActual.value.precio = 0
  productoActual.value.cantidad = 1

  $q.notify({
    type: 'positive',
    message: 'Producto agregado al carrito',
    icon: 'shopping_cart',
    position: 'top-right',
    timeout: 1000
  })
}

function confirmarLimpiarCarrito() {
  $q.dialog({
    title: 'Confirmar Acción',
    message: '¿Estás seguro de que deseas vaciar por completo el carrito de compras?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Sí, vaciar',
      color: 'negative',
      unevaluated: true
    }
  }).onOk(() => {
    posStore.limpiarCarrito()
    $q.notify({
      type: 'info',
      message: 'Carrito vaciado correctamente',
      icon: 'delete_sweep'
    })
  })
}

async function procesarVenta() {
  try {
    await posStore.procesarVenta()
    $q.notify({
      type: 'positive',
      message: '¡Venta procesada con éxito!',
      icon: 'check_circle'
    })
  } catch (error: any) {
    console.error("Error al procesar cobro POS:", error)
    $q.notify({
      type: 'negative',
      message: 'Error al procesar la venta: ' + error.message,
      icon: 'error'
    })
  }
}

function formatCLP(val: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(val)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

.window-height-pos {
  height: calc(100vh - 90px);
  min-height: 500px;
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.products-grid-container {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.product-item-card {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 70px;
  box-shadow: none;
  user-select: none;
}

.product-item-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}



.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.min-h-24 {
  min-height: 24px;
}

.truncate-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}
</style>
