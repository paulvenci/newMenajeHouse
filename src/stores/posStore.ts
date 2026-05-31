import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import type { Categoria } from './categoriasStore'

export interface CartItem {
    id: string // Identificador temporal en el carrito
    categoria: Categoria
    descripcion_libre: string
    precio_unitario: number
    cantidad: number
    subtotal: number
}

export const usePosStore = defineStore('pos', {
    state: () => ({
        carrito: [] as CartItem[],
        metodoPago: 'Efectivo' as 'Efectivo' | 'Débito/Crédito' | 'Transferencia',
        isProcessing: false,
    }),
    getters: {
        totalCarrito: (state) => {
            return state.carrito.reduce((total, item) => total + item.subtotal, 0)
        }
    },
    actions: {
        agregarAlCarrito(item: Omit<CartItem, 'id' | 'subtotal'>) {
            const nuevoItem: CartItem = {
                ...item,
                id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
                subtotal: item.precio_unitario * item.cantidad
            }
            this.carrito.push(nuevoItem)
        },
        quitarDelCarrito(itemId: string) {
            this.carrito = this.carrito.filter(i => i.id !== itemId)
        },
        actualizarCantidad(itemId: string, cantidad: number) {
            const item = this.carrito.find(i => i.id === itemId)
            if (item) {
                item.cantidad = Math.max(1, cantidad)
                item.subtotal = item.precio_unitario * item.cantidad
            }
        },
        setMetodoPago(metodo: 'Efectivo' | 'Débito/Crédito' | 'Transferencia') {
            this.metodoPago = metodo
        },
        limpiarCarrito() {
            this.carrito = []
            this.metodoPago = 'Efectivo'
        },
        async procesarVenta() {
            if (this.carrito.length === 0) throw new Error('El carrito está vacío')
            this.isProcessing = true
            
            try {
                // 1. Insertar la venta en new_ventas_pos
                const ventaToInsert = {
                    total: this.totalCarrito,
                    metodo_pago: this.metodoPago
                }
                const { data: ventaData, error: ventaError } = await supabase
                    .from('new_ventas_pos')
                    .insert([ventaToInsert])
                    .select()

                if (ventaError) throw ventaError
                const ventaId = ventaData[0].id

                // 2. Insertar los detalles en new_venta_detalles_pos
                const detallesToInsert = this.carrito.map(item => ({
                    venta_id: ventaId,
                    categoria_id: item.categoria.id,
                    descripcion_libre: item.descripcion_libre,
                    precio_unitario: item.precio_unitario,
                    cantidad: item.cantidad,
                    subtotal: item.subtotal
                }))

                const { error: detallesError } = await supabase
                    .from('new_venta_detalles_pos')
                    .insert(detallesToInsert)

                if (detallesError) throw detallesError

                // Limpiar si es exitoso
                this.limpiarCarrito()
                return ventaId

            } catch (error) {
                console.error("Error al procesar la venta:", error)
                throw error
            } finally {
                this.isProcessing = false
            }
        }
    }
})
