import { useState, useEffect, useRef, useCallback } from 'react'
import { progresoService } from '../services/api'

const INTERVALO_SYNC = 30

export const ESTRATEGIA = {
  TEXTO:  'texto',
}

export function useProgreso(idRecurso, estrategia, mediaRef) {
  const [porcentaje,     setPorcentaje]     = useState(0)
  const [completado,     setCompletado]     = useState(false)
  const [ultimaPosicion, setUltimaPosicion] = useState(0)
  const [cargando,       setCargando]       = useState(true)

  const completadoRef = useRef(false)
  const estrategiaRef = useRef(estrategia)
  const idRecursoRef  = useRef(idRecurso)

  useEffect(() => {
    if (!idRecurso) return

    idRecursoRef.current  = idRecurso
    estrategiaRef.current = estrategia

    completadoRef.current = false
    setPorcentaje(0)
    setUltimaPosicion(0)
    setCompletado(false)
    setCargando(true)

    progresoService.getProgresoExistente(idRecurso)
      .then(data => {
        const pos = data.ultima_posicion ?? 0
        const pct = data.porcentaje_leido ?? 0

        setUltimaPosicion(pos)
        setPorcentaje(pct)
        setCompletado(data.completado ?? false)
        completadoRef.current = data.completado ?? false
      })
      .catch((err) => {
        if (err.message?.includes('404') || err.message?.includes('No se encontró')) {
          return
        }
      })
      .finally(() => setCargando(false))
  }, [idRecurso])

  useEffect(() => {
    if (!idRecurso || cargando) return

    let tickInterval = null
    let syncInterval = null

    if (estrategia === ESTRATEGIA.TEXTO) {
      syncInterval = setInterval(() => {
        if (!completadoRef.current) enviarProgreso(false)
      }, INTERVALO_SYNC * 1000)
    }

    return () => {
      clearInterval(tickInterval)
      clearInterval(syncInterval)
      if (!completadoRef.current) enviarProgreso(false)
    }
  }, [idRecurso, cargando, estrategia])

  function calcularPosicionYPorcentaje() {
    const est = estrategiaRef.current

    if (est === ESTRATEGIA.TEXTO) {
      const contenedor = document.getElementById('texto-contenido')
      if (!contenedor) return { posicion: 0, porcentaje: 0 }

      const scrollTop    = contenedor.scrollTop
      const scrollHeight = contenedor.scrollHeight - contenedor.clientHeight

      const pct = scrollHeight > 0
        ? Math.min(Math.round((scrollTop / scrollHeight) * 100), 99)
        : 0

      return { posicion: Math.floor(scrollTop), porcentaje: pct }
    }

    return { posicion: 0, porcentaje: 0 }
  }

  function enviarProgreso(esCompletado) {
    const { posicion, porcentaje: pct } = calcularPosicionYPorcentaje()
    const pctFinal = esCompletado ? 100 : pct

    setPorcentaje(pctFinal)
    setUltimaPosicion(posicion)
    progresoService.patchProgreso(idRecursoRef.current, {
      porcentaje_leido: pctFinal,
      ultima_posicion:  posicion,
      completado:       esCompletado,
    }).catch((e) => { console.error(`EROR EN CAPA 8: ${e}`) })
  }

  const marcarCompletado = useCallback(() => {
    if (completadoRef.current) return
    completadoRef.current = true
    setCompletado(true)
    enviarProgreso(true)
  }, [])

  return { porcentaje, completado, ultimaPosicion, cargando, marcarCompletado }
}