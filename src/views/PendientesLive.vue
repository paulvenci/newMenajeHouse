<template>
  <div class="q-gutter-y-md">
    <!-- Fila superior: Título e Info -->
    <div>
      <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Pendientes Live</h1>
      <div class="text-caption text-grey-6">Control y entrega física de productos vendidos en vivo</div>
    </div>

    <!-- Filtros de búsqueda (Requisitos) -->
    <q-card flat bordered class="rounded-borders q-pa-md bg-white">
      <div class="row q-col-gutter-md items-center">
        <!-- Búsqueda por cliente -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="filtroCliente"
            label="Buscar por cliente..."
            outlined
            dense
            clearable
            color="indigo"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="indigo-4" />
            </template>
          </q-input>
        </div>

        <!-- Búsqueda por código -->
        <div class="col-12 col-sm-6 col-md-4">
          <q-input
            v-model="filtroCodigo"
            label="Buscar por código de producto..."
            outlined
            dense
            clearable
            color="indigo"
          >
            <template v-slot:prepend>
              <q-icon name="qr_code" color="indigo-4" />
            </template>
          </q-input>
        </div>

        <!-- Filtro por fecha de Live -->
        <div class="col-12 col-md-4 row items-center no-wrap justify-between">
          <q-input
            v-model="filtroFecha"
            label="Filtrar por fecha de Live..."
            outlined
            dense
            readonly
            color="indigo"
            class="flex-grow-1"
          >
            <template v-slot:prepend>
              <q-icon name="event" color="indigo-4" />
            </template>
            <template v-slot:append>
              <q-btn flat round dense icon="calendar_today" color="indigo-7" @click="dialogCalendario = true" />
              <q-btn flat round dense icon="close" color="grey" v-if="filtroFecha" @click="filtroFecha = ''" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card>

    <!-- LISTADO AGRUPADO POR CLIENTE (Requisito) -->
    <div v-if="loading" class="flex flex-center py-xl">
      <q-spinner-dots color="indigo" size="40px" />
    </div>

    <div v-else-if="gruposPorCliente.length > 0" class="q-gutter-y-sm">
      <!-- Botones de Acción Masiva superior si hay selección -->
      <div class="row justify-between items-center q-px-sm" v-if="seleccionados.length > 0">
        <div class="text-caption text-weight-bold text-indigo">
          {{ seleccionados.length }} productos seleccionados
        </div>
        <div class="row q-gutter-xs">
          <q-btn
            color="positive"
            label="Marcar Pagados"
            icon="payments"
            size="sm"
            unevaluated
            class="rounded-borders text-weight-bold"
            @click="abrirMasivoPago"
          />
          <q-btn
            color="amber-8"
            label="Marcar Retirados"
            icon="local_shipping"
            size="sm"
            unevaluated
            class="rounded-borders text-weight-bold"
            @click="abrirMasivoRetiro"
          />
        </div>
      </div>

      <!-- Expansion Panels por Cliente -->
      <q-expansion-item
        v-for="grupo in gruposPorCliente"
        :key="grupo.clienteId"
        header-class="bg-indigo-1 text-indigo-10 rounded-borders q-py-md shadow-1"
        class="rounded-borders border overflow-hidden q-mb-sm shadow-1 bg-white"
        expand-icon-class="text-indigo-8"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar color="indigo-2" text-color="indigo-9" icon="person" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-subtitle1">{{ grupo.clienteNombre }}</q-item-label>
            <q-item-label caption class="text-indigo-9 text-caption">
              {{ grupo.items.length }} productos pendientes de pago/retiro
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row items-center no-wrap q-gutter-sm">
              <!-- Chips rápidos de estados -->
              <q-chip color="red-2" text-color="red-10" dense size="sm" v-if="grupo.pendientesPago > 0" class="text-weight-bold">
                {{ grupo.pendientesPago }} Pago pend.
              </q-chip>
              <q-chip color="amber-2" text-color="amber-10" dense size="sm" v-if="grupo.pendientesRetiro > 0" class="text-weight-bold">
                {{ grupo.pendientesRetiro }} Retiro pend.
              </q-chip>
              <q-chip color="positive-2" text-color="positive-10" dense size="sm" v-if="grupo.pendientesPago === 0 && grupo.pendientesRetiro === 0" class="text-weight-bold">
                Listo
              </q-chip>
              <div class="text-subtitle2 text-weight-bold text-teal-8 gt-xs">
                Total: {{ formatCLP(grupo.totalMonto) }}
              </div>
            </div>
          </q-item-section>
        </template>

        <!-- Detalle de productos por cliente (Tabla expandida requerida) -->
        <q-card>
          <q-card-section class="q-pa-none">
            <q-table
              flat
              bordered
              :rows="grupo.items"
              :columns="columns"
              row-key="ventaId"
              selection="multiple"
              v-model:selected="seleccionados"
              hide-pagination
              :rows-per-page-options="[0]"
              class="rounded-none border-none table-styled"
            >
              <!-- Checkbox de cabecera -->
              <template v-slot:header-selection="scope">
                <q-checkbox v-model="scope.selected" dense size="sm" />
              </template>

              <!-- Checkbox de fila individual -->
              <template v-slot:body-selection="scope">
                <q-checkbox v-model="scope.selected" dense size="sm" />
              </template>

              <!-- Celda del Código -->
              <template v-slot:body-cell-codigo="props">
                <q-td :props="props">
                  <q-chip outline color="purple" dense size="xs" class="text-weight-bold">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Celda de Valor -->
              <template v-slot:body-cell-valor="props">
                <q-td :props="props" class="text-weight-bold text-teal-8">
                  {{ formatCLP(props.value) }}
                </q-td>
              </template>

              <!-- Celda Estado Pago con Checkbox/Selector interactivo (Requisito) -->
              <template v-slot:body-cell-estadoPago="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap q-gutter-xs">
                    <q-checkbox
                      v-model="props.row.isPaidChecked"
                      dense
                      size="sm"
                      color="positive"
                      @update:model-value="(val) => handleTogglePago(props.row, val)"
                    />
                    <q-chip
                      :color="props.row.estadoPago === 'pagado' ? 'positive' : 'warning'"
                      text-color="white"
                      dense
                      size="xs"
                      class="text-weight-bold text-uppercase"
                    >
                      {{ props.row.estadoPago }}
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <!-- Celda Modo de Pago -->
              <template v-slot:body-cell-modoPago="props">
                <q-td :props="props">
                  <span class="text-caption text-grey-8 font-weight-medium" v-if="props.value">
                    {{ props.value }}
                  </span>
                  <span class="text-caption text-grey-4 text-italic" v-else>N/A</span>
                </q-td>
              </template>

              <!-- Celda Estado Retiro con Checkbox/Selector interactivo (Requisito) -->
              <template v-slot:body-cell-estadoRetiro="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap q-gutter-xs">
                    <q-checkbox
                      v-model="props.row.isRetiradoChecked"
                      dense
                      size="sm"
                      color="amber-8"
                      @update:model-value="(val) => handleToggleRetiro(props.row, val)"
                    />
                    <q-chip
                      :color="props.row.estadoRetiro === 'retirado' ? 'amber-8' : 'warning'"
                      text-color="white"
                      dense
                      size="xs"
                      class="text-weight-bold text-uppercase"
                    >
                      {{ props.row.estadoRetiro }}
                    </q-chip>
                  </div>
                </q-td>
              </template>

              <!-- Celda Quién Retiró -->
              <template v-slot:body-cell-quienRetiro="props">
                <q-td :props="props">
                  <span class="text-caption text-grey-8" v-if="props.value">
                    {{ props.value }}
                  </span>
                  <span class="text-caption text-grey-4 text-italic" v-else>N/A</span>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </div>

    <div v-else class="flex flex-center text-grey-6 py-xl bg-white rounded-borders border shadow-1" style="min-height: 250px;">
      <div class="text-center">
        <q-icon name="playlist_add_check" size="64px" class="q-mb-sm opacity-50" />
        <div class="text-subtitle1 text-weight-bold">Todo al día</div>
        <div class="text-caption">No hay productos pendientes de pago o de retiro con los filtros aplicados</div>
      </div>
    </div>

    <!-- DIÁLOGO: Selección de Fecha de Live -->
    <q-dialog v-model="dialogCalendario" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center rounded-borders">
          <q-icon name="event" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Seleccionar Fecha de Live</div>
        </q-card-section>

        <q-card-section class="flex flex-center q-pt-md">
          <q-date
            v-model="filtroFecha"
            mask="YYYY-MM-DD"
            color="indigo"
            flat
            bordered
            class="full-width"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Limpiar" color="grey-6" @click="filtroFecha = ''; dialogCalendario = false" />
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unevaluated label="Aceptar" color="indigo" class="text-weight-bold rounded-borders" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO: Confirmar y Detallar Pago -->
    <q-dialog v-model="dialogPago" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-positive text-white q-py-md text-center rounded-borders">
          <q-icon name="payments" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Registrar Pago</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-8 q-mb-md">
            Monto a Cobrar: <strong class="text-teal-8">{{ formatCLP(dialogData.monto) }}</strong>
          </div>

          <q-form @submit.prevent="guardarPago" class="q-gutter-md">
            <!-- Modo de Pago (Requisito) -->
            <q-select
              v-model="dialogData.modoPago"
              label="Modo de Pago"
              outlined
              dense
              color="indigo"
              :options="['Efectivo', 'Débito/Crédito', 'Transferencia']"
              :rules="[val => !!val || 'El modo de pago es obligatorio']"
              lazy-rules
            />

            <q-card-actions align="right" class="q-px-none q-pb-none q-mt-md">
              <q-btn flat label="Cancelar" color="grey-7" @click="cancelarPago" />
              <q-btn type="submit" unevaluated label="Confirmar Pago" color="positive" class="text-weight-bold rounded-borders" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO: Confirmar y Detallar Retiro -->
    <q-dialog v-model="dialogRetiro" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-amber-8 text-white q-py-md text-center rounded-borders">
          <q-icon name="local_shipping" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Registrar Entrega / Retiro</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="guardarRetiro" class="q-gutter-md">
            <!-- Quién Retira (Requisito con default nombre de cliente) -->
            <q-input
              v-model="dialogData.quienRetiro"
              label="Quién Retira"
              outlined
              dense
              color="indigo"
              placeholder="Nombre de la persona que retira"
              :rules="[val => !!val || 'El nombre es obligatorio']"
              lazy-rules
            />

            <q-card-actions align="right" class="q-px-none q-pb-none q-mt-md">
              <q-btn flat label="Cancelar" color="grey-7" @click="cancelarRetiro" />
              <q-btn type="submit" unevaluated label="Confirmar Retiro" color="amber-8" class="text-weight-bold text-white rounded-borders" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useVentasStore } from '../stores/ventasStores'
import { useRetirosStore } from '../stores/retirosStore'
import { supabase } from '../supabase'

const $q = useQuasar()
const ventasStore = useVentasStore()
const retirosStore = useRetirosStore()

const loading = ref(true)
const dialogCalendario = ref(false)
const dialogPago = ref(false)
const dialogRetiro = ref(false)

const filtroCliente = ref('')
const filtroCodigo = ref('')
const filtroFecha = ref('')

const seleccionados = ref<any[]>([])

const dialogData = reactive({
  ventaId: '',
  retiroId: '',
  monto: 0,
  modoPago: 'Efectivo',
  quienRetiro: '',
  clienteNombre: '',
  isMasivo: false
})

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const },
  { name: 'fecha', label: 'Fecha Live', field: 'fecha', align: 'left' as const, format: (val: string) => formatFecha(val) },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right' as const },
  { name: 'estadoPago', label: 'Estado Pago', field: 'estadoPago', align: 'center' as const },
  { name: 'fechaPago', label: 'Fecha Pago', field: 'fechaPago', align: 'left' as const, format: (val: string) => val ? formatFecha(val) : 'N/A' },
  { name: 'modoPago', label: 'Modo Pago', field: 'modoPago', align: 'left' as const },
  { name: 'estadoRetiro', label: 'Estado Retiro', field: 'estadoRetiro', align: 'center' as const },
  { name: 'quienRetiro', label: 'Quién Retiró', field: 'quienRetiro', align: 'left' as const }
]

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      ventasStore.cargarTodasLasVentas(),
      retirosStore.cargarRetirosDelMes()
    ])
  } catch (error) {
    console.error("Error cargando pendientes:", error)
  } finally {
    loading.value = false
  }
}

// Unificar Ventas Live y sus Retiros asociados
const listadoUnificado = computed(() => {
  const list: any[] = []
  
  // 1. Filtrar todas las ventas de tipo 'Venta Live'
  const ventasLive = ventasStore.ventas.filter(v => v.tipo === 'Venta Live')

  ventasLive.forEach(v => {
    // Buscar su retiro correspondiente en el store
    const r = retirosStore.retiros.find(ret => ret.ventaId === v.id)

    // Solo nos interesan los que estén pendientes de pago O pendientes de retiro
    const esPendientePago = v.estado_pago !== 'pagado'
    const esPendienteRetiro = !r || r.estado !== 'completado'

    if (esPendientePago || esPendienteRetiro) {
      list.push({
        ventaId: v.id,
        retiroId: r?.id || null,
        clienteId: v.cliente_id || '00000000-0000-0000-0000-000000000000',
        clienteNombre: v.cliente || 'Cliente Desconocido',
        fecha: v.fecha,
        codigo: v.codigo,
        valor: v.monto,
        estadoPago: v.estado_pago || 'pendiente',
        fechaPago: v.fecha_pago || null,
        modoPago: v.modo_pago || null,
        estadoRetiro: r?.estado === 'completado' ? 'retirado' : 'pendiente',
        quienRetiro: r?.retiradoPor || null,
        
        // Estado reactivo local para los checkboxes
        isPaidChecked: v.estado_pago === 'pagado',
        isRetiradoChecked: r?.estado === 'completado'
      })
    }
  })

  return list
})

// Filtrar el listado unificado por los inputs de búsqueda del usuario
const listadoFiltrado = computed(() => {
  let list = listadoUnificado.value

  // Búsqueda por cliente
  if (filtroCliente.value && filtroCliente.value.trim() !== '') {
    const q = filtroCliente.value.toLowerCase().trim()
    list = list.filter(item => item.clienteNombre.toLowerCase().includes(q))
  }

  // Búsqueda por código
  if (filtroCodigo.value && filtroCodigo.value.trim() !== '') {
    const q = filtroCodigo.value.toLowerCase().trim()
    list = list.filter(item => item.codigo.toLowerCase().includes(q))
  }

  // Búsqueda por fecha exacta de live
  if (filtroFecha.value) {
    const f = filtroFecha.value
    list = list.filter(item => item.fecha && item.fecha.startsWith(f))
  }

  return list
})

// AGRUPAMIENTO POR CLIENTE (Requisito)
const gruposPorCliente = computed(() => {
  const map: Record<string, any> = {}

  listadoFiltrado.value.forEach(item => {
    const cid = item.clienteId
    if (!map[cid]) {
      map[cid] = {
        clienteId: cid,
        clienteNombre: item.clienteNombre,
        items: [],
        totalMonto: 0,
        pendientesPago: 0,
        pendientesRetiro: 0
      }
    }

    map[cid].items.push(item)
    map[cid].totalMonto += Number(item.valor) || 0
    if (item.estadoPago !== 'pagado') map[cid].pendientesPago++
    if (item.estadoRetiro !== 'retirado') map[cid].pendientesRetiro++
  })

  // Retornar en formato de array ordenado por nombre del cliente
  return Object.values(map).sort((a: any, b: any) => a.clienteNombre.localeCompare(b.clienteNombre))
})

// INTERACTIVIDAD: Al activar o desactivar el Checkbox de Pago
function handleTogglePago(row: any, checked: boolean) {
  if (checked) {
    dialogData.ventaId = row.ventaId
    dialogData.monto = row.valor
    dialogData.modoPago = 'Efectivo'
    dialogData.isMasivo = false
    dialogPago.value = true
  } else {
    // Si se desmarca, volver al estado pendiente de pago
    actualizarPagoEnBD(row.ventaId, 'pendiente', null)
  }
}

function cancelarPago() {
  dialogPago.value = false
  // Revertir el estado local de la fila afectada
  const item = listadoUnificado.value.find(i => i.ventaId === dialogData.ventaId)
  if (item) item.isPaidChecked = false
}

async function guardarPago() {
  try {
    if (dialogData.isMasivo) {
      await ejecutarMasivoPago()
    } else {
      await actualizarPagoEnBD(dialogData.ventaId, 'pagado', dialogData.modoPago)
    }
    dialogPago.value = false
  } catch (error) {
    console.error("Error al registrar pago:", error)
  }
}

async function actualizarPagoEnBD(ventaId: string, estado: 'pendiente' | 'pagado', modo: string | null) {
  const payload = {
    estado_pago: estado,
    modo_pago: modo || null,
    fecha_pago: estado === 'pagado' ? new Date().toISOString() : null,
    usuario_pago: estado === 'pagado' ? 'Administrador' : null
  }
  
  const { error } = await supabase.from('new_ventas').update(payload).eq('id', ventaId)
  if (error) {
    $q.notify({ type: 'negative', message: 'Error en base de datos: ' + error.message })
    throw error
  }
  
  $q.notify({ type: 'positive', message: estado === 'pagado' ? 'Pago registrado' : 'Pago revertido' })
  await loadData()
}

// INTERACTIVIDAD: Al activar o desactivar el Checkbox de Retiro
function handleToggleRetiro(row: any, checked: boolean) {
  if (checked) {
    dialogData.ventaId = row.ventaId
    dialogData.retiroId = row.retiroId
    dialogData.quienRetiro = row.clienteNombre
    dialogData.clienteNombre = row.clienteNombre
    dialogData.isMasivo = false
    dialogRetiro.value = true
  } else {
    // Si se desmarca, volver al estado pendiente de retiro
    actualizarRetiroEnBD(row.ventaId, row.retiroId, 'pendiente', null)
  }
}

function cancelarRetiro() {
  dialogRetiro.value = false
  const item = listadoUnificado.value.find(i => i.ventaId === dialogData.ventaId)
  if (item) item.isRetiradoChecked = false
}

async function guardarRetiro() {
  try {
    if (dialogData.isMasivo) {
      await ejecutarMasivoRetiro()
    } else {
      await actualizarRetiroEnBD(dialogData.ventaId, dialogData.retiroId, 'completado', dialogData.quienRetiro)
    }
    dialogRetiro.value = false
  } catch (error) {
    console.error("Error al registrar retiro:", error)
  }
}

async function actualizarRetiroEnBD(ventaId: string, retiroId: string | null, estado: 'pendiente' | 'completado', quien: string | null) {
  if (estado === 'completado') {
    const payload = {
      estado: 'completado',
      retirado_por: quien,
      fecha_retiro: new Date().toISOString()
    }

    if (retiroId) {
      const { error } = await supabase.from('new_retiros').update(payload).eq('id', retiroId)
      if (error) throw error
    } else {
      // Si por alguna razón no tiene ID de retiro (caso raro), insertamos uno
      const { data: v } = await supabase.from('new_ventas').select('*').eq('id', ventaId).single()
      const insertPayload = {
        venta_id: ventaId,
        cliente_id: v?.cliente_id,
        monto: v?.monto || 0,
        estado: 'completado',
        retirado_por: quien,
        fecha: new Date().toISOString(),
        fecha_retiro: new Date().toISOString()
      }
      const { error } = await supabase.from('new_retiros').insert([insertPayload])
      if (error) throw error
    }
    $q.notify({ type: 'positive', message: 'Entrega confirmada con éxito' })
  } else {
    // Revertir a pendiente
    if (retiroId) {
      const payload = {
        estado: 'pendiente',
        retirado_por: null,
        fecha_retiro: null
      }
      const { error } = await supabase.from('new_retiros').update(payload).eq('id', retiroId)
      if (error) throw error
      $q.notify({ type: 'info', message: 'Entrega revertida a pendiente' })
    }
  }
  await loadData()
}

// ACCIONES MASIVAS
function abrirMasivoPago() {
  dialogData.monto = seleccionados.value.reduce((acc, i) => acc + Number(i.valor || 0), 0)
  dialogData.modoPago = 'Efectivo'
  dialogData.isMasivo = true
  dialogPago.value = true
}

async function ejecutarMasivoPago() {
  $q.loading.show({ message: 'Registrando pagos masivos...' })
  try {
    const promesas = seleccionados.value.map(item => {
      const payload = {
        estado_pago: 'pagado',
        modo_pago: dialogData.modoPago,
        fecha_pago: new Date().toISOString(),
        usuario_pago: 'Administrador'
      }
      return supabase.from('new_ventas').update(payload).eq('id', item.ventaId)
    })

    await Promise.all(promesas)
    $q.notify({ type: 'positive', message: `¡Se pagaron ${seleccionados.value.length} productos!` })
    seleccionados.value = []
    await loadData()
  } catch (error: any) {
    console.error("Error masivo pago:", error)
    $q.notify({ type: 'negative', message: 'Error: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

function abrirMasivoRetiro() {
  dialogData.quienRetiro = seleccionados.value[0]?.clienteNombre || ''
  dialogData.isMasivo = true
  dialogRetiro.value = true
}

async function ejecutarMasivoRetiro() {
  $q.loading.show({ message: 'Confirmando entregas masivas...' })
  try {
    const promesas = seleccionados.value.map(item => {
      const payload = {
        estado: 'completado',
        retirado_por: dialogData.quienRetiro || item.clienteNombre,
        fecha_retiro: new Date().toISOString()
      }

      if (item.retiroId) {
        return supabase.from('new_retiros').update(payload).eq('id', item.retiroId)
      } else {
        const insertPayload = {
          venta_id: item.ventaId,
          cliente_id: item.clienteId === '00000000-0000-0000-0000-000000000000' ? null : item.clienteId,
          monto: item.valor || 0,
          estado: 'completado',
          retirado_por: dialogData.quienRetiro || item.clienteNombre,
          fecha: new Date().toISOString(),
          fecha_retiro: new Date().toISOString()
        }
        return supabase.from('new_retiros').insert([insertPayload])
      }
    })

    await Promise.all(promesas)
    $q.notify({ type: 'positive', message: `¡Se entregaron ${seleccionados.value.length} productos!` })
    seleccionados.value = []
    await loadData()
  } catch (error: any) {
    console.error("Error masivo retiro:", error)
    $q.notify({ type: 'negative', message: 'Error: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

function formatCLP(val: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(val)
}

function formatFecha(fecha?: string) {
  if (!fecha) return ''
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

.opacity-80 {
  opacity: 0.8;
}

.opacity-70 {
  opacity: 0.7;
}

.opacity-40 {
  opacity: 0.4;
}

.rounded-none {
  border-radius: 0;
}
</style>
