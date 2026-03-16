import { useState, useEffect } from 'react'
import { Check, Zap, Crown, BookOpen, Star } from 'lucide-react'
import { membresiasService } from '../services/api'
import styles from './Memberships.module.css'

// Ícono por tipo de membresía
function getMembresiaIcon(tipo, nombre) {
  const t = tipo?.toLowerCase() ?? ''
  const n = nombre?.toLowerCase() ?? ''
  if (n.includes('gratuito') || t.includes('freemium')) return <BookOpen size={28} />
  if (n.includes('semestral') || n.includes('anual'))    return <Zap size={28} />
  if (n.includes('premium') || n.includes('mensual'))    return <Crown size={28} />
  return <Star size={28} />
}

// Cuál es el más popular — el primero que sea mensual o el segundo
function esDestacado(membresia, index, total) {
  const n = membresia.nombre?.toLowerCase() ?? ''
  return n.includes('mensual') || (total >= 3 && index === 1)
}

export default function Memberships() {
  const [membresias, setMembresias] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    membresiasService.getAll(null)  // membresías son públicas, no necesitan token
      .then(data => setMembresias(Array.isArray(data) ? data : data.items ?? []))
      .catch(() => setMembresias([]))  // si falla, queda vacío sin romper la página
      .finally(() => setLoading(false))
  }, [])

  // Mientras carga muestra placeholders
  if (loading) return (
    <section id="membresias" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Membresías</span>
        <h2 className={styles.title}>Elige tu Plan</h2>
        <p className={styles.sub}>Accede al conocimiento al nivel que necesitas</p>
      </div>
      <div className={styles.grid}>
        {[1,2,3].map(i => (
          <div key={i} className={styles.card} style={{ opacity: 0.4, minHeight: 400 }} />
        ))}
      </div>
    </section>
  )

  return (
    <section id="membresias" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Membresías</span>
        <h2 className={styles.title}>Elige tu Plan</h2>
        <p className={styles.sub}>Accede al conocimiento al nivel que necesitas</p>
      </div>

      <div className={styles.grid}>
        {membresias.map((m, i) => {
          const destacado = esDestacado(m, i, membresias.length)
          const precio    = m.costo === 0 ? 'Gratis' : `$${m.costo}`
          const periodo   = m.tipo?.toLowerCase().includes('freemium') ? '' : `/${m.tipo}`

          return (
            <div key={m.id_membresia} className={`${styles.card} ${destacado ? styles.highlight : ''}`}>
              {destacado && <div className={styles.badge}>Más Popular</div>}

              <div className={styles.iconWrap}>
                {getMembresiaIcon(m.tipo, m.nombre)}
              </div>

              <h3 className={styles.planName}>{m.nombre}</h3>

              <div className={styles.priceRow}>
                <span className={styles.price}>{precio}</span>
                {periodo && <span className={styles.period}>{periodo}</span>}
              </div>

              <p className={styles.desc}>{m.descripcion}</p>

              {/* Beneficios de la BD si existen, si no muestra vacío */}
              {m.beneficios && m.beneficios.length > 0 && (
                <ul className={styles.features}>
                  {m.beneficios.map(b => (
                    <li key={b.id_beneficio} className={styles.feat}>
                      <Check size={16} className={styles.check} />
                      {b.nombre}
                    </li>
                  ))}
                </ul>
              )}

              <a href="#login" className={`${styles.btn} ${destacado ? styles.btnGold : ''}`}>
                {m.costo === 0 ? 'Empezar Gratis' : 'Obtener Plan'}
              </a>
            </div>
          )
        })}
      </div>
    </section>
  )
}