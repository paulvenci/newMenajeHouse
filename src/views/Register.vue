<template>
  <div class="register-page flex flex-center">
    <div class="dark-overlay"></div>

    <div class="register-container q-pa-md column justify-center items-center">
      <div class="welcome-box text-center q-mb-lg animate-fade-in">
        <h1 class="text-h4 text-md-h3 text-white text-weight-bold q-my-none">
          Crear Cuenta
        </h1>
        <div class="text-subtitle1 text-indigo-3 text-weight-medium q-mt-xs">
          Regístrate en Menaje House
        </div>
      </div>

      <!-- Tarjeta de Registro (Glassmorphism) -->
      <q-card class="register-card q-pa-lg shadow-24 animate-scale-up" style="width: 100%; max-width: 400px;">
        <q-card-section class="q-pb-none text-center">
          <div class="text-h5 text-white text-weight-bold">Registro de Usuario</div>
          <div class="text-caption text-grey-4 q-mt-xs">Crea tus credenciales de acceso</div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit.prevent="handleRegister" class="q-gutter-md">
            <!-- Email -->
            <q-input
              v-model="email"
              type="email"
              label="Correo electrónico"
              label-color="indigo-2"
              dark
              outlined
              dense
              :rules="[
                val => !!val || 'El correo electrónico es obligatorio',
                val => /.+@.+\..+/.test(val) || 'Ingresa un correo electrónico válido'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="email" color="indigo-2" />
              </template>
            </q-input>

            <!-- Password -->
            <q-input
              v-model="password"
              type="password"
              label="Contraseña"
              label-color="indigo-2"
              dark
              outlined
              dense
              :rules="[
                val => !!val || 'La contraseña es obligatoria',
                val => val.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="indigo-2" />
              </template>
            </q-input>

            <!-- Confirm Password -->
            <q-input
              v-model="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              label-color="indigo-2"
              dark
              outlined
              dense
              :rules="[
                val => !!val || 'Debes confirmar la contraseña',
                val => val === password || 'Las contraseñas no coinciden'
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="lock" color="indigo-2" />
              </template>
            </q-input>

            <!-- Botón de Registro -->
            <div class="q-mt-lg">
              <q-btn
                type="submit"
                label="Registrarse"
                color="indigo-7"
                text-color="white"
                class="full-width rounded-borders text-weight-bold transition-swing"
                size="large"
                :loading="loading"
                unevaluated
              />
            </div>

            <!-- Botón a Login -->
            <div class="text-center q-mt-md">
              <q-btn
                flat
                no-caps
                color="indigo-2"
                label="¿Ya tienes una cuenta? Inicia Sesión"
                to="/login"
                class="transition-swing hover-light"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from '../supabase'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    
    if (signUpError) throw signUpError
    
    $q.notify({
      type: 'positive',
      message: 'Cuenta creada con éxito: ' + data.user?.email + '. Revisa tu email para confirmarla.',
      icon: 'check_circle',
      timeout: 5000
    })
    
    router.push('/login')
  } catch (err: any) {
    console.error("Error al registrarse:", err)
    $q.notify({
      type: 'negative',
      message: 'Error en el registro: ' + err.message,
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background-image: url("../assets/image1.png");
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

.dark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(18, 18, 18, 0.4), rgba(18, 18, 18, 0.75));
  z-index: 1;
}

.register-container {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
}

/* Glassmorphism Card */
.register-card {
  background: rgba(26, 35, 126, 0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.welcome-box h1 {
  text-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
  letter-spacing: 0.5px;
}

.rounded-borders {
  border-radius: 8px;
}

.transition-swing {
  transition: all 0.2s ease-in-out;
}

.transition-swing:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.hover-light:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Animaciones */
.animate-fade-in {
  opacity: 0;
  transform: translateY(-20px);
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-up {
  opacity: 0;
  transform: scale(0.95);
  animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
}

@keyframes fadeInDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleUp {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
