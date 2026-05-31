import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export interface Caja {
    id: string
    nombre: string
    created_at?: string
}

export interface Categoria {
    id: string
    nombre: string
    precio_base: number
    caja_id: string
    created_at?: string
    caja?: Caja
}

export const useCategoriasStore = defineStore('categorias', {
    state: () => ({
        cajas: [] as Caja[],
        categorias: [] as Categoria[],
        loading: false,
    }),
    actions: {
        async cargarCajas() {
            this.loading = true
            const { data, error } = await supabase
                .from('new_cajas_pos')
                .select('*')
                .order('created_at', { ascending: false })
            if (error) {
                console.error("Error al cargar cajas:", error)
            } else {
                this.cajas = data || []
            }
            this.loading = false
        },
        async agregarCaja(nombre: string) {
            const { data, error } = await supabase
                .from('new_cajas_pos')
                .insert([{ nombre }])
                .select()
            if (error) throw error
            if (data) this.cajas.unshift(data[0])
        },
        async eliminarCaja(id: string) {
            const { error } = await supabase
                .from('new_cajas_pos')
                .delete()
                .eq('id', id)
            if (error) throw error
            this.cajas = this.cajas.filter(c => c.id !== id)
        },
        async cargarCategorias() {
            this.loading = true
            const { data, error } = await supabase
                .from('new_categorias_pos')
                .select('*, caja:new_cajas_pos(*)')
                .order('created_at', { ascending: false })
            if (error) {
                console.error("Error al cargar categorias:", error)
            } else {
                this.categorias = data || []
            }
            this.loading = false
        },
        async agregarCategoria(cat: { nombre: string, precio_base: number, caja_id: string }) {
            const { data, error } = await supabase
                .from('new_categorias_pos')
                .insert([cat])
                .select('*, caja:new_cajas_pos(*)')
            if (error) throw error
            if (data) this.categorias.unshift(data[0])
        },
        async actualizarCategoria(id: string, updates: Partial<{ nombre: string, precio_base: number, caja_id: string }>) {
            const { data, error } = await supabase
                .from('new_categorias_pos')
                .update(updates)
                .eq('id', id)
                .select('*, caja:new_cajas_pos(*)')
            if (error) throw error
            if (data && data.length > 0) {
                const index = this.categorias.findIndex(c => c.id === id)
                if (index !== -1) this.categorias[index] = data[0]
            }
        },
        async eliminarCategoria(id: string) {
            const { error } = await supabase
                .from('new_categorias_pos')
                .delete()
                .eq('id', id)
            if (error) throw error
            this.categorias = this.categorias.filter(c => c.id !== id)
        }
    }
})
