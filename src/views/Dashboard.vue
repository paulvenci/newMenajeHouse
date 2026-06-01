<template>
  <div class="q-gutter-y-md">
    <!-- Fila superior: Título e Indicador de Carga -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Dashboard Mensual</h1>
        <div class="text-caption text-grey-6">Estadísticas comerciales del mes en curso</div>
      </div>
      <q-btn
        flat
        round
        dense
        icon="refresh"
        color="indigo"
        @click="loadData"
        :loading="loading"
      >
        <q-tooltip>Actualizar Datos</q-tooltip>
      </q-btn>
    </div>

    <!-- Grilla de Tarjetas Estadísticas -->
    <div class="row q-col-gutter-md">
      <!-- Total Ventas -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-indigo-1 text-indigo-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Total Ventas</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ formatCLP(stats.totalVentas) }}</div>
            </div>
            <q-avatar rounded size="48px" class="bg-indigo-2 text-indigo-8">
              <q-icon name="payments" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Total facturado en el mes actual
          </q-card-section>
        </q-card>
      </div>

      <!-- Ventas Live (Pagadas) -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-purple-1 text-purple-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Ventas Live (Pagadas)</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ formatCLP(stats.ventasLive) }}</div>
            </div>
            <q-avatar rounded size="48px" class="bg-purple-2 text-purple-8">
              <q-icon name="live_tv" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Ventas de Lives marcadas como pagadas
          </q-card-section>
        </q-card>
      </div>

      <!-- Ventas Diarias -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-teal-1 text-teal-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Ventas Diarias</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ formatCLP(stats.ventasDiarias) }}</div>
            </div>
            <q-avatar rounded size="48px" class="bg-teal-2 text-teal-8">
              <q-icon name="point_of_sale" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Total recaudado por ventas de mesón/POS
          </q-card-section>
        </q-card>
      </div>

      <!-- Pendiente Pago Live -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-red-1 text-red-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Pendiente Pago Live</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ formatCLP(stats.pendientePagoLive) }}</div>
            </div>
            <q-avatar rounded size="48px" class="bg-red-2 text-red-8">
              <q-icon name="money_off" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Monto pendiente de cobro de los Lives
          </q-card-section>
        </q-card>
      </div>

      <!-- Pendiente Retiro -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-amber-1 text-amber-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Pendientes de Retiro</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ stats.pendienteRetiro }} <span class="text-caption text-weight-medium">unds</span></div>
            </div>
            <q-avatar rounded size="48px" class="bg-amber-2 text-amber-8">
              <q-icon name="local_shipping" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Productos de Live en espera de entrega física
          </q-card-section>
        </q-card>
      </div>

      <!-- Cantidad Ventas Diarias -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card flat bordered class="stat-card bg-light-blue-1 text-light-blue-10">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="text-subtitle2 text-weight-medium opacity-80">Cantidad Ventas Diarias</div>
              <div class="text-h5 text-weight-bolder q-mt-xs">{{ stats.cantidadVentas }} <span class="text-caption text-weight-medium">ventas</span></div>
            </div>
            <q-avatar rounded size="48px" class="bg-light-blue-2 text-light-blue-8">
              <q-icon name="receipt_long" size="sm" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="q-py-xs text-caption opacity-70">
            Cantidad de transacciones POS procesadas
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Gráfico de Ventas Mensuales -->
    <div class="row q-col-gutter-md q-mt-sm">
      <div class="col-12">
        <q-card flat bordered class="rounded-borders shadow-1">
          <q-card-section class="row items-center justify-between q-pb-none">
            <div>
              <div class="text-subtitle1 text-weight-bold text-grey-9">Historial de Ventas Anual</div>
              <div class="text-caption text-grey-6">Comparativa de ingresos mensuales del año en curso ($)</div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <MonthlySalesChart :monthly-sales="monthlySales" v-if="!loadingChart" />
            <div v-else class="flex flex-center" style="height: 320px;">
              <q-spinner-dots color="indigo" size="40px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Zona de Peligro -->
    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12">
        <q-card flat bordered class="bg-red-5 rounded-borders shadow-1" style="border: 1px solid rgba(193, 0, 21, 0.3)">
          <q-card-section class="q-pb-none">
            <div class="text-subtitle1 text-weight-bold text-red-10 flex items-center">
              <q-icon name="warning" size="sm" class="q-mr-sm" />
              Zona de Peligro
            </div>
            <div class="text-caption text-red-9 q-mt-xs">
              Acciones administrativas destructivas. Por favor ten extrema precaución.
            </div>
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-btn
              label="Vaciar Base de Datos de Ventas"
              color="negative"
              icon="delete_forever"
              class="rounded-borders text-weight-bold"
              @click="confirmVaciarVentas"
              :loading="vaciando"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Diálogo de Confirmación para Vaciar -->
    <q-dialog v-model="dialogVaciar" persistent>
      <q-card class="q-pa-sm" style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-red text-white q-py-md text-center rounded-borders">
          <q-icon name="report_problem" size="48px" class="q-mb-sm" />
          <div class="text-h6 text-weight-bold">¿Estás absolutamente seguro?</div>
        </q-card-section>

        <q-card-section class="q-py-lg text-center">
          <p class="text-body2 text-grey-8 q-my-none">
            Esta acción eliminará <strong>TODAS</strong> las ventas del sistema de forma irreversible.
          </p>
          <p class="text-caption text-red text-weight-medium q-mt-sm">
            Los datos históricos serán borrados permanentemente.
          </p>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unevaluated
            label="Sí, eliminar todo"
            color="red"
            class="text-weight-bold rounded-borders"
            @click="ejecutarVaciar"
            :loading="vaciando"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import MonthlySalesChart from '../components/MonthlySalesChart.vue'
import { useVentasStore } from '../stores/ventasStores'
import { useRetirosStore } from '../stores/retirosStore'
import { useClientesStore } from '../stores/clientesStore'
import { useHistorialPosStore } from '../stores/historialPosStore'

const $q = useQuasar()
const ventasStore = useVentasStore()
const retirosStore = useRetirosStore()
const clientesStore = useClientesStore()
const historialPosStore = useHistorialPosStore()

const loading = ref(true)
const loadingChart = ref(true)
const vaciando = ref(false)
const dialogVaciar = ref(false)

const stats = ref({
  totalVentas: 0,
  ventasLive: 0,
  ventasDiarias: 0,
  pendientePagoLive: 0,
  pendienteRetiro: 0,
  cantidadVentas: 0
})

const monthlySales = ref({})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  loadingChart.value = true
  try {
    // Cargar todos los datos desde Supabase
    await Promise.all([
      ventasStore.cargarTodasLasVentas(),
      historialPosStore.cargarVentas(),
      clientesStore.cargarClientes(),
      retirosStore.cargarRetirosDelMes()
    ])

    calculateStats()

    // Cargar historial mensual de ventas para el gráfico
    monthlySales.value = await ventasStore.cargarVentasMensuales()
  } catch (error) {
    console.error("Error al cargar dashboard:", error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar los datos.',
      icon: 'error'
    })
  } finally {
    loading.value = false
    loadingChart.value = false
  }
}

function calculateStats() {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const anioActual = hoy.getFullYear()

  let total = 0
  let livePaid = 0
  let diaria = 0
  let livePendPago = 0
  let pendRetiro = 0
  let cantDiaria = 0

  // 1. Filtrar y procesar ventas Live del mes actual
  ventasStore.ventas.forEach(venta => {
    if (venta.fecha) {
      const ventaDate = new Date(venta.fecha)
      if (ventaDate.getMonth() === mesActual && ventaDate.getFullYear() === anioActual) {
        const monto = Number(venta.monto) || 0
        const esPagada = venta.estado_pago === 'pagado'
        const esLive = venta.tipo === 'Venta Live'

        if (esLive) {
          // Ventas Live pagadas
          if (esPagada) {
            livePaid += monto
          } else {
            // Ventas Live pendientes de pago
            livePendPago += monto
          }
        } else {
          // Compatibilidad con ventas diarias antiguas registradas en new_ventas.
          diaria += monto
          cantDiaria++ // Conteo de transacciones diarias
        }
      }
    }
  })

  // 2. Filtrar y procesar ventas POS del mes actual
  historialPosStore.ventas.forEach(venta => {
    const fechaVenta = venta.fecha_venta || venta.created_at
    if (!fechaVenta) return

    const ventaDate = new Date(fechaVenta)
    if (ventaDate.getMonth() === mesActual && ventaDate.getFullYear() === anioActual) {
      diaria += Number(venta.total) || 0
      cantDiaria++
    }
  })

  // Total ventas = ventas cobradas del mes: Live pagadas + ventas diarias/POS.
  total = livePaid + diaria

  // 3. Filtrar y contar retiros pendientes del mes actual (asociados a ventas de tipo Live)
  retirosStore.retiros.forEach(retiro => {
    if (retiro.fecha) {
      const retiroDate = new Date(retiro.fecha)
      if (retiroDate.getMonth() === mesActual && retiroDate.getFullYear() === anioActual) {
        // Conteo de retiros que siguen pendientes y pertenecen a un Live
        if (retiro.estado === 'pendiente' && retiro.tipoVenta === 'Venta Live') {
          pendRetiro++
        }
      }
    }
  })

  stats.value = {
    totalVentas: total,
    ventasLive: livePaid,
    ventasDiarias: diaria,
    pendientePagoLive: livePendPago,
    pendienteRetiro: pendRetiro,
    cantidadVentas: cantDiaria
  }
}

function confirmVaciarVentas() {
  dialogVaciar.value = true
}

async function ejecutarVaciar() {
  vaciando.value = true
  try {
    await ventasStore.vaciarVentas()
    
    $q.notify({
      type: 'positive',
      message: 'Base de datos de ventas vaciada correctamente.',
      icon: 'check_circle'
    })
    dialogVaciar.value = false
    
    // Reset local
    stats.value = {
      totalVentas: 0,
      ventasLive: 0,
      ventasDiarias: 0,
      pendientePagoLive: 0,
      pendienteRetiro: 0,
      cantidadVentas: 0
    }
    monthlySales.value = {}
    
    await loadData()
  } catch (error: any) {
    console.error("Error al vaciar ventas:", error)
    $q.notify({
      type: 'negative',
      message: 'Error al vaciar datos: ' + error.message,
      icon: 'error'
    })
  } finally {
    vaciando.value = false
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

.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
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
</style>
