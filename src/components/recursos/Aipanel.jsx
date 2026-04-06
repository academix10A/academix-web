// src/components/recursos/AIPanel.jsx
import { useState } from 'react'
import { X, Send, Sparkles, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'
import styles from './AIPanel.module.css'

const WEBHOOK = 'https://n8n-n8n-academix.wulckn.easypanel.host/webhook/ai-academix'

export default function AIPanel({ selectedText, onClose }) {
  const [historial, setHistorial]   = useState([])
  const [pendiente, setPendiente]   = useState(null)
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [expandido, setExpandido]   = useState(null)
  const [collapsed, setCollapsed]   = useState(false)
  const [descartados, setDescartados] = useState([])

  if (selectedText && selectedText !== pendiente && !historial.find(i => i.texto === selectedText) && !descartados.includes(selectedText)) {
    setPendiente(selectedText)
    if (collapsed) setCollapsed(false)
  }

  const consultarIA = async (texto, contexto) => {
    setLoading(true)
    const payload = contexto
      ? { texto_seleccionado: contexto, pregunta_seguimiento: texto }
      : { texto_seleccionado: texto }

    try {
      const res  = await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      const respuesta = data.explicacion || 'Sin respuesta.'

      if (contexto) {
        setHistorial(prev => prev.map(item =>
          item.texto === contexto
            ? { ...item, chat: [...item.chat, { tipo: 'user', msg: texto }, { tipo: 'ai', msg: respuesta }] }
            : item
        ))
      } else {
        const nuevoId = Date.now()
        setHistorial(prev => [...prev, { texto, explicacion: respuesta, chat: [], id: nuevoId }])
        setExpandido(nuevoId)
        setPendiente(null)
      }
    } catch {
      if (contexto) {
        setHistorial(prev => prev.map(item =>
          item.texto === contexto
            ? { ...item, chat: [...item.chat, { tipo: 'user', msg: texto }, { tipo: 'ai', msg: 'Error al conectar.' }] }
            : item
        ))
      }
    } finally {
      setLoading(false)
    }
  }

  const enviarSeguimiento = (contexto) => {
    if (!input.trim() || loading) return
    consultarIA(input.trim(), contexto)
    setInput('')
  }

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ''}`}>

      {/* Flecha para colapsar/expandir en el borde izquierdo */}
      <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)}>
        {collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Contenido del panel — se oculta cuando está colapsado */}
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
                <p className={styles.pendienteTexto}>"{pendiente.length > 80 ? pendiente.slice(0, 80) + '…' : pendiente}"</p>
                <div className={styles.pendienteBtns}>
                  <button
                    className={styles.preguntarBtn}
                    onClick={() => consultarIA(pendiente, null)}
                    disabled={loading}
                  >
                    <Sparkles size={14} />
                    {loading ? 'Consultando…' : 'Preguntar a la IA'}
                  </button>
                  <button className={styles.descartarBtn} onClick={() => {
                    setDescartados(prev => [...prev, pendiente])
                    setPendiente(null)
                  }}>
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

                    {item.chat.length > 0 && (
                      <div className={styles.chat}>
                        {item.chat.map((msg, i) => (
                          <div key={i} className={msg.tipo === 'user' ? styles.msgUser : styles.msgAI}>
                            {msg.msg}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.inputRow}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Pregunta algo más…"
                        value={expandido === item.id ? input : ''}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && enviarSeguimiento(item.texto)}
                        disabled={loading}
                      />
                      <button
                        className={styles.sendBtn}
                        onClick={() => enviarSeguimiento(item.texto)}
                        disabled={loading || !input.trim()}
                      >
                        <Send size={14} />
                      </button>
                    </div>
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