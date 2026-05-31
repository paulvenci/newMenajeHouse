import { defineStore } from 'pinia';
import { supabase } from '../supabase';

export interface Retiro {
    id?: string;
    ventaId: string;
    clienteId: string;
    monto: number;
    estado: 'pendiente' | 'completado' | 'cancelado';
    fecha: string;
    retiradoPor?: string;
    fechaRetiro?: string;
    modoPago?: string;
    clienteNombre?: string;
    codigoVenta?: string;
    tipoVenta?: string;
}

export const useRetirosStore = defineStore('retiros', {
    state: () => ({
        retiros: [] as Retiro[]
    }),
    actions: {
        async cargarRetirosDelMes() {
            try {
                const hoy = new Date();
                const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

                // Consulta a Supabase apuntando a new_retiros y resolviendo alias
                const { data, error } = await supabase
                    .from('new_retiros')
                    .select(`
                        *,
                        ventas:new_ventas ( 
                            codigo, 
                            tipo,
                            clientes:new_clientes ( nombre )
                        ),
                        clientes:new_clientes ( nombre )
                    `)
                    .or(`estado.eq.pendiente,and(fecha.gte.${primerDiaMes.toISOString()},fecha.lte.${ultimoDiaMes.toISOString()})`)
                    .order('fecha', { ascending: false });
                    
                if (error) throw error;
                
                console.log("Documentos leídos de Supabase (retiros):", data);

                const retirosTemp: Retiro[] = data.map((d: any) => {
                    const clienteNombre = d.clientes?.nombre || d.ventas?.clientes?.nombre || 'Desconocido';
                    
                    return {
                        id: d.id,
                        ventaId: d.venta_id,
                        clienteId: d.cliente_id || d.ventas?.cliente_id,
                        monto: d.monto,
                        estado: d.estado,
                        fecha: d.fecha,
                        retiradoPor: d.retirado_por,
                        fechaRetiro: d.fecha_retiro,
                        clienteNombre: clienteNombre,
                        codigoVenta: d.ventas?.codigo || 'N/A',
                        tipoVenta: d.ventas?.tipo || 'N/A'
                    };
                });
                
                this.retiros = retirosTemp;

            } catch (error) {
                console.error("Error al cargar retiros:", error);
                throw error;
            }
        },

        async procesarRetiro(retiroId: string, data: { retiradoPor: string }) {
            try {
                const fechaActual = new Date().toISOString()
                const { error } = await supabase
                    .from('new_retiros')
                    .update({
                        retirado_por: data.retiradoPor,
                        estado: 'completado',
                        fecha_retiro: fechaActual
                    })
                    .eq('id', retiroId)

                if (error) throw error;

                console.log("✅ Retiro procesado exitosamente");
                const index = this.retiros.findIndex(r => r.id === retiroId);
                if (index !== -1) {
                    this.retiros[index].estado = 'completado';
                    this.retiros[index].retiradoPor = data.retiradoPor;
                    this.retiros[index].fechaRetiro = fechaActual;
                }
            } catch (error) {
                console.error("❌ Error al procesar retiro:", error);
                throw error;
            }
        },

        async agregarRetiro(retiro: Omit<Retiro, 'id'>) {
            try {
                const retiroPayload = {
                    venta_id: retiro.ventaId,
                    cliente_id: retiro.clienteId || null,
                    monto: retiro.monto,
                    estado: retiro.estado || 'pendiente',
                    fecha: retiro.fecha || new Date().toISOString()
                }

                const { data, error } = await supabase
                    .from('new_retiros')
                    .insert([retiroPayload])
                    .select()
                    
                if (error) throw error;
                
                if (data && data.length > 0) {
                     this.retiros.unshift({ 
                        ...retiro, 
                        id: data[0].id 
                    });
                    console.log("✅ Retiro pendiente creado en new_retiros");
                }
            } catch (error) {
                console.error("❌ Error al crear retiro:", error);
                throw error;
            }
        }
    }
});
