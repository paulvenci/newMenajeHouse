<template>
  <div class="q-gutter-y-md">
    <!-- Encabezado -->
    <div class="row items-center justify-between">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Gestión de Clientes</h1>
        <div class="text-caption text-grey-6">Administración de la base de datos de clientes</div>
      </div>
      <q-btn
        color="indigo-7"
        icon="person_add"
        label="Nuevo Cliente"
        unelevated
        class="rounded-borders text-weight-bold"
        @click="abrirDialogoNuevo"
      />
    </div>

    <!-- Barra de Búsqueda -->
    <q-card flat bordered class="rounded-borders bg-white q-pa-md">
      <div class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="busqueda"
            label="Buscar cliente por nombre, email o teléfono..."
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
          <q-chip outline color="indigo" icon="people" class="text-weight-bold">
            {{ clientesFiltrados.length }} cliente{{ clientesFiltrados.length !== 1 ? 's' : '' }}
          </q-chip>
        </div>
      </div>
    </q-card>

    <!-- Tabla de Clientes -->
    <q-card flat bordered class="rounded-borders bg-white overflow-hidden shadow-1">
      <q-table
        flat
        :rows="clientesFiltrados"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="paginationDefault"
        no-data-label="No se encontraron clientes registrados"
        loading-label="Cargando clientes..."
        class="table-styled"
      >
        <!-- Celda de nombre con avatar -->
        <template v-slot:body-cell-nombre="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <q-avatar size="28px" color="indigo-2" text-color="indigo-9" class="text-weight-bold" style="font-size: 12px;">
                {{ props.value.charAt(0).toUpperCase() }}
              </q-avatar>
              <span class="text-weight-medium">{{ props.value }}</span>
            </div>
          </q-td>
        </template>

        <!-- Celda de email -->
        <template v-slot:body-cell-email="props">
          <q-td :props="props">
            <span class="text-grey-8">{{ props.value || '—' }}</span>
          </q-td>
        </template>

        <!-- Celda de teléfono -->
        <template v-slot:body-cell-telefono="props">
          <q-td :props="props">
            <q-chip v-if="props.value" outline color="teal" dense size="xs" icon="phone">
              {{ props.value }}
            </q-chip>
            <span v-else class="text-grey-5">—</span>
          </q-td>
        </template>

        <!-- Acciones -->
        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-x-xs">
            <q-btn flat round dense icon="edit" color="indigo" size="sm" @click="abrirDialogoEditar(props.row)">
              <q-tooltip>Editar cliente</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" color="red-7" size="sm" @click="confirmarEliminar(props.row)">
              <q-tooltip>Eliminar cliente</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Diálogo: Crear / Editar Cliente -->
    <q-dialog v-model="dialogCliente" persistent>
      <q-card style="width: 100%; max-width: 480px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center">
          <q-icon :name="editando ? 'edit' : 'person_add'" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">{{ editando ? 'Editar Cliente' : 'Nuevo Cliente' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg q-gutter-y-md">
          <q-input
            v-model="formCliente.nombre"
            label="Nombre completo *"
            outlined
            dense
            color="indigo"
            :rules="[val => !!val || 'El nombre es obligatorio']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="indigo-4" />
            </template>
          </q-input>

          <q-input
            v-model="formCliente.email"
            label="Correo electrónico"
            outlined
            dense
            color="indigo"
            type="email"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="indigo-4" />
            </template>
          </q-input>

          <q-input
            v-model="formCliente.telefono"
            label="Teléfono"
            outlined
            dense
            color="indigo"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="indigo-4" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            :label="editando ? 'Guardar Cambios' : 'Crear Cliente'"
            color="indigo"
            class="text-weight-bold rounded-borders"
            :loading="guardando"
            @click="guardarCliente"
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
          <p class="text-body1">¿Estás seguro de que deseas eliminar al cliente <strong>{{ clienteAEliminar?.nombre }}</strong>?</p>
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
            @click="eliminarCliente"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useClientesStore } from '../stores/clientesStore'

const $q = useQuasar()
const clientesStore = useClientesStore()

const loading = ref(false)
const guardando = ref(false)
const busqueda = ref('')
const dialogCliente = ref(false)
const dialogEliminar = ref(false)
const editando = ref(false)
const clienteEditandoId = ref('')
const clienteAEliminar = ref<{ id: string, nombre: string } | null>(null)

const formCliente = reactive({
  nombre: '',
  email: '',
  telefono: ''
})

const paginationDefault = {
  sortBy: 'nombre',
  descending: false,
  rowsPerPage: 15
}

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' as const, sortable: true },
  { name: 'acciones', label: 'Acciones', field: 'id', align: 'center' as const }
]

const clientesFiltrados = computed(() => {
  if (!busqueda.value || busqueda.value.trim() === '') {
    return clientesStore.clientes
  }
  const q = busqueda.value.toLowerCase().trim()
  return clientesStore.clientes.filter(c =>
    c.nombre.toLowerCase().includes(q) ||
    (c.email && c.email.toLowerCase().includes(q)) ||
    (c.telefono && c.telefono.toLowerCase().includes(q))
  )
})

onMounted(async () => {
  loading.value = true
  try {
    await clientesStore.cargarClientes()
  } catch (error) {
    console.error('Error cargando clientes:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar clientes' })
  } finally {
    loading.value = false
  }
})

function abrirDialogoNuevo() {
  editando.value = false
  clienteEditandoId.value = ''
  formCliente.nombre = ''
  formCliente.email = ''
  formCliente.telefono = ''
  dialogCliente.value = true
}

function abrirDialogoEditar(row: { id: string, nombre: string, email: string, telefono: string }) {
  editando.value = true
  clienteEditandoId.value = row.id
  formCliente.nombre = row.nombre
  formCliente.email = row.email || ''
  formCliente.telefono = row.telefono || ''
  dialogCliente.value = true
}

function confirmarEliminar(row: { id: string, nombre: string }) {
  clienteAEliminar.value = row
  dialogEliminar.value = true
}

async function guardarCliente() {
  if (!formCliente.nombre.trim()) {
    $q.notify({ type: 'warning', message: 'El nombre del cliente es obligatorio' })
    return
  }

  guardando.value = true
  try {
    if (editando.value) {
      await clientesStore.actualizarCliente(clienteEditandoId.value, formCliente.nombre, formCliente.email, formCliente.telefono)
      $q.notify({ type: 'positive', message: 'Cliente actualizado correctamente', icon: 'check_circle' })
    } else {
      await clientesStore.agregarCliente(formCliente.nombre, formCliente.email, formCliente.telefono)
      $q.notify({ type: 'positive', message: 'Cliente creado correctamente', icon: 'check_circle' })
    }
    dialogCliente.value = false
  } catch (error) {
    console.error('Error guardando cliente:', error)
    $q.notify({ type: 'negative', message: 'Error al guardar el cliente' })
  } finally {
    guardando.value = false
  }
}

async function eliminarCliente() {
  if (!clienteAEliminar.value) return

  guardando.value = true
  try {
    await clientesStore.eliminarCliente(clienteAEliminar.value.id)
    $q.notify({ type: 'positive', message: 'Cliente eliminado correctamente', icon: 'check_circle' })
    dialogEliminar.value = false
  } catch (error) {
    console.error('Error eliminando cliente:', error)
    $q.notify({ type: 'negative', message: 'Error al eliminar el cliente. Puede tener ventas asociadas.' })
  } finally {
    guardando.value = false
  }
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
