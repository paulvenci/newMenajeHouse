<template>
  <div class="q-gutter-y-md">
    <!-- Fila superior: Título y Acciones -->
    <div class="row items-center justify-between q-mb-sm">
      <div>
        <h1 class="text-h5 text-weight-bold text-grey-9 q-my-none">Gestión de Ventas Live</h1>
        <div class="text-caption text-grey-6">Transmisión en vivo y asignación de productos en tiempo real</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="calendar_month"
          label="Filtrar Fecha"
          @click="dialogFiltro = true"
          unevaluated
          class="rounded-borders"
        />
        <q-btn
          color="indigo-7"
          icon="person_add"
          label="Nuevo Cliente"
          @click="abrirNuevoClienteDialog"
          unevaluated
          class="rounded-borders"
        />
        <q-btn
          color="info"
          icon="group"
          label="Agrupar"
          @click="agruparVentas"
          unevaluated
          class="rounded-borders"
        />
      </div>
    </div>



    <!-- AREA PRINCIPAL: Formulario y Ventas Registradas -->
    <div class="row q-col-gutter-md">
      <!-- Formulario de Registro (Lado Izquierdo) -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="rounded-borders q-pa-md bg-white h-100">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md flex items-center">
            <q-icon :name="ventaEditandoId ? 'edit' : 'add_circle'" :color="ventaEditandoId ? 'warning' : 'primary'" size="sm" class="q-mr-xs" />
            {{ ventaEditandoId ? 'Editar Venta Live' : 'Registrar Venta Live' }}
          </div>

          <q-form @submit.prevent="registrarVenta" ref="formVenta" class="q-gutter-md">
            <!-- Monto -->
            <q-input
              v-model.number="nuevaVenta.monto"
              type="number"
              label="Monto ($)"
              outlined
              dense
              prefix="$"
              color="indigo"
              :rules="[val => val !== null && val !== '' || 'El monto es obligatorio']"
              lazy-rules
              autofocus
            />

            <!-- Código -->
            <q-input
              v-model="nuevaVenta.codigo"
              label="Código del Producto"
              outlined
              dense
              color="indigo"
              :rules="[val => !!val || 'El código es obligatorio']"
              lazy-rules
              clearable
            />

            <!-- Caja (Requisito) -->
            <q-select
              v-model="nuevaVenta.caja"
              label="Seleccionar Caja"
              outlined
              dense
              color="indigo"
              :options="cajasOptions"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              :rules="[val => !!val || 'La caja es obligatoria']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="inbox" color="indigo-4" />
              </template>
            </q-select>

            <!-- Cliente Opcional en el Registro -->
            <q-select
              v-model="nuevaVenta.cliente_id"
              label="Asignar Cliente (Opcional)"
              outlined
              dense
              color="indigo"
              :options="clientesOptions"
              option-value="id"
              option-label="nombre"
              emit-value
              map-options
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="person" color="indigo-4" />
              </template>
            </q-select>

            <!-- Botones -->
            <div class="row q-col-gutter-sm q-mt-md">
              <div class="col">
                <q-btn
                  type="submit"
                  :color="ventaEditandoId ? 'warning' : 'indigo-7'"
                  :label="ventaEditandoId ? 'Actualizar Venta' : 'Registrar Venta'"
                  :icon="ventaEditandoId ? 'edit' : 'save'"
                  class="full-width rounded-borders text-weight-bold"
                  unevaluated
                  :loading="registrando"
                />
              </div>
              <div class="col-auto" v-if="ventaEditandoId">
                <q-btn
                  flat
                  color="grey-7"
                  label="Cancelar"
                  class="rounded-borders text-weight-bold"
                  @click="cancelarEdicion"
                />
              </div>
            </div>
          </q-form>
        </q-card>
      </div>

      <!-- Ventas Registradas (Lado Derecho) -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="rounded-borders q-pa-md bg-white h-100 column" style="display: flex; flex-direction: column;">
          <!-- Cabecera de la lista con budgets integrados como chips a la derecha -->
          <div class="row items-center justify-between q-col-gutter-y-xs q-mb-md">
            <!-- Título y contador de ítems -->
            <div class="row items-center q-gutter-x-sm">
              <div class="text-subtitle1 text-weight-bold text-grey-9 flex items-center">
                <q-icon name="list" color="indigo-7" size="sm" class="q-mr-xs" />
                Ventas Registradas del Live
              </div>
              <q-chip color="indigo-1" text-color="indigo-9" dense class="text-weight-bold">
                {{ ventasFiltradas.length }} ítems
              </q-chip>
            </div>

            <!-- Budgets en formato chips compactos a la derecha con iconos y tooltips -->
            <div class="row items-center q-gutter-xs">
              <q-chip color="indigo-1" text-color="indigo-9" class="text-weight-bold" dense icon="monetization_on">
                {{ formatCLP(totalesLive.valorOfrecido) }}
                <q-tooltip anchor="top middle" self="bottom middle">Valor total ofrecido</q-tooltip>
              </q-chip>
              <q-chip color="teal-1" text-color="teal-9" class="text-weight-bold" dense icon="assignment_turned_in">
                {{ formatCLP(totalesLive.valorAsignado) }}
                <q-tooltip anchor="top middle" self="bottom middle">Valor total asignado</q-tooltip>
              </q-chip>
              <q-chip color="purple-1" text-color="purple-9" class="text-weight-bold" dense icon="shopping_bag">
                {{ totalesLive.itemsOfrecidos }} unds
                <q-tooltip anchor="top middle" self="bottom middle">Total de ítems ofrecidos</q-tooltip>
              </q-chip>
              <q-chip color="amber-1" text-color="amber-9" class="text-weight-bold" dense icon="people">
                {{ totalesLive.itemsAsignados }} unds
                <q-tooltip anchor="top middle" self="bottom middle">Total de ítems asignados</q-tooltip>
              </q-chip>
            </div>
          </div>

          <!-- Buscador y filtro rápido -->
          <q-input
            v-model="busqueda"
            placeholder="Buscar por código o cliente..."
            outlined
            dense
            clearable
            class="q-mb-sm"
            color="indigo"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <!-- Listado con scroll -->
          <div class="flex-grow-1 overflow-y-auto q-pr-sm" style="max-height: 480px; min-height: 250px;">
            <q-list separator v-if="ventasFiltradas.length > 0">
              <q-item
                v-for="venta in ventasFiltradas"
                :key="venta.id"
                class="q-py-sm q-px-md items-center transition-swing list-item-hover"
                style="border-radius: 8px; margin-bottom: 6px; border: 1px solid #f0f0f0; background-color: #fafafa; width: 100%;"
              >
                <!-- Contenedor principal de la fila -->
                <div class="row items-center full-width no-wrap q-col-gutter-md">
                  <!-- Código de producto al inicio -->
                  <div class="col-auto text-weight-bold text-subtitle2 text-indigo-10" style="min-width: 50px;">
                    #{{ venta.codigo }}
                  </div>

                  <!-- Asignación de Cliente interactiva (ocupa todo el espacio restante) -->
                  <div class="col">
                    <q-select
                      v-model="venta.cliente_id"
                      :options="clientesOptions"
                      option-value="id"
                      option-label="nombre"
                      emit-value
                      map-options
                      dense
                      outlined
                      options-dense
                      class="client-inline-select-new full-width"
                      @update:model-value="(val) => actualizarClienteEnVenta(venta.id!, val)"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" size="xs" color="indigo-7" />
                      </template>
                    </q-select>
                  </div>

                  <!-- Monto destacado -->
                  <div class="col-auto text-right">
                    <div class="text-subtitle1 text-weight-bold text-teal-8">
                      {{ formatCLP(venta.monto) }}
                    </div>
                  </div>

                  <!-- Fecha despues de monto -->
                  <div class="col-auto text-caption text-grey-6 flex items-center">
                    <q-icon name="schedule" size="xs" class="q-mr-xs" />
                    {{ formatFecha(venta.fecha) }}
                  </div>

                  <!-- Botones de Acción -->
                  <div class="col-auto text-right flex items-center justify-end q-gutter-xs">
                    <!-- Imprimir -->
                    <q-btn
                      flat
                      round
                      dense
                      icon="print"
                      color="indigo"
                      size="sm"
                      @click="imprimirTicket(venta)"
                    >
                      <q-tooltip>Imprimir Ticket</q-tooltip>
                    </q-btn>

                    <!-- Editar -->
                    <q-btn
                      flat
                      round
                      dense
                      icon="edit"
                      color="warning"
                      size="sm"
                      @click="cargarEdicion(venta)"
                    >
                      <q-tooltip>Editar</q-tooltip>
                    </q-btn>

                    <!-- Eliminar -->
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="confirmarEliminarVenta(venta.id!)"
                    >
                      <q-tooltip>Eliminar</q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-item>
            </q-list>

            <div v-else class="flex flex-center text-grey-6 py-xl" style="min-height: 200px;">
              <div class="text-center">
                <q-icon name="live_help" size="64px" class="q-mb-sm opacity-50" />
                <div class="text-subtitle1 text-weight-bold">No hay Ventas</div>
                <div class="text-caption">Registra ventas en el panel izquierdo o cambia el filtro</div>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- DIÁLOGO: Filtrar por Fecha -->
    <q-dialog v-model="dialogFiltro" persistent>
      <q-card class="q-pa-sm" style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center rounded-borders">
          <q-icon name="calendar_today" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Cargar Ventas del Live</div>
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
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unevaluated
            label="Cargar"
            color="indigo"
            class="text-weight-bold rounded-borders"
            @click="cargarVentasFiltradasPorFecha"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- DIÁLOGO: Crear Nuevo Cliente Rápido -->
    <q-dialog v-model="dialogNuevoCliente" persistent>
      <q-card style="width: 100%; max-width: 400px; border-radius: 12px;">
        <q-card-section class="bg-indigo text-white q-py-md text-center rounded-borders">
          <q-icon name="person_add" size="md" class="q-mb-xs" />
          <div class="text-h6 text-weight-bold">Agregar Nuevo Cliente</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="guardarNuevoCliente" class="q-gutter-md">
            <q-input
              v-model="nuevoCliente.nombre"
              label="Nombre del Cliente"
              outlined
              dense
              color="indigo"
              :rules="[val => !!val || 'El nombre es obligatorio']"
              lazy-rules
              autofocus
            />
            <q-input
              v-model="nuevoCliente.telefono"
              label="Teléfono (Opcional)"
              outlined
              dense
              color="indigo"
            />
            <q-input
              v-model="nuevoCliente.email"
              label="Email (Opcional)"
              outlined
              dense
              color="indigo"
            />

            <q-card-actions align="right" class="q-px-none q-pb-none q-mt-md">
              <q-btn flat label="Cancelar" color="grey-7" @click="dialogNuevoCliente = false" />
              <q-btn
                type="submit"
                unevaluated
                label="Guardar"
                color="indigo"
                class="text-weight-bold rounded-borders"
                :loading="guardandoCliente"
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- SECCIÓN: Resumen por Cliente (Agrupado) -->
    <div class="row q-mt-md" v-if="resumenVentas.length > 0">
      <div class="col-12">
        <q-card flat bordered class="rounded-borders bg-white q-pa-md">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md flex items-center">
            <q-icon name="pie_chart" color="info" size="sm" class="q-mr-xs" />
            Resumen por Cliente
          </div>

          <q-list bordered class="rounded-borders">
            <q-expansion-item
              v-for="(resumen, index) in resumenVentas"
              :key="index"
              group="resumenes"
              header-class="bg-grey-1"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-avatar color="info" text-color="white" size="sm">
                    <q-icon name="person" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-subtitle2 text-weight-bold">{{ resumen.cliente }}</q-item-label>
                  <q-item-label caption>{{ resumen.ventas.length }} compras registradas</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-subtitle2 text-weight-bold text-teal-8">{{ formatCLP(resumen.total) }}</span>
                    <q-chip color="info" text-color="white" dense size="xs" class="text-weight-bold">
                      {{ resumen.ventas.length }} ventas
                    </q-chip>
                  </div>
                </q-item-section>
              </template>

              <q-card>
                <q-card-section>
                  <q-input
                    v-model="resumen.texto"
                    type="textarea"
                    label="Mensaje para el cliente"
                    outlined
                    rows="8"
                    autogrow
                    class="q-mb-md"
                  />
                  <div class="row justify-end">
                    <q-btn
                      color="primary"
                      icon="content_copy"
                      label="Copiar Mensaje"
                      @click="copiarTexto(resumen.texto)"
                      unevaluated
                      class="rounded-borders"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useClientesStore } from '../stores/clientesStore'
import { useCategoriasStore } from '../stores/categoriasStore'
import { useVentasStore, type Venta } from '../stores/ventasStores'
import { supabase } from '../supabase'

const $q = useQuasar()
const clientesStore = useClientesStore()
const categoriasStore = useCategoriasStore()
const ventasStore = useVentasStore()

const registrando = ref(false)
const guardandoCliente = ref(false)
const dialogFiltro = ref(false)
const dialogNuevoCliente = ref(false)

const filtroFecha = ref(new Date().toISOString().substring(0, 10))
const busqueda = ref('')
const ventaEditandoId = ref<string | null>(null)

// Interfaces para agrupamiento
interface Resumen {
  cliente: string
  total: number
  ventas: Venta[]
  texto: string
}
const resumenVentas = ref<Resumen[]>([])

const nuevaVenta = reactive({
  monto: null as number | null,
  codigo: '',
  caja: null as string | null,
  cliente_id: null as string | null
})

const nuevoCliente = reactive({
  nombre: '',
  telefono: '',
  email: ''
})

onMounted(async () => {
  $q.loading.show({ message: 'Cargando información del Live...' })
  try {
    await Promise.all([
      clientesStore.cargarClientes(),
      categoriasStore.cargarCajas(),
      ventasStore.cargarVentasDelDia() // Cargar las de hoy por defecto
    ])

    // Asignar caja Menaje por defecto si existe
    const cajaMenaje = categoriasStore.cajas.find(c => c.nombre.toLowerCase().includes('menaje'))
    if (cajaMenaje) {
      nuevaVenta.caja = cajaMenaje.id
    }
  } catch (error) {
    console.error("Error al montar vista Ventas Live:", error)
  } finally {
    $q.loading.hide()
  }
})

// Opciones de Cajas cargadas dinámicamente
const cajasOptions = computed(() => {
  return categoriasStore.cajas
})

// Opciones de Clientes agregando "Cliente Desconocido" (Requisito)
const clientesOptions = computed(() => {
  const options = [{ id: '00000000-0000-0000-0000-000000000000', nombre: 'Cliente Desconocido' }]
  clientesStore.clientes.forEach(c => {
    options.push({ id: c.id, nombre: c.nombre })
  })
  return options
})

// Filtrado rápido por texto
const ventasFiltradas = computed(() => {
  let list = ventasStore.ventas.filter(v => v.tipo === 'Venta Live')
  
  if (busqueda.value && busqueda.value.trim() !== '') {
    const query = busqueda.value.toLowerCase().trim()
    list = list.filter(v => 
      v.codigo.toLowerCase().includes(query) ||
      (v.cliente && v.cliente.toLowerCase().includes(query))
    )
  }
  return list
})

// CÁLCULO DE LOS WIDGETS DE TOTALES (Budgets requeridos)
const totalesLive = computed(() => {
  let valorOfrecido = 0
  let valorAsignado = 0
  let itemsOfrecidos = 0
  let itemsAsignados = 0

  ventasFiltradas.value.forEach(v => {
    const monto = Number(v.monto) || 0
    itemsOfrecidos++
    valorOfrecido += monto

    // Ítems con cliente asignado (que no sea "Cliente Desconocido" o nulo)
    const tieneCliente = v.cliente_id && v.cliente_id !== '00000000-0000-0000-0000-000000000000'
    if (tieneCliente) {
      itemsAsignados++
      valorAsignado += monto
    }
  })

  return {
    valorOfrecido,
    valorAsignado,
    itemsOfrecidos,
    itemsAsignados
  }
})

async function registrarVenta() {
  if (nuevaVenta.monto === null || !nuevaVenta.codigo || !nuevaVenta.caja) {
    $q.notify({ type: 'warning', message: 'Por favor completa todos los campos' })
    return
  }

  registrando.value = true
  try {
    // Si es "Cliente Desconocido", poner null para guardar en base de datos
    const clienteId = nuevaVenta.cliente_id === '00000000-0000-0000-0000-000000000000' ? null : nuevaVenta.cliente_id

    const ventaData: Venta = {
      monto: nuevaVenta.monto,
      codigo: nuevaVenta.codigo.trim(),
      caja_id: nuevaVenta.caja,
      cliente_id: clienteId || undefined,
      tipo: 'Venta Live'
    }

    if (ventaEditandoId.value) {
      // Modificar existente
      await ventasStore.actualizarVenta(ventaEditandoId.value, ventaData)
      $q.notify({ type: 'positive', message: 'Venta actualizada correctamente' })
      ventaEditandoId.value = null
    } else {
      // Crear nueva venta
      await ventasStore.agregarVenta(ventaData)
      $q.notify({ type: 'positive', message: 'Venta registrada con éxito' })

      // Generar retiro pendiente automáticamente si tiene un cliente asignado
      if (clienteId) {
        // Buscar el ID de la venta recién insertada
        const ventaReciente = ventasStore.ventas[0]
        if (ventaReciente && ventaReciente.id) {
          const retiroPayload = {
            venta_id: ventaReciente.id,
            cliente_id: clienteId,
            monto: nuevaVenta.monto,
            estado: 'pendiente',
            fecha: new Date().toISOString()
          }
          const { error: errorRetiro } = await supabase.from('new_retiros').insert([retiroPayload])
          if (errorRetiro) console.error("Error al crear retiro automático:", errorRetiro)
        }
      }
    }

    // Resetear formulario
    nuevaVenta.monto = null
    nuevaVenta.codigo = ''
    const cajaMenaje = categoriasStore.cajas.find(c => c.nombre.toLowerCase().includes('menaje'))
    nuevaVenta.caja = cajaMenaje ? cajaMenaje.id : null
    nuevaVenta.cliente_id = null

    // Recargar datos locales
    await cargarDatosActuales()
  } catch (error: any) {
    console.error("Error al registrar venta live:", error)
    $q.notify({ type: 'negative', message: 'Error al registrar: ' + error.message })
  } finally {
    registrando.value = false
  }
}

// Acción del q-select interactivo en el listado de ventas (Requisito)
async function actualizarClienteEnVenta(ventaId: string, clienteId: string | null) {
  try {
    const finalClienteId = clienteId === '00000000-0000-0000-0000-000000000000' ? null : clienteId
    
    // 1. Actualizar venta
    await ventasStore.actualizarVenta(ventaId, { cliente_id: finalClienteId || undefined })
    
    // 2. Gestionar retiro de forma reactiva en Supabase
    if (finalClienteId) {
      // Verificar si ya existe un retiro asociado a esta venta
      const { data: retirosExistentes } = await supabase
        .from('new_retiros')
        .select('id')
        .eq('venta_id', ventaId)

      if (retirosExistentes && retirosExistentes.length > 0) {
        // Actualizar el cliente del retiro existente
        await supabase
          .from('new_retiros')
          .update({ cliente_id: finalClienteId })
          .eq('venta_id', ventaId)
      } else {
        // Crear nuevo retiro pendiente
        const { data: v } = await supabase.from('new_ventas').select('monto').eq('id', ventaId).single()
        const retiroPayload = {
          venta_id: ventaId,
          cliente_id: finalClienteId,
          monto: v?.monto || 0,
          estado: 'pendiente',
          fecha: new Date().toISOString()
        }
        await supabase.from('new_retiros').insert([retiroPayload])
      }
    } else {
      // Si se desasigna el cliente (vuelve a Desconocido), eliminar el retiro
      await supabase.from('new_retiros').delete().eq('venta_id', ventaId)
    }

    $q.notify({
      type: 'positive',
      message: 'Cliente reasignado correctamente',
      icon: 'person_outline',
      position: 'bottom-right',
      timeout: 1000
    })

    await cargarDatosActuales()
  } catch (error: any) {
    console.error("Error al reasignar cliente:", error)
    $q.notify({ type: 'negative', message: 'No se pudo reasignar: ' + error.message })
  }
}

function cargarEdicion(venta: Venta) {
  nuevaVenta.monto = venta.monto
  nuevaVenta.codigo = venta.codigo
  nuevaVenta.caja = venta.caja_id || null
  nuevaVenta.cliente_id = venta.cliente_id || '00000000-0000-0000-0000-000000000000'
  ventaEditandoId.value = venta.id || null
}

function cancelarEdicion() {
  nuevaVenta.monto = null
  nuevaVenta.codigo = ''
  const cajaMenaje = categoriasStore.cajas.find(c => c.nombre.toLowerCase().includes('menaje'))
  nuevaVenta.caja = cajaMenaje ? cajaMenaje.id : null
  nuevaVenta.cliente_id = null
  ventaEditandoId.value = null
}

function confirmarEliminarVenta(id: string) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que deseas eliminar esta venta permanentemente?',
    cancel: true,
    persistent: true,
    ok: { label: 'Eliminar', color: 'negative', unevaluated: true }
  }).onOk(async () => {
    try {
      await ventasStore.eliminarVenta(id)
      $q.notify({ type: 'positive', message: 'Venta eliminada del Live' })
      await cargarDatosActuales()
    } catch (error: any) {
      $q.notify({ type: 'negative', message: 'Error al eliminar: ' + error.message })
    }
  })
}

async function cargarVentasFiltradasPorFecha() {
  if (!filtroFecha.value) return
  $q.loading.show({ message: 'Buscando ventas del Live...' })
  try {
    const inicioDia = new Date(filtroFecha.value).toISOString()
    const finDia = new Date(new Date(filtroFecha.value).getTime() + 86399000).toISOString()

    const { data, error } = await supabase
      .from('new_ventas')
      .select('*, clientes:new_clientes(nombre)')
      .gte('fecha', inicioDia)
      .lte('fecha', finDia)
      .order('fecha', { ascending: false })

    if (error) throw error

    ventasStore.ventas = data.map((v: any) => ({
      id: v.id,
      ...v,
      monto: Number(v.monto) || 0,
      cliente: v.clientes?.nombre || 'Cliente desconocido',
      modoPago: v.modo_pago,
      estado_pago: v.estado_pago,
      fecha_pago: v.fecha_pago,
      usuario_pago: v.usuario_pago
    })) as Venta[]
  } catch (error: any) {
    console.error("Error al cargar fecha:", error)
    $q.notify({ type: 'negative', message: 'Error: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

async function cargarDatosActuales() {
  await Promise.all([
    ventasStore.cargarVentasDelDia(),
    clientesStore.cargarClientes()
  ])
}

function abrirNuevoClienteDialog() {
  nuevoCliente.nombre = ''
  nuevoCliente.telefono = ''
  nuevoCliente.email = ''
  dialogNuevoCliente.value = true
}

async function guardarNuevoCliente() {
  if (!nuevoCliente.nombre) return
  guardandoCliente.value = true
  try {
    await clientesStore.agregarCliente(
      nuevoCliente.nombre.trim(),
      nuevoCliente.email.trim(),
      nuevoCliente.telefono.trim()
    )
    $q.notify({ type: 'positive', message: 'Cliente agregado con éxito' })
    dialogNuevoCliente.value = false
  } catch (error: any) {
    $q.notify({ type: 'negative', message: 'Error: ' + error.message })
  } finally {
    guardandoCliente.value = false
  }
}

function imprimirTicket(venta: Venta) {
  if (!venta) return
  const ticketHTML = `
    <html>
      <head>
        <title>Imprimir Ticket Live</title>
        <style>
          body { font-family: sans-serif; padding: 10px; font-size: 14px; line-height: 1.2; }
          p { margin: 4px 0; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <p><span class="bold">Menaje House Live</span></p>
        <p><span class="bold">Fecha:</span> ${formatFecha(venta.fecha)}</p>
        <p><span class="bold">Código:</span> ${venta.codigo}</p>
        <p><span class="bold">Monto:</span> ${formatCLP(venta.monto)}</p>
        <p><span class="bold">Cliente:</span> ${venta.cliente || 'Cliente desconocido'}</p>
        <br/>
      </body>
    </html>
  `
  const win = window.open('', '_blank')
  if (win) {
    win.document.open()
    win.document.write(ticketHTML)
    win.document.close()
    win.onload = () => {
      win.print()
      win.close()
    }
  } else {
    $q.notify({ type: 'negative', message: 'Popups bloqueados. Habilita popups para imprimir.' })
  }
}

function formatCLP(val: number | null) {
  if (val === null) return '$0'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(val)
}

function formatFecha(fecha?: string) {
  if (!fecha) return ''
  const d = new Date(fecha)
  const hoy = new Date()
  
  if (d.toDateString() === hoy.toDateString()) {
    return 'Hoy'
  }
  
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Función para agrupar ventas por cliente (misma funcionalidad de la app antigua)
function agruparVentas() {
  const ventasLive = ventasFiltradas.value
  const grupos: Record<string, Venta[]> = {}

  ventasLive.forEach((v) => {
    const nombreCliente = v.cliente || 'Cliente desconocido'
    // Excluir "Cliente desconocido" del agrupamiento
    if (nombreCliente === 'Cliente desconocido') return
    if (!grupos[nombreCliente]) grupos[nombreCliente] = []
    grupos[nombreCliente].push(v)
  })

  resumenVentas.value = Object.entries(grupos).map(([cliente, ventas]) => {
    const total = ventas.reduce((acc, c) => acc + (Number(c.monto) || 0), 0)
    const detalle = ventas.map(c => {
      return `- Código: ${c.codigo}, Monto: ${formatCLP(c.monto || 0)}`
    }).join('\n')
    const texto = `Estimado(a) ${cliente},

Este es el detalle de sus compras:

${detalle}

TOTAL: ${formatCLP(total)}

Por favor transferir a la siguiente cuenta: 
Nombre: Alicia Yolhet Arias Cea
Banco: Mercado Pago
Tipo de Cuenta: Vista
N° de cuenta: 1038060282
Rut: 10376458-0

¡¡Gracias!! 😊
Equipo de Menaje House`
    return { cliente, total, ventas, texto }
  })

  if (resumenVentas.value.length > 0) {
    $q.notify({ type: 'positive', message: `Resumen generado: ${resumenVentas.value.length} clientes agrupados`, icon: 'group' })
  } else {
    $q.notify({ type: 'warning', message: 'No hay ventas con clientes asignados para agrupar', icon: 'warning' })
  }
}

function copiarTexto(texto: string) {
  navigator.clipboard.writeText(texto).then(() => {
    $q.notify({ type: 'positive', message: 'Texto copiado al portapapeles', icon: 'content_copy', timeout: 1500 })
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}

.widget-card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.client-inline-select-new :deep(.q-field__control) {
  background-color: #ffffff;
  border-radius: 8px;
  height: 36px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.client-inline-select-new :deep(.q-field__control:before) {
  border: none !important;
}

.client-inline-select-new :deep(.q-field__control:after) {
  border: none !important;
}

.client-inline-select-new :deep(.q-field__marginal) {
  height: 36px;
}

.client-inline-select-new :deep(.q-field__native) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 36px;
  font-size: 13px;
}

.list-item-hover {
  transition: all 0.2s ease;
}

.list-item-hover:hover {
  background-color: #ffffff !important;
  border-color: #c7d2fe !important; /* indigo-200 */
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
  transform: translateY(-1px);
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}
</style>
