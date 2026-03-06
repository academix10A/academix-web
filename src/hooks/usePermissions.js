// src/hooks/usePermissions.js
import { useAuth } from './useAuth'

/*Aquí defines qué puede hacer cada membresía.*/
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
    descargarRecursos:   false,   // solo premium puede descargar

    // ── Exámenes ───────────────────────────────────────────────
    tomarExamenes:       true,
    verResultados:       true,

    // ── IA ─────────────────────────────────────────────────────
    usarAsistenciaIA:    false,   // exclusivo premium
    verHistorialIA:      false,

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
    descargarRecursos:   true,    //  puede descargar

    // ── Exámenes ───────────────────────────────────────────────
    tomarExamenes:       true,
    verResultados:       true,

    // ── IA ─────────────────────────────────────────────────────
    usarAsistenciaIA:    true,    // tiene IA
    verHistorialIA:      true,    // ve su historial

    // ── Perfil ─────────────────────────────────────────────────
    editarPerfil:        true,
  },
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth()

  const esAdmin    = isAuthenticated && user?.rol === 'admin'
  const membresia  = user?.membresia ?? 'gratis'   // si no hay membresía, tratarlo como gratis
  
  const puede = (permiso) => {
    if (!isAuthenticated) return false
    if (esAdmin)          return true   // admin puede todo
    return PERMISOS[membresia]?.[permiso] ?? false
  }

  return {
    puede,
    esAdmin,
    membresia,
    esPremium: membresia === 'premium',
    esGratis:  membresia === 'gratis',
  }
}