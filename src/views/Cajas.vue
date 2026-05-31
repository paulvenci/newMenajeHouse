<template>
  <div class="q-gutter-y-md">
    <!-- Encabezado -->
    <div class="row items-center justify-between">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Cajas POS</h1>
        <div class="text-caption text-grey-6">Administración de las cajas del punto de venta</div>
      </div>
      <q-btn
        color="indigo-7"
        icon="add_box"
        label="Nueva Caja"
        unelevated
        class="rounded-borders text-weight-bold"
        @click="abrirDialogoNuevo"
      />
    </div>

    <!-- Tarjetas de Cajas -->
    <q-card flat bordered class="rounded-borders bg-white q-pa-md">
      <div class="row q-col-gutter-md items-center q-mb-md">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="busqueda"
            label="Buscar caja..."
            outlined
            dense
            clearable
            color="indigo"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="indigo-4" />
            </template>
          </q-input>
        </div>
        <div class="col">
          <q-chip outline color="indigo" icon="inbox" class="text-weight-bold">
            {{ cajasFiltradas.length }} caja{{ cajasFiltradas.length !== 1 ? 's' : '' }}
          </q-chip>
        </div>
      </div>

      <!-- Tabla de Cajas -->
      <q-table
        flat
        bordered
        :rows="cajasFiltradas"
        :columns="columns"
        row-key="id"
        :loading="categoriasStore.loading"
        :pagination="paginationDefault"
        no-data-label="No hay cajas registradas"
        loading-label="Cargando cajas..."
        class="table-styled"
      >
        <!-- Nombre con icono -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <q-icon name="inbox" color="indigo-5" size="xs" />
              <span class="text-weight-medium">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <!-- Categorías asociadas -->
        <template v-slot:body-cell-categorias="props">
          <q-td :props="props">
            <q-chip
              outline
              color="teal"
              dense
              size="xs"
              class="text-weight-bold"
            >
              {{ contarCategoriasPorCaja(props.row.id) }} categoría{{ contarCategoriasPorCaja(props.row.id) !== 1 ? 's' : '' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Fecha de creación -->
        <template v-slot:body-cell-created_at="props">
          <q-td :props="props" class="text-grey-7">
            {{ formatFecha(props.value) }}
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-xs">
            <q-btn flat round dense icon="delete" color="red-7" size="sm" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar caja</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo: Crear Caja -->
    <q-dialog v-model="dialogCaja" persistent>
      <q-card style="width: 100%; max-width: 420px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center">
          <q-icon name="add_box" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Nueva Caja</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-input
            v-model="nuevaCajaNombre"
            label="Nombre de la caja *"
            outlined
            dense
            color="indigo"
            :rules="[val => !!val || 'El nombre es obligatorio']"
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="inbox" color="indigo-4" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Crear Caja"
            color="indigo"
            class="text-weight-bold rounded-borders"
            :loading="guardando"
            @click="crearCaja"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Diálogo: Confirmar Eliminación -->
    <q-dialog v-model="dialogEliminar" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-red-7 text-white q-py-md text-center">
          <q-icon name="warning" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Confirmar Eliminación</div>
        </q-card-section>

        <q-card-section class="q-pt-md text-center">
          <p class="text-body1">¿Eliminar la caja <strong>{{ cajaAEliminar?.nombre }}</strong>?</p>
          <p class="text-caption text-red-7" v-if="contarCategoriasPorCaja(cajaAEliminar?.id || '') > 0">
            ⚠️ Esta caja tiene {{ contarCategoriasPorCaja(cajaAEliminar?.id || '') }} categoría(s) asociadas.
          </p>
          <p class="text-caption text-grey-7">Esta acción no se puede deshacer.</p>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Eliminar"
            color="red-7"
            class="text-weight-bold rounded-borders"
            :loading="guardando"
            @click="eliminarCaja"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoriasStore, type Caja } from '../stores/categoriasStore'

const $q = useQuasar()
const categoriasStore = useCategoriasStore()

const guardando = ref(false)
const busqueda = ref('')
const dialogCaja = ref(false)
const dialogEliminar = ref(false)
const nuevaCajaNombre = ref('')
const cajaAEliminar = ref<Caja | null>(null)

const paginationDefault = {
  sortBy: 'nombre',
  descending: false,
  rowsPerPage: 15
}

const columns = [
  { name: 'nombre', label: 'Nombre de la Caja', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'categorias', label: 'Categorías Asociadas', field: 'id', align: 'center' as const },
  { name: 'created_at', label: 'Fecha de Creación', field: 'created_at', align: 'left' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' as const }
]

const cajasFiltradas = computed(() => {
  if (!busqueda.value || busqueda.value.trim() === '') {
    return categoriasStore.cajas
  }
  const q = busqueda.value.toLowerCase().trim()
  return categoriasStore.cajas.filter(c => c.nombre.toLowerCase().includes(q))
})

function contarCategoriasPorCaja(cajaId: string): number {
  return categoriasStore.categorias.filter(c => c.caja_id === cajaId).length
}

onMounted(async () => {
  $q.loading.show({ message: 'Cargando cajas...' })
  try {
    await Promise.all([
      categoriasStore.cargarCajas(),
      categoriasStore.cargarCategorias()
    ])
  } catch (error) {
    console.error('Error cargando cajas:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar cajas' })
  } finally {
    $q.loading.hide()
  }
})

function abrirDialogoNuevo() {
  nuevaCajaNombre.value = ''
  dialogCaja.value = true
}

function confirmarEliminar(row: Caja) {
  cajaAEliminar.value = row
  dialogEliminar.value = true
}

async function crearCaja() {
  if (!nuevaCajaNombre.value.trim()) {
    $q.notify({ type: 'warning', message: 'El nombre de la caja es obligatorio' })
    return
  }

  guardando.value = true
  try {
    await categoriasStore.agregarCaja(nuevaCajaNombre.value.trim())
    $q.notify({ type: 'positive', message: 'Caja creada correctamente', icon: 'check_circle' })
    dialogCaja.value = false
  } catch (error) {
    console.error('Error creando caja:', error)
    $q.notify({ type: 'negative', message: 'Error al crear la caja' })
  } finally {
    guardando.value = false
  }
}

async function eliminarCaja() {
  if (!cajaAEliminar.value) return

  guardando.value = true
  try {
    await categoriasStore.eliminarCaja(cajaAEliminar.value.id)
    $q.notify({ type: 'positive', message: 'Caja eliminada correctamente', icon: 'check_circle' })
    dialogEliminar.value = false
  } catch (error) {
    console.error('Error eliminando caja:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar la caja. Puede tener categorías asociadas.' })
  } finally {
    guardando.value = false
  }
}

function formatFecha(fecha?: string) {
  if (!fecha) return '—'
  const d = new Date(fecha)
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

.table-styled {
  border-radius: 0;
  box-shadow: none;
}

.table-styled :deep(thead tr th) {
  font-weight: bold;
  background-color: #f5f5f5;
  color: #333333;
}
</style>
