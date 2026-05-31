<template>
  <div class="q-gutter-y-md">
    <!-- Encabezado -->
    <div class="row items-center justify-between">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Categorías POS</h1>
        <div class="text-caption text-grey-6">Productos disponibles en el punto de venta agrupados por caja</div>
      </div>
      <q-btn
        color="indigo-7"
        icon="add_circle"
        label="Nueva Categoría"
        unelevated
        class="rounded-borders text-weight-bold"
        @click="abrirDialogoNuevo"
      />
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="rounded-borders bg-white q-pa-md">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="busqueda"
            label="Buscar categoría por nombre..."
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
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filtroCaja"
            label="Filtrar por caja"
            outlined
            dense
            clearable
            color="indigo"
            :options="opcionesCajas"
            emit-value
            map-options
          >
            <template v-slot:prepend>
              <q-icon name="inbox" color="indigo-4" />
            </template>
          </q-select>
        </div>
        <div class="col">
          <q-chip outline color="indigo" icon="category" class="text-weight-bold">
            {{ categoriasFiltradas.length }} categoría{{ categoriasFiltradas.length !== 1 ? 's' : '' }}
          </q-chip>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Categorías -->
    <q-card flat bordered class="rounded-borders bg-white overflow-hidden shadow-1">
      <q-table
        flat
        :rows="categoriasFiltradas"
        :columns="columns"
        row-key="id"
        :loading="categoriasStore.loading"
        :pagination="paginationDefault"
        no-data-label="No se encontraron categorías registradas"
        loading-label="Cargando categorías..."
        class="table-styled"
      >
        <!-- Nombre -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <q-icon name="category" color="indigo-5" size="xs" />
              <span class="text-weight-medium">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <!-- Precio base -->
        <template v-slot:body-cell-precio_base="props">
          <q-td :props="props" class="text-weight-bold text-teal-8">
            {{ formatCLP(props.value) }}
          </q-td>
        </template>

        <!-- Caja asociada -->
        <template v-slot:body-cell-caja="props">
          <q-td :props="props">
            <q-chip
              v-if="props.row.caja"
              outline
              color="purple"
              dense
              size="xs"
              icon="inbox"
              class="text-weight-bold"
            >
              {{ props.row.caja.nombre }}
            </q-chip>
            <span v-else class="text-grey-5">Sin caja</span>
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-xs">
            <q-btn flat round dense icon="edit" color="indigo" size="sm" @click="abrirDialogoEditar(props.row)">
              <q-tooltip>Editar categoría</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="red-7" size="sm" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar categoría</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo: Crear / Editar Categoría -->
    <q-dialog v-model="dialogCategoria" persistent>
      <q-card style="width: 100%; max-width: 480px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center">
          <q-icon :name="editando ? 'edit' : 'add_circle'" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">{{ editando ? 'Editar Categoría' : 'Nueva Categoría' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-gutter-y-md">
          <q-input
            v-model="formCategoria.nombre"
            label="Nombre de la categoría *"
            outlined
            dense
            color="indigo"
            :rules="[val => !!val || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="category" color="indigo-4" />
            </template>
          </q-input>

          <q-input
            v-model.number="formCategoria.precio_base"
            label="Precio base (CLP) *"
            outlined
            dense
            color="indigo"
            type="number"
            :rules="[val => val > 0 || 'El precio debe ser mayor a 0']"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="indigo-4" />
            </template>
          </q-input>

          <q-select
            v-model="formCategoria.caja_id"
            label="Caja asignada *"
            outlined
            dense
            color="indigo"
            :options="opcionesCajas"
            emit-value
            map-options
            :rules="[val => !!val || 'Debe seleccionar una caja']"
          >
            <template v-slot:prepend>
              <q-icon name="inbox" color="indigo-4" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editando ? 'Guardar Cambios' : 'Crear Categoría'"
            color="indigo"
            class="text-weight-bold rounded-borders"
            :loading="guardando"
            @click="guardarCategoria"
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
          <p class="text-body1">¿Eliminar la categoría <strong>{{ categoriaAEliminar?.nombre }}</strong>?</p>
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
            @click="eliminarCategoria"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoriasStore, type Categoria } from '../stores/categoriasStore'

const $q = useQuasar()
const categoriasStore = useCategoriasStore()

const guardando = ref(false)
const busqueda = ref('')
const filtroCaja = ref('')
const dialogCategoria = ref(false)
const dialogEliminar = ref(false)
const editando = ref(false)
const categoriaEditandoId = ref('')
const categoriaAEliminar = ref<Categoria | null>(null)

const formCategoria = reactive({
  nombre: '',
  precio_base: 0,
  caja_id: ''
})

const paginationDefault = {
  sortBy: 'nombre',
  descending: false,
  rowsPerPage: 15
}

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'precio_base', label: 'Precio Base', field: 'precio_base', align: 'right' as const, sortable: true },
  { name: 'caja', label: 'Caja Asignada', field: 'caja_id', align: 'center' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' as const }
]

const opcionesCajas = computed(() => {
  return categoriasStore.cajas.map(c => ({
    label: c.nombre,
    value: c.id
  }))
})

const categoriasFiltradas = computed(() => {
  let list = categoriasStore.categorias

  if (busqueda.value && busqueda.value.trim() !== '') {
    const q = busqueda.value.toLowerCase().trim()
    list = list.filter(c => c.nombre.toLowerCase().includes(q))
  }

  if (filtroCaja.value) {
    list = list.filter(c => c.caja_id === filtroCaja.value)
  }

  return list
})

onMounted(async () => {
  $q.loading.show({ message: 'Cargando categorías...' })
  try {
    await Promise.all([
      categoriasStore.cargarCajas(),
      categoriasStore.cargarCategorias()
    ])
  } catch (error) {
    console.error('Error cargando categorías:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar categorías' })
  } finally {
    $q.loading.hide()
  }
})

function abrirDialogoNuevo() {
  editando.value = false
  categoriaEditandoId.value = ''
  formCategoria.nombre = ''
  formCategoria.precio_base = 0
  formCategoria.caja_id = ''
  dialogCategoria.value = true
}

function abrirDialogoEditar(row: Categoria) {
  editando.value = true
  categoriaEditandoId.value = row.id
  formCategoria.nombre = row.nombre
  formCategoria.precio_base = row.precio_base
  formCategoria.caja_id = row.caja_id
  dialogCategoria.value = true
}

function confirmarEliminar(row: Categoria) {
  categoriaAEliminar.value = row
  dialogEliminar.value = true
}

async function guardarCategoria() {
  if (!formCategoria.nombre.trim()) {
    $q.notify({ type: 'warning', message: 'El nombre es obligatorio' })
    return
  }
  if (formCategoria.precio_base <= 0) {
    $q.notify({ type: 'warning', message: 'El precio debe ser mayor a 0' })
    return
  }
  if (!formCategoria.caja_id) {
    $q.notify({ type: 'warning', message: 'Debe seleccionar una caja' })
    return
  }

  guardando.value = true
  try {
    if (editando.value) {
      await categoriasStore.actualizarCategoria(categoriaEditandoId.value, {
        nombre: formCategoria.nombre,
        precio_base: formCategoria.precio_base,
        caja_id: formCategoria.caja_id
      })
      $q.notify({ type: 'positive', message: 'Categoría actualizada correctamente', icon: 'check_circle' })
    } else {
      await categoriasStore.agregarCategoria({
        nombre: formCategoria.nombre,
        precio_base: formCategoria.precio_base,
        caja_id: formCategoria.caja_id
      })
      $q.notify({ type: 'positive', message: 'Categoría creada correctamente', icon: 'check_circle' })
    }
    dialogCategoria.value = false
  } catch (error) {
    console.error('Error guardando categoría:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar la categoría' })
  } finally {
    guardando.value = false
  }
}

async function eliminarCategoria() {
  if (!categoriaAEliminar.value) return

  guardando.value = true
  try {
    await categoriasStore.eliminarCategoria(categoriaAEliminar.value.id)
    $q.notify({ type: 'positive', message: 'Categoría eliminada correctamente', icon: 'check_circle' })
    dialogEliminar.value = false
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar la categoría' })
  } finally {
    guardando.value = false
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
