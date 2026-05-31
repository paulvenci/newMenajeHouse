import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useClientesStore = defineStore('clientes', () => {
    const clientes = ref<{ id: string, nombre: string, email: string, telefono: string }[]>([])

    // Cargar clientes desde Supabase (tabla new_clientes)
    async function cargarClientes() {
        clientes.value = []
        const { data, error } = await supabase.from('new_clientes').select('*').order('nombre', { ascending: true })
        
        if (error) {
            console.error('Error al cargar clientes:', error)
            return
        }
        
        if (data) {
            clientes.value = data
        }
    }

    // Agregar cliente a Supabase
    async function agregarCliente(nombre: string, email: string, telefono: string) {
        const { data, error } = await supabase
            .from('new_clientes')
            .insert([{ nombre, email, telefono }])
            .select()
            
        if (error) {
            console.error('Error al agregar cliente:', error)
            throw error
        }
        
        if (data && data.length > 0) {
            clientes.value.push(data[0])
            // Ordenar alfabéticamente después de agregar
            clientes.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }
    }

    // Actualizar cliente
    async function actualizarCliente(id: string, nombre: string, email: string, telefono: string) {
        const { error } = await supabase
            .from('new_clientes')
            .update({ nombre, email, telefono })
            .eq('id', id)
            
        if (error) {
            console.error('Error al actualizar cliente:', error)
            throw error
        }
        
        const index = clientes.value.findIndex(c => c.id === id)
        if (index !== -1) {
            clientes.value[index] = { ...clientes.value[index], nombre, email, telefono }
            clientes.value.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }
    }

    // Eliminar cliente
    async function eliminarCliente(id: string) {
        const { error } = await supabase
            .from('new_clientes')
            .delete()
            .eq('id', id)
            
        if (error) {
            console.error('Error al eliminar cliente:', error)
            throw error
        }
        
        clientes.value = clientes.value.filter(c => c.id !== id)
    }

    return { clientes, cargarClientes, agregarCliente, actualizarCliente, eliminarCliente }
})
