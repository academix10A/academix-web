import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X, Search, Users, ChevronLeft, StickyNote,
  Calendar, User, ArrowRight,
} from 'lucide-react'
import styles from './NotasCompartidasPanel.module.css'
import { notasService } from '../services/api'

async function fetchNotasCompartidas(idRecurso) {
  const res = await notasService.getNotaCompartida(idRecurso)
  if (!res) throw new Error(`Error ${res.status}`)
  return res
}

function formatFecha(fechaStr) {
  if (!fechaStr) return ''
  const fecha = new Date(fechaStr)
  const ahora = new Date()
  const diffDias = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) > 1 ? 's' : ''}`
  if (diffDias < 365) return `Hace ${Math.floor(diffDias / 30)} mes${Math.floor(diffDias / 30) > 1 ? 'es' : ''}`
  return 'Hace más de un año'
}

function NotaCard({ nota, onNavigate }) {
  const PREVIEW_LIMIT = 180
  const esLarga = nota.contenido?.length > PREVIEW_LIMIT
  const preview = esLarga
    ? nota.contenido.slice(0, PREVIEW_LIMIT).trimEnd() + '…'
    : nota.contenido

  return (
    <button
      className={styles.card}
      onClick={() => onNavigate(nota.id_nota)}
      title="Ver nota completa"
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardIconWrap}>
          <StickyNote size={13} />
        </div>
        <h3 className={styles.cardTitulo}>{nota.titulo}</h3>
        <ArrowRight size={13} className={styles.cardArrow} />
      </div>

      <p className={styles.cardContenido}>{preview}</p>

      <div className={styles.cardFooter}>
        <span className={styles.metaItem}>
          <User size={11} />
          Usuario #{nota.id_usuario}
        </span>
        <span className={styles.metaItem}>
          <Calendar size={11} />
          {formatFecha(nota.fecha_creacion)}
        </span>
        {esLarga && (
          <span className={styles.tagVerMas}>Ver completa →</span>
        )}
      </div>
    </button>
  )
}

export default function NotasCompartidasPanel({ idRecurso, tituloRecurso, token, onClose }) {
  const navigate = useNavigate()

  const [notas,    setNotas]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!idRecurso) return
    setLoading(true)
    setError(null)
    fetchNotasCompartidas(idRecurso, token)
      .then(data => setNotas(Array.isArray(data) ? data : data.notas ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [idRecurso, token])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200)
  }, [])

  const notasFiltradas = notas.filter(n => {
    const q = busqueda.toLowerCase()
    return (
      n.titulo?.toLowerCase().includes(q) ||
      n.contenido?.toLowerCase().includes(q)
    )
  })

  const handleNavigate = (idNota) => {
    onClose()
    const params = new URLSearchParams({ idRecurso: String(idRecurso) })
    if (tituloRecurso) params.set('titulo', encodeURIComponent(tituloRecurso))
    navigate(`/notas/${idNota}?${params.toString()}`)
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <aside className={styles.panel}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <button className={styles.btnBack} onClick={onClose}>
            <ChevronLeft size={16} />
          </button>
          <div className={styles.headerInfo}>
            <Users size={15} className={styles.headerIcon} />
            <span className={styles.headerTitle}>Notas compartidas</span>
          </div>
          <button className={styles.btnClose} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Buscador */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Buscar en notas compartidas…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button
              className={styles.clearBtn}
              onClick={() => { setBusqueda(''); inputRef.current?.focus() }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Contador */}
        {!loading && !error && (
          <div className={styles.contador}>
            {busqueda
              ? `${notasFiltradas.length} resultado${notasFiltradas.length !== 1 ? 's' : ''}`
              : `${notas.length} nota${notas.length !== 1 ? 's' : ''} compartida${notas.length !== 1 ? 's' : ''}`
            }
          </div>
        )}

        {/* Lista */}
        <div className={styles.lista}>
          {loading && (
            <div className={styles.estado}>
              <div className={styles.spinner} />
              <span>Cargando notas…</span>
            </div>
          )}

          {error && !loading && (
            <div className={styles.estado}>
              <StickyNote size={32} className={styles.estadoIconError} />
              <span className={styles.errorMsg}>No se pudieron cargar las notas</span>
              <span className={styles.errorDetail}>{error}</span>
            </div>
          )}

          {!loading && !error && notas.length === 0 && (
            <div className={styles.estado}>
              <StickyNote size={40} className={styles.estadoIcon} />
              <span>Aún no hay notas compartidas para este recurso.</span>
            </div>
          )}

          {!loading && !error && notas.length > 0 && notasFiltradas.length === 0 && (
            <div className={styles.estado}>
              <Search size={32} className={styles.estadoIcon} />
              <span>Sin resultados para <strong>"{busqueda}"</strong></span>
            </div>
          )}

          {!loading && !error && notasFiltradas.map(nota => (
            <NotaCard
              key={nota.id_nota}
              nota={nota}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </aside>
    </>
  )
}