// src/components/recursos/AIPanel.jsx
import { useState } from 'react'
import { X, Sparkles, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'
import styles from './AIPanel.module.css'

const WEBHOOK = 'https://n8n-n8n-academix.wulckn.easypanel.host/webhook/ai-academix'

export default function AIPanel({ selectedText, onClose }) {
  const [historial, setHistorial]     = useState([])
  const [pendiente, setPendiente]     = useState(null)
  const [descartados, setDescartados] = useState([])
  const [loading, setLoading]         = useState(false)
  const [expandido, setExpandido]     = useState(null)
  const [collapsed, setCollapsed]     = useState(false)

  if (
    selectedText &&
    selectedText !== pendiente &&
    !historial.find(i => i.texto === selectedText) &&
    !descartados.includes(selectedText)
  ) {
    setPendiente(selectedText)
    if (collapsed) setCollapsed(false)
  }

  const consultarIA = async (texto, pregunta) => {
    setLoading(true)
    const payload = pregunta
      ? { texto_seleccionado: texto, pregunta_seguimiento: pregunta }
      : { texto_seleccionado: texto }

    try {
      const res  = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const raw  = await res.text()
      let data
      try {
        data = JSON.parse(raw)
      } catch {
        data = { explicacion: raw, sugerencias: [] }
      }

      const explicacion = data.explicacion || 'Sin respuesta.'
      const sugerencias = Array.isArray(data.sugerencias) ? data.sugerencias : []

      if (pregunta) {
        // Es una pregunta de seguimiento — agregar al chat del item
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
        // Es una nueva palabra/párrafo
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
            ? { ...item, chat: [...item.chat, { tipo: 'user', msg: pregunta }, { tipo: 'ai', msg: 'Error al conectar.', sugerencias: [] }] }
            : item
        ))
      }
    } finally {
      setLoading(false)
    }
  }

  const descartar = () => {
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

          <div className={styles.historial}>

            {pendiente && (
              <div className={styles.pendiente}>
                <p className={styles.pendienteLabel}>Texto seleccionado:</p>
                <p className={styles.pendienteTexto}>
                  "{pendiente.length > 80 ? pendiente.slice(0, 80) + '…' : pendiente}"
                </p>
                <div className={styles.pendienteBtns}>
                  <button
                    className={styles.preguntarBtn}
                    onClick={() => consultarIA(pendiente, null)}
                    disabled={loading}
                  >
                    <Sparkles size={14} />
                    {loading ? 'Consultando…' : 'Preguntar a la IA'}
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

                    {/* Sugerencias de la explicación principal */}
                    {item.sugerencias.length > 0 && (
                      <div className={styles.sugerencias}>
                        <p className={styles.sugerenciasLabel}>Profundiza:</p>
                        {item.sugerencias.map((s, i) => (
                          <button
                            key={i}
                            className={styles.sugerenciaBtn}
                            onClick={() => consultarIA(item.texto, s)}
                            disabled={loading}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Chat de seguimiento */}
                    {item.chat.length > 0 && (
                      <div className={styles.chat}>
                        {item.chat.map((msg, i) => (
                          <div key={i}>
                            <div className={msg.tipo === 'user' ? styles.msgUser : styles.msgAI}>
                              {msg.msg}
                            </div>
                            {/* Sugerencias de respuestas del chat */}
                            {msg.tipo === 'ai' && msg.sugerencias?.length > 0 && (
                              <div className={styles.sugerencias}>
                                {msg.sugerencias.map((s, j) => (
                                  <button
                                    key={j}
                                    className={styles.sugerenciaBtn}
                                    onClick={() => consultarIA(item.texto, s)}
                                    disabled={loading}
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