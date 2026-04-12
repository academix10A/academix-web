// src/components/recursos/AIPanel.jsx
import { useState, useEffect } from 'react'
import { X, Sparkles, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Aipanel.module.css'

// const API_IA = 'http://127.0.0.1:8000/api/ia'
const API_IA = `${import.meta.env.VITE_API_URL}/ia`

export default function AIPanel({ selectedText, onClose }) {
  const [historial, setHistorial] = useState([])
  const [pendiente, setPendiente] = useState(null)
  const [descartados, setDescartados] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandido, setExpandido] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [cuota, setCuota] = useState(null)

  const { token } = useAuth()

  useEffect(() => {
    if (!token) return

    fetch(`${API_IA}/cuota`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('No se pudo cargar la cuota')
        return r.json()
      })
      .then((data) => setCuota(data))
      .catch(() => setCuota(null))
  }, [token])

  useEffect(() => {
    if (!selectedText) return

    const yaExiste = historial.some(i => i.texto === selectedText)
    const yaDescartado = descartados.includes(selectedText)

    if (selectedText !== pendiente && !yaExiste && !yaDescartado) {
      setPendiente(selectedText)
      if (collapsed) setCollapsed(false)
    }
  }, [selectedText, historial, descartados, pendiente, collapsed])

  const consultarIA = async (texto, pregunta) => {
    if (!token) {
      alert('Tu sesión no es válida. Inicia sesión nuevamente.')
      return
    }

    if (cuota?.bloqueado) {
      alert(`Agotaste tus ${cuota.limite_diario} consultas diarias de IA.`)
      return
    }

    setLoading(true)

    const payload = {
      texto_seleccionado: texto,
      pregunta_seguimiento: pregunta || null,
    }

    try {
      const res = await fetch(`${API_IA}/consultar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (res.status === 403) {
        const msg = data?.detail?.message || 'Agotaste tus consultas diarias de IA.'
        alert(msg)
        setCuota(data?.detail || null)
        return
      }

      if (!res.ok) {
        throw new Error(data?.detail || 'Error al consultar la IA')
      }

      if (data?.cuota) {
        setCuota(data.cuota)
      }

      const explicacion = data?.explicacion || 'Sin respuesta.'
      const sugerencias = Array.isArray(data?.sugerencias) ? data.sugerencias : []

      if (pregunta) {
        setHistorial(prev => prev.map(item =>
          item.texto === texto
            ? {
                ...item,
                chat: [
                  ...item.chat,
                  { tipo: 'user', msg: pregunta },
                  { tipo: 'ai', msg: explicacion, sugerencias }
                ]
              }
            : item
        ))
      } else {
        const nuevoId = Date.now()
        setHistorial(prev => [
          ...prev,
          { texto, explicacion, sugerencias, chat: [], id: nuevoId }
        ])
        setExpandido(nuevoId)
        setPendiente(null)
      }
    } catch {
      if (pregunta) {
        setHistorial(prev => prev.map(item =>
          item.texto === texto
            ? {
                ...item,
                chat: [
                  ...item.chat,
                  { tipo: 'user', msg: pregunta },
                  { tipo: 'ai', msg: 'Error al conectar con la IA.', sugerencias: [] }
                ]
              }
            : item
        ))
      } else {
        alert('No se pudo consultar la IA.')
      }
    } finally {
      setLoading(false)
    }
  }

  const descartar = () => {
    if (!pendiente) return
    setDescartados(prev => [...prev, pendiente])
    setPendiente(null)
  }

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>
      <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)}>
        {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {!collapsed && (
        <>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Sparkles size={16} />
              <span>Asistente IA</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {cuota && (
            <div
              style={{
                fontSize: '0.8rem',
                color: '#cbd5e1',
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {cuota.limite_diario === null
                ? `Membresía: ${cuota.membresia} · IA ilimitada`
                : `Consultas IA hoy: ${cuota.usadas_hoy}/${cuota.limite_diario} · Restantes: ${cuota.restantes}`
              }
            </div>
          )}

          <div className={styles.historial}>
            {pendiente && (
              <div className={styles.pendiente}>
                <p className={styles.pendienteLabel}>Texto seleccionado:</p>
                <p className={styles.pendienteTexto}>
                  "{pendiente.length > 80 ? pendiente.slice(0, 80) + '…' : pendiente}"
                </p>

                {cuota?.bloqueado && (
                  <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Agotaste tus {cuota.limite_diario} consultas diarias de IA.
                  </p>
                )}

                <div className={styles.pendienteBtns}>
                  <button
                    className={styles.preguntarBtn}
                    onClick={() => consultarIA(pendiente, null)}
                    disabled={loading || cuota?.bloqueado}
                  >
                    <Sparkles size={14} />
                    {cuota?.bloqueado
                      ? 'Consultas agotadas'
                      : loading
                        ? 'Consultando…'
                        : 'Preguntar a la IA'}
                  </button>

                  <button className={styles.descartarBtn} onClick={descartar}>
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {historial.length === 0 && !pendiente && (
              <div className={styles.empty}>
                <Sparkles size={32} />
                <p>Subraya cualquier texto del libro para obtener una explicación.</p>
              </div>
            )}

            {historial.map((item) => (
              <div key={item.id} className={styles.item}>
                <button
                  className={styles.itemHeader}
                  onClick={() => setExpandido(expandido === item.id ? null : item.id)}
                >
                  <span className={styles.itemTexto}>
                    "{item.texto.length > 50 ? item.texto.slice(0, 50) + '…' : item.texto}"
                  </span>
                  {expandido === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {expandido === item.id && (
                  <div className={styles.itemBody}>
                    <p className={styles.explicacion}>{item.explicacion}</p>

                    {item.sugerencias.length > 0 && (
                      <div className={styles.sugerencias}>
                        <p className={styles.sugerenciasLabel}>Profundiza:</p>
                        {item.sugerencias.map((s, i) => (
                          <button
                            key={i}
                            className={styles.sugerenciaBtn}
                            onClick={() => consultarIA(item.texto, s)}
                            disabled={loading || cuota?.bloqueado}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {item.chat.length > 0 && (
                      <div className={styles.chat}>
                        {item.chat.map((msg, i) => (
                          <div key={i}>
                            <div className={msg.tipo === 'user' ? styles.msgUser : styles.msgAI}>
                              {msg.msg}
                            </div>

                            {msg.tipo === 'ai' && msg.sugerencias?.length > 0 && (
                              <div className={styles.sugerencias}>
                                {msg.sugerencias.map((s, j) => (
                                  <button
                                    key={j}
                                    className={styles.sugerenciaBtn}
                                    onClick={() => consultarIA(item.texto, s)}
                                    disabled={loading || cuota?.bloqueado}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className={styles.loadingRow}>
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
                <span className={styles.loadingDot} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}