// src/hooks/usePermissions.js
import { useAuth } from './useAuth'

/* Aquí defines qué puede hacer cada membresía. */
const PERMISOS = {
  gratis: {
    // ── Notas ──────────────────────────────────────────────────
    crearNotas:          true,
    verNotasCompartidas: true,

    // ── Publicaciones ──────────────────────────────────────────
    crearPublicaciones:  true,
    verPublicaciones:    true,

    // ── Biblioteca ─────────────────────────────────────────────
    verRecursos:         true,
    descargarRecursos:   false,

    // ── Exámenes ───────────────────────────────────────────────
    tomarExamenes:       true,
    verResultados:       true,

    // ── IA ─────────────────────────────────────────────────────
    usarAsistenciaIA:    true,   // ahora sí puede usar IA
    verHistorialIA:      false,  // pero sin historial premium

    // ── Perfil ─────────────────────────────────────────────────
    editarPerfil:        true,
  },

  premium: {
    // ── Notas ──────────────────────────────────────────────────
    crearNotas:          true,
    verNotasCompartidas: true,

    // ── Publicaciones ──────────────────────────────────────────
    crearPublicaciones:  true,
    verPublicaciones:    true,

    // ── Biblioteca ─────────────────────────────────────────────
    verRecursos:         true,
    descargarRecursos:   true,

    // ── Exámenes ───────────────────────────────────────────────
    tomarExamenes:       true,
    verResultados:       true,

    // ── IA ─────────────────────────────────────────────────────
    usarAsistenciaIA:    true,
    verHistorialIA:      true,

    // ── Perfil ─────────────────────────────────────────────────
    editarPerfil:        true,
  },
}

function normalizarMembresia(nombre) {
  if (!nombre) return 'gratis'

  if (nombre === 'Plan Gratuito') {
    return 'gratis'
  }

  if (
    nombre === 'Plan Premium Mensual' ||
    nombre === 'Plan Premium Semestral' ||
    nombre === 'Plan Premium Anual'
  ) {
    return 'premium'
  }

  return 'gratis'
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth()

  const esAdmin = isAuthenticated && user?.rol === 'admin'
  const membresia = normalizarMembresia(user?.membresia)

  const puede = (permiso) => {
    if (!isAuthenticated) return false
    if (esAdmin) return true
    return PERMISOS[membresia]?.[permiso] ?? false
  }

  return {
    puede,
    esAdmin,
    membresia,
    esPremium: membresia === 'premium',
    esGratis: membresia === 'gratis',
  }
}