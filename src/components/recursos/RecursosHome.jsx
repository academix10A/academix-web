// src/components/recursos/RecursosHome.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Headphones, Video, FileText, File, ArrowRight, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { tiposService } from '../../services/api'
import styles from './RecursosHome.module.css'

// Mapeo flexible — acepta cualquier nombre que venga de la BD
// Si no coincide ninguno, usa el fallback
function getTipoConfig(nombre) {
  const n = nombre?.toLowerCase().trim()

  if (n?.includes('audio'))
    return {
      icon: Headphones,
      color: '#d4af37',
      gradient: 'linear-gradient(135deg, #b7791f 0%, #744210 100%)',
      desc: 'Escucha libros narrados por expertos',
    }
  if (n?.includes('video'))
    return {
      icon: Video,
      color: '#68d391',
      gradient: 'linear-gradient(135deg, #276749 0%, #1c4532 100%)',
      desc: 'Aprende con contenido visual interactivo',
    }
  if (n?.includes('pdf'))
    return {
      icon: FileText,
      color: '#fc8181',
      gradient: 'linear-gradient(135deg, #9b2c2c 0%, #63171b 100%)',
      desc: 'Documentos y libros en formato PDF',
    }
  if (n?.includes('libro') || n?.includes('book'))
    return {
      icon: BookOpen,
      color: '#63b3ed',
      gradient: 'linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)',
      desc: 'Explora nuestra colección de libros',
    }
  if (n?.includes('texto') || n?.includes('articulo'))
    return {
      icon: File,
      color: '#b794f4',
      gradient: 'linear-gradient(135deg, #553c9a 0%, #322659 100%)',
      desc: 'Artículos y textos académicos',
    }

  return {
    icon: BookOpen,
    color: '#63b3ed',
    gradient: 'linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)',
    desc: 'Explora todos los recursos disponibles',
  }
}

export default function RecursosHome() {
  const { token }     = useAuth()
  const navigate      = useNavigate()
  const [tipos, setTipos]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    tiposService.getAll(token)
      .then(data => setTipos(Array.isArray(data) ? data : data.items ?? []))
      .catch(err  => setError(err.message))
      .finally(()  => setLoading(false))
  }, [token])

  if (loading) return (
    <div className={styles.centerWrap}>
      <Loader size={32} className={styles.spinner} />
      <p>Cargando biblioteca…</p>
    </div>
  )

  if (error) return (
    <div className={styles.centerWrap}>
      <AlertCircle size={32} style={{ color: '#fc8181' }} />
      <p>No se pudieron cargar los recursos</p>
      <span className={styles.errorMsg}>{error}</span>
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Biblioteca Digital</h1>
        <p className={styles.heroSub}>
          Explora nuestra colección de recursos educativos
        </p>
      </div>

      {/* Cards */}
      <div className={styles.grid}>
        {tipos.map(tipo => {
          const cfg   = getTipoConfig(tipo.nombre)
          const Icon  = cfg.icon
          return (
            <button
              key={tipo.id_tipo}
              className={styles.card}
              onClick={() => navigate(`/recursos/${tipo.id_tipo}`)}
              style={{ '--gradient': cfg.gradient, '--accent': cfg.color }}
            >
              {/* Fondo decorativo */}
              <div className={styles.cardBg} />

              <div className={styles.iconWrap}>
                <Icon size={40} />
              </div>

              <h2 className={styles.cardTitle}>
                {tipo.nombre.charAt(0).toUpperCase() + tipo.nombre.slice(1)}
              </h2>

              <p className={styles.cardDesc}>{cfg.desc}</p>

              <div className={styles.cardCta}>
                <span>Ver colección</span>
                <ArrowRight size={15} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}