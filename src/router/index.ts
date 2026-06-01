import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../supabase'

const routes = [
    { 
        path: '/', 
        component: () => import('../views/Login.vue'), 
        meta: { layout: 'empty' } 
    },
    { 
        path: '/login', 
        component: () => import('../views/Login.vue'), 
        meta: { layout: 'empty' } 
    },
    { 
        path: '/register', 
        component: () => import('../views/Register.vue'), 
        meta: { layout: 'empty' } 
    },
    { 
        path: '/dashboard', 
        component: () => import('../views/Dashboard.vue'), 
        meta: { layout: 'default', section: 'Dashboard', requiresAuth: true } 
    },
    { 
        path: '/punto-venta', 
        component: () => import('../views/PuntoVenta.vue'), 
        meta: { layout: 'default', section: 'Punto de Venta', requiresAuth: true } 
    },
    { 
        path: '/ventas-live', 
        component: () => import('../views/VentasLive.vue'), 
        meta: { layout: 'default', section: 'Ventas Live', requiresAuth: true } 
    },
    { 
        path: '/pendientes-live', 
        component: () => import('../views/PendientesLive.vue'), 
        meta: { layout: 'default', section: 'Pendientes Live', requiresAuth: true } 
    },
    { 
        path: '/reportes', 
        component: () => import('../views/Reportes.vue'), 
        meta: { layout: 'default', section: 'Reportes', requiresAuth: true } 
    },
    { 
        path: '/clientes', 
        component: () => import('../views/Clientes.vue'), 
        meta: { layout: 'default', section: 'Clientes', requiresAuth: true } 
    },
    { 
        path: '/cajas', 
        component: () => import('../views/Cajas.vue'), 
        meta: { layout: 'default', section: 'Cajas', requiresAuth: true } 
    },
    { 
        path: '/categorias', 
        component: () => import('../views/Categorias.vue'), 
        meta: { layout: 'default', section: 'Categorías', requiresAuth: true } 
    }
]

export const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to) => {
    const requiresAuth = to.meta.requiresAuth
    const { data } = await supabase.auth.getSession()
    const currentUser = data.session?.user

    if (requiresAuth && !currentUser) {
        return { path: '/login' }
    } else if ((to.path === '/' || to.path === '/login' || to.path === '/register') && currentUser) {
        return { path: '/dashboard' }
    }
    return true
})
