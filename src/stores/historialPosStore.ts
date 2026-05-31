import { defineStore } from 'pinia'
import { supabase } from '../supabase'
import type { Categoria } from './categoriasStore'

export interface VentaDetallePos {
    id: string
    venta_id: string
    categoria_id: string
    descripcion_libre: string
    precio_unitario: number
    cantidad: number
    subtotal: number
    categoria?: Categoria
}

export interface VentaPos {
    id: string
    total: number
    metodo_pago: string
    fecha_venta: string
    created_at: string
    detalles?: VentaDetallePos[]
}

export const useHistorialPosStore = defineStore('historialPos', {
    state: () => ({
        ventas: [] as VentaPos[],
        loading: false
    }),
    actions: {
        async cargarVentas() {
            this.loading = true
            try {
                const { data, error } = await supabase
                    .from('new_ventas_pos')
                    .select('*, detalles:new_venta_detalles_pos(*, categoria:new_categorias_pos(*, caja:new_cajas_pos(*)))')
                    .order('fecha_venta', { ascending: false })
                
                if (error) throw error
                this.ventas = data || []
            } catch (error) {
                console.error("Error al cargar historial de ventas POS:", error)
            } finally {
                this.loading = false
            }
        },
        async eliminarVenta(id: string) {
            try {
                // Al estar ON DELETE CASCADE, borrar la cabecera en new_ventas_pos borra los detalles
                const { error } = await supabase
                    .from('new_ventas_pos')
                    .delete()
                    .eq('id', id)
                if (error) throw error
                this.ventas = this.ventas.filter(v => v.id !== id)
            } catch (error) {
                console.error("Error al eliminar la venta POS:", error)
                throw error
            }
        },
        async actualizarVentaCabecera(id: string, updates: Partial<{ total: number, metodo_pago: string }>) {
            try {
                const { data, error } = await supabase
                    .from('new_ventas_pos')
                    .update(updates)
                    .eq('id', id)
                    .select('*, detalles:new_venta_detalles_pos(*, categoria:new_categorias_pos(*, caja:new_cajas_pos(*)))')
                if (error) throw error
                if (data && data.length > 0) {
                    const index = this.ventas.findIndex(v => v.id === id)
                    if (index !== -1) {
                        this.ventas[index] = data[0]
                    }
                }
            } catch (error) {
                console.error("Error al actualizar la venta POS:", error)
                throw error
            }
        }
    }
})
