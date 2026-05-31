<template>
  <div class="column no-wrap window-height-reportes q-gutter-y-md overflow-hidden">
    <!-- Fila superior: Título -->
    <div class="row justify-between items-center col-auto">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Reportes Comerciales</h1>
        <div class="text-caption text-grey-6">Reporte de caja unificado y datos históricos de ventas</div>
      </div>
      <div class="row q-gutter-sm items-center">
        <!-- Indicador visual del mes consultado -->
        <q-chip color="indigo-1" text-color="indigo-9" class="text-weight-bold q-px-md">
          <q-icon name="calendar_month" class="q-mr-xs" />
          {{ obtenerNombreMesSeleccionado }}
        </q-chip>
      </div>
    </div>

    <!-- TARJETAS DE TOTALES POR CAJA DEL MES -->
    <div class="row q-col-gutter-md col-auto">
      <div 
        v-for="caja in totalesPorCaja" 
        :key="caja.id"
        class="col-12 col-sm-6 col-md-3"
      >
        <q-card flat bordered class="rounded-borders relative-position bg-white text-grey-9 shadow-1 q-pa-sm hover-card">
          <q-card-section class="q-pb-xs">
            <div class="row items-center justify-between no-wrap">
              <span class="text-subtitle2 text-weight-bold text-indigo-7 uppercase">{{ caja.nombre }}</span>
              <q-avatar size="36px" color="indigo-1" text-color="indigo-9">
                <q-icon name="inbox" size="20px" />
              </q-avatar>
            </div>
            <div class="text-h6 text-weight-bolder text-teal-8 q-mt-xs">
              {{ formatCLP(caja.total) }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none q-pb-sm">
            <div class="row justify-between items-center text-caption text-grey-6">
              <span>Live (Pagado):</span>
              <span class="text-weight-bold text-purple-7">{{ formatCLP(caja.live) }}</span>
            </div>
            <div class="row justify-between items-center text-caption text-grey-6 q-mt-xs">
              <span>Diaria (POS):</span>
              <span class="text-weight-bold text-indigo-5">{{ formatCLP(caja.pos) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- PANEL DE FILTROS UNIFICADOS -->
    <q-card flat bordered class="rounded-borders q-pa-md bg-white col-auto">
      <div class="row q-col-gutter-md items-center">
        <!-- Buscador -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="filtros.busqueda"
            label="Buscar por cliente/código/producto..."
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

        <!-- Tipo de Venta -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-select
            v-model="filtros.tipoVenta"
            label="Tipo de Venta"
            outlined
            dense
            color="indigo"
            :options="[
              { value: 'todos', label: 'Todos los tipos' },
              { value: 'Live', label: 'Venta Live' },
              { value: 'POS', label: 'Venta Diaria (POS)' }
            ]"
            emit-value
            map-options
          />
        </div>

        <!-- Método de Pago -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="filtros.metodoPago"
            label="Método de Pago"
            outlined
            dense
            color="indigo"
            :options="[
              { value: 'todos', label: 'Todos los métodos' },
              { value: 'Efectivo', label: 'Efectivo' },
              { value: 'Tarjeta', label: 'Tarjeta (Débito/Crédito)' },
              { value: 'Transferencia', label: 'Transferencia' }
            ]"
            emit-value
            map-options
          />
        </div>

        <!-- Estado de Pago -->
        <div class="col-12 col-sm-6 col-md-2">
          <q-select
            v-model="filtros.estadoPago"
            label="Estado de Pago"
            outlined
            dense
            color="indigo"
            :options="[
              { value: 'todos', label: 'Todos los estados' },
              { value: 'pendiente', label: 'Pendiente' },
              { value: 'pagado', label: 'Pagado' }
            ]"
            emit-value
            map-options
          />
        </div>

        <!-- Selector de Fecha -->
        <div class="col-12 col-sm-6 col-md-2 row items-center no-wrap">
          <q-input
            v-model="filtros.fecha"
            label="Fecha exacta..."
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
              <q-btn flat round dense icon="close" color="grey" v-if="filtros.fecha" @click="filtros.fecha = ''" />
            </template>
          </q-input>
        </div>
      </div>

      <q-separator class="q-my-md opacity-50" />

      <!-- Selección de Rango Mensual -->
      <div class="row q-col-gutter-md items-center justify-end">
        <div class="col-12 col-sm-6 col-md-3 row q-col-gutter-xs">
          <!-- Mes -->
          <div class="col-7">
            <q-select
              v-model="filtros.mes"
              label="Mes de Reporte"
              outlined
              dense
              clearable
              color="indigo"
              :options="mesesOptions"
              emit-value
              map-options
            />
          </div>
          <!-- Año -->
          <div class="col-5">
            <q-select
              v-model="filtros.anio"
              label="Año"
              outlined
              dense
              clearable
              color="indigo"
              :options="['2026', '2027', '2028']"
            />
          </div>
        </div>
      </div>
    </q-card>

    <!-- TABLA INTERACTIVA DE REPORTES UNIFICADOS -->
    <q-card flat bordered class="rounded-borders bg-white overflow-hidden shadow-1 col column no-wrap">
      <q-table
        flat
        :rows="ventasUnificadas"
        :columns="columnsUnificadas"
        row-key="id"
        :loading="loadingLive || loadingPOS"
        :pagination="paginationDefault"
        no-data-label="No se encontraron registros de ventas que coincidan con los filtros"
        loading-label="Cargando reportes..."
        class="table-styled col fit-table"
      >
        <!-- Columna Tipo -->
        <template v-slot:body-cell-tipo="props">
          <q-td :props="props">
            <q-chip
              :color="props.value === 'Live' ? 'purple-7' : 'indigo-6'"
              text-color="white"
              dense
              size="xs"
              class="text-weight-bold text-uppercase"
            >
              {{ props.value === 'Live' ? 'Live' : 'Diaria POS' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Columna Código -->
        <template v-slot:body-cell-codigo="props">
          <q-td :props="props">
            <q-chip 
              outline 
              :color="props.row.tipo === 'Live' ? 'purple' : 'indigo-5'" 
              dense 
              size="xs" 
              class="text-weight-bold"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Columna Caja -->
        <template v-slot:body-cell-caja="props">
          <q-td :props="props">
            <q-chip
              dense
              size="xs"
              color="grey-2"
              text-color="grey-8"
              class="text-weight-medium uppercase"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Columna Valor -->
        <template v-slot:body-cell-monto="props">
          <q-td :props="props" class="text-weight-bold text-teal-8">
            {{ formatCLP(props.value) }}
          </q-td>
        </template>

        <!-- Columna Estado Pago -->
        <template v-slot:body-cell-estado_pago="props">
          <q-td :props="props">
            <q-chip
              :color="props.value === 'pagado' ? 'positive' : 'warning'"
              text-color="white"
              dense
              size="xs"
              class="text-weight-bold text-uppercase"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- Celda de Detalles (Ver ticket POS) -->
        <template v-slot:body-cell-detalles="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.tipo === 'POS'"
              flat
              round
              dense
              icon="zoom_in"
              color="indigo"
              size="sm"
              @click="mostrarDetallePOS(props.row.originalRow)"
            >
              <q-tooltip>Ver productos vendidos</q-tooltip>
            </q-btn>
            <span v-else class="text-grey-4">-</span>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIÁLOGO: Calendario Unificado -->
    <q-dialog v-model="dialogCalendario" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center rounded-borders">
          <q-icon name="event" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Seleccionar Fecha</div>
        </q-card-section>

        <q-card-section class="flex flex-center q-pt-md">
          <q-date
            v-model="filtros.fecha"
            mask="YYYY-MM-DD"
            color="indigo"
            flat
            bordered
            class="full-width"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Limpiar" color="grey-6" @click="filtros.fecha = ''; dialogCalendario = false" />
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn unevaluated label="Aceptar" color="indigo" class="text-weight-bold rounded-borders" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO: Detalle de Productos POS -->
    <q-dialog v-model="dialogDetallePOS" persistent>
      <q-card style="width: 100%; max-width: 550px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center rounded-borders">
          <q-icon name="shopping_cart" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Detalle de Transacción</div>
          <div class="text-caption text-indigo-2">ID Venta: {{ ventaDetalleSeleccionada?.id?.substring(0, 8) }}</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-list separator v-if="ventaDetalleSeleccionada?.detalles && ventaDetalleSeleccionada.detalles.length > 0">
            <q-item v-for="item in ventaDetalleSeleccionada.detalles" :key="item.id" class="q-py-sm">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ item.categoria?.nombre || 'Categoría Desconocida' }}</q-item-label>
                <q-item-label caption v-if="item.descripcion_libre">{{ item.descripcion_libre }}</q-item-label>
                <q-item-label caption class="text-indigo-7">Caja: {{ item.categoria?.caja?.nombre || 'N/A' }}</q-item-label>
              </q-item-section>
              <q-item-section side class="text-right">
                <div class="text-subtitle2 text-weight-bold text-teal-8">{{ formatCLP(item.subtotal) }}</div>
                <div class="text-caption text-grey-7">{{ item.cantidad }}x a {{ formatCLP(item.precio_unitario) }}</div>
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center py-md text-grey">
            No se encontraron productos registrados en esta venta.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useVentasStore } from '../stores/ventasStores'
import { useHistorialPosStore, type VentaPos } from '../stores/historialPosStore'
import { useCategoriasStore } from '../stores/categoriasStore'

const $q = useQuasar()
const ventasStore = useVentasStore()
const historialPosStore = useHistorialPosStore()
const categoriasStore = useCategoriasStore()

const loadingLive = ref(false)
const loadingPOS = ref(false)
const dialogCalendario = ref(false)
const dialogDetallePOS = ref(false)

const ventaDetalleSeleccionada = ref<VentaPos | null>(null)

// Filtros Reactivos Unificados (Por defecto mes y año actual preseleccionados)
const filtros = reactive({
  busqueda: '',
  tipoVenta: 'todos', // 'todos' | 'Live' | 'POS'
  metodoPago: 'todos', // 'todos' | 'Efectivo' | 'Tarjeta' | 'Transferencia'
  estadoPago: 'todos', // 'todos' | 'pendiente' | 'pagado'
  fecha: '',
  mes: String(new Date().getMonth()), // Mes actual por defecto (0-11)
  anio: String(new Date().getFullYear()) // Año actual por defecto (ej. '2026')
})

const paginationDefault = {
  sortBy: 'fecha',
  descending: true,
  rowsPerPage: 10
}

const mesesOptions = [
  { value: '0', label: 'Enero' },
  { value: '1', label: 'Febrero' },
  { value: '2', label: 'Marzo' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Mayo' },
  { value: '5', label: 'Junio' },
  { value: '6', label: 'Julio' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Septiembre' },
  { value: '9', label: 'Octubre' },
  { value: '10', label: 'Noviembre' },
  { value: '11', label: 'Diciembre' }
]

const columnsUnificadas = [
  { name: 'fecha', label: 'Fecha Venta', field: 'fecha', align: 'left' as const, format: (val: string) => formatFecha(val), sortable: true },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'center' as const, sortable: true },
  { name: 'cliente', label: 'Detalle / Cliente', field: 'cliente', align: 'left' as const, sortable: true },
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left' as const, sortable: true },
  { name: 'caja', label: 'Caja', field: 'caja', align: 'left' as const, sortable: true },
  { name: 'monto', label: 'Valor', field: 'monto', align: 'right' as const, sortable: true },
  { name: 'metodo_pago', label: 'Método Pago', field: 'metodo_pago', align: 'center' as const, format: (val: string) => val ? formatMetodo(val) : 'N/A', sortable: true },
  { name: 'estado_pago', label: 'Estado', field: 'estado_pago', align: 'center' as const, sortable: true },
  { name: 'detalles', label: 'Ver Ticket', field: 'id', align: 'center' as const }
]

onMounted(async () => {
  $q.loading.show({ message: 'Preparando reportes...' })
  try {
    loadingLive.value = true
    loadingPOS.value = true
    await Promise.all([
      ventasStore.cargarTodasLasVentas(),
      historialPosStore.cargarVentas(),
      categoriasStore.cargarCajas()
    ])
  } catch (error) {
    console.error("Error al cargar datos en reportes:", error)
  } finally {
    loadingLive.value = false
    loadingPOS.value = false
    $q.loading.hide()
  }
})

// Traducir nombres de métodos de pago
function formatMetodo(val: string) {
  const v = val.toLowerCase()
  if (v.includes('efectivo')) return 'Efectivo'
  if (v.includes('tarjeta') || v.includes('débito') || v.includes('crédito')) return 'Tarjeta'
  if (v.includes('transferencia') || v.includes('transfer')) return 'Transferencia'
  return val
}

// Obtener nombre del mes consultado para el título
const obtenerNombreMesSeleccionado = computed(() => {
  if (filtros.mes === null || filtros.mes === '') return 'Todo el Historial'
  const mesObj = mesesOptions.find(m => m.value === filtros.mes)
  const anioStr = filtros.anio ? ` ${filtros.anio}` : ''
  return mesObj ? `${mesObj.label}${anioStr}` : `Mes ${filtros.mes}${anioStr}`
})

// Traducir caja asociada a ventas POS
function obtenerCajaPOS(v: VentaPos): string {
  if (!v.detalles || v.detalles.length === 0) return 'Sin Caja'
  const nombres = v.detalles
    .map(d => d.categoria?.caja?.nombre)
    .filter((n): n is string => typeof n === 'string' && n.trim() !== '')
  const cajasSet = new Set(nombres)
  if (cajasSet.size === 0) return 'Sin Caja'
  if (cajasSet.size === 1) return Array.from(cajasSet)[0]
  return 'Múltiples Cajas'
}

// LÓGICA DE COMPUTED: Totales por Caja del Mes (Sólo Ventas POS y Live PAGADAS - Requisito)
const totalesPorCaja = computed(() => {
  // Inicializamos acumuladores de las cajas del sistema
  const cajasAcumuladas = categoriasStore.cajas.map(c => ({
    id: c.id,
    nombre: c.nombre,
    total: 0,
    live: 0,
    pos: 0
  }))

  const mesSeleccionado = filtros.mes !== null && filtros.mes !== '' ? Number(filtros.mes) : null
  const anioSeleccionado = filtros.anio !== null && filtros.anio !== '' ? Number(filtros.anio) : null

  // 1. Acumular ventas Live (SÓLO las PAGADAS - Requisito explícito)
  const ventasLiveValidas = ventasStore.ventas.filter(v => {
    if (v.tipo !== 'Venta Live' || v.estado_pago !== 'pagado' || !v.fecha) return false
    const d = new Date(v.fecha)
    const matchMes = mesSeleccionado === null || d.getMonth() === mesSeleccionado
    const matchAnio = anioSeleccionado === null || d.getFullYear() === anioSeleccionado
    return matchMes && matchAnio
  })

  ventasLiveValidas.forEach(v => {
    const caja = cajasAcumuladas.find(c => c.id === v.caja_id)
    if (caja) {
      caja.live += v.monto
      caja.total += v.monto
    }
  })

  // 2. Acumular ventas POS (Diarias) a partir del desglose de productos
  const ventasPOSValidas = historialPosStore.ventas.filter(v => {
    if (!v.fecha_venta) return false
    const d = new Date(v.fecha_venta)
    const matchMes = mesSeleccionado === null || d.getMonth() === mesSeleccionado
    const matchAnio = anioSeleccionado === null || d.getFullYear() === anioSeleccionado
    return matchMes && matchAnio
  })

  ventasPOSValidas.forEach(v => {
    if (v.detalles) {
      v.detalles.forEach(d => {
        const cajaId = d.categoria?.caja_id
        if (cajaId) {
          const caja = cajasAcumuladas.find(c => c.id === cajaId)
          if (caja) {
            caja.pos += d.subtotal || 0
            caja.total += d.subtotal || 0
          }
        }
      })
    }
  })

  return cajasAcumuladas
})

// LÓGICA DE COMPUTED: Ventas Unificadas con Filtros Aplicados
const ventasUnificadas = computed(() => {
  const liveMapeadas = ventasStore.ventas.map(v => {
    const cajaNombre = categoriasStore.cajas.find(c => c.id === v.caja_id)?.nombre || 'Sin Caja'
    return {
      id: v.id || '',
      fecha: v.fecha || '',
      monto: v.monto,
      tipo: 'Live' as const,
      cliente: v.cliente || 'Cliente desconocido',
      codigo: v.codigo,
      metodo_pago: v.modo_pago || v.modoPago || 'pendiente',
      estado_pago: v.estado_pago || 'pendiente',
      caja: cajaNombre,
      caja_id: v.caja_id,
      originalRow: v
    }
  })

  const posMapeadas = historialPosStore.ventas.map(v => {
    return {
      id: v.id,
      fecha: v.fecha_venta || v.created_at || '',
      monto: v.total,
      tipo: 'POS' as const,
      cliente: 'Venta POS (Punto de Venta)',
      codigo: 'Múltiples Productos',
      metodo_pago: v.metodo_pago,
      estado_pago: 'pagado',
      caja: obtenerCajaPOS(v),
      caja_id: undefined,
      originalRow: v
    }
  })

  let list = [...liveMapeadas, ...posMapeadas]

  // APLICAR FILTROS
  // 1. Buscador de texto
  if (filtros.busqueda && filtros.busqueda.trim() !== '') {
    const q = filtros.busqueda.toLowerCase().trim()
    list = list.filter(v => {
      const matchCliente = v.cliente.toLowerCase().includes(q)
      const matchCodigo = v.codigo.toLowerCase().includes(q)
      const matchCaja = v.caja.toLowerCase().includes(q)
      
      let matchDetalles = false
      if (v.tipo === 'POS' && v.originalRow.detalles) {
        matchDetalles = v.originalRow.detalles.some((d: any) => 
          (d.categoria?.nombre && d.categoria.nombre.toLowerCase().includes(q)) ||
          (d.descripcion_libre && d.descripcion_libre.toLowerCase().includes(q))
        )
      }
      return matchCliente || matchCodigo || matchCaja || matchDetalles
    })
  }

  // 2. Tipo de venta
  if (filtros.tipoVenta && filtros.tipoVenta !== 'todos') {
    list = list.filter(v => v.tipo === filtros.tipoVenta)
  }

  // 3. Método de pago
  if (filtros.metodoPago && filtros.metodoPago !== 'todos') {
    list = list.filter(v => {
      const mp = v.metodo_pago.toLowerCase()
      const fm = filtros.metodoPago.toLowerCase()
      if (fm === 'tarjeta') {
        return mp.includes('tarjeta') || mp.includes('débito') || mp.includes('crédito')
      }
      return mp.includes(fm)
    })
  }

  // 4. Estado de pago
  if (filtros.estadoPago && filtros.estadoPago !== 'todos') {
    list = list.filter(v => v.estado_pago === filtros.estadoPago)
  }

  // 5. Fecha exacta
  if (filtros.fecha) {
    const f = filtros.fecha
    list = list.filter(v => v.fecha && v.fecha.startsWith(f))
  }

  // 6. Mes
  if (filtros.mes !== null && filtros.mes !== '') {
    const m = Number(filtros.mes)
    list = list.filter(v => {
      if (!v.fecha) return false
      const d = new Date(v.fecha)
      return d.getMonth() === m
    })
  }

  // 7. Año
  if (filtros.anio) {
    const a = Number(filtros.anio)
    list = list.filter(v => {
      if (!v.fecha) return false
      const d = new Date(v.fecha)
      return d.getFullYear() === a
    })
  }

  // Ordenar cronológicamente descendente
  return list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

function mostrarDetallePOS(row: VentaPos) {
  ventaDetalleSeleccionada.value = row
  dialogDetallePOS.value = true
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

.window-height-reportes {
  height: calc(100vh - 90px);
  min-height: 500px;
}

.table-styled {
  border-radius: 0;
  box-shadow: none;
}

.fit-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Hacer scroll vertical interno en el cuerpo de la tabla */
.fit-table :deep(.q-table__middle) {
  flex-grow: 1;
  overflow-y: auto;
}

/* Fijar la cabecera arriba para que no se desplace al scrollear */
.fit-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: bold;
  background-color: #f5f5f5;
  color: #333333;
}

.hover-card {
  transition: all 0.25s ease-in-out;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08) !important;
}
</style>
