import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  BookOpen, Star, Award, FileText, BarChart3,
  ChevronRight, TrendingUp, Clock, Zap,
  Shield, Calendar, BookMarked, Inbox,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import Navbar from '../components/Navbar.jsx'
import styles from './PerfilPage.module.css'
import { homeService} from '../services/api.js'
import { recursosService } from '../services/api.js'
import { usuariosService } from '../services/api.js'

// Helper: convierte fecha ISO a texto relativo
function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days >= 7)  return `Hace ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
  if (days >= 1)  return `Hace ${days} día${days > 1 ? 's' : ''}`
  if (hours >= 1) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`
  return `Hace ${mins} min`
}

// Icono según tipo de item reciente
function iconForTipo(tipo) {
  if (tipo === 'recurso') return { Icon: BookOpen, color: 'green' }
  if (tipo === 'examen')  return { Icon: FileText,  color: 'blue'  }
  return { Icon: Star, color: 'gold' }
}

// Estado vacío reutilizable
function EmptyState({ label }) {
  return (
    <div className={styles.emptyState}>
      <Inbox size={26} className={styles.emptyIcon} />
      <span>{label}</span>
    </div>
  )
}

async function getUserId() {
  const usuario_data = await usuariosService.me()
  const id_usuario = usuario_data.id_usuario
  return id_usuario
}

export default function PerfilPage() {
  const { user } = useAuth()

  const [progresoExamenes, setProgresoExamenes] = useState(null)
  const [recientes,        setRecientes]        = useState([])
  const [recursosLeidos,   setRecursosLeidos]   = useState([])
  const [favoritos,        setFavoritos]        = useState([])
  const [loading,          setLoading]          = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const userId = await getUserId()

        const [progreso, rec, recursos, favs] = await Promise.all([
          homeService.getProgresoExamenes(),
          homeService.getRecientes(),
          homeService.getRecursosLeidos(),
          userId ? recursosService.getFavoritos(userId) : Promise.resolve([]),
        ])

        setProgresoExamenes(progreso)
        setRecientes(rec ?? [])
        setRecursosLeidos(recursos ?? [])
        setFavoritos(favs ?? [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const displayName = user ? `${user.nombre ?? ''} ${user.apellido_paterno ?? ''}`.trim() : 'Usuario'
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const email       = user?.email ?? ''
  const membresia   = user?.membresia ?? 'Plan Free'
  const rol         = user?.rol ?? 'Estudiante'
  const esPremium   = rol === 'premium' || rol === 'admin'

  const memberSince = user?.fecha_registro
    ? new Date(user.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
    : 'Hace 1 mes'

  // Datos derivados de la API
  const totalExamenes = progresoExamenes?.total_examenes_realizados ?? 0
  const promedio      = progresoExamenes?.promedio_calificacion     ?? 0
  const examenesLista = progresoExamenes?.examenes                  ?? []

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>

          {/* ── Hero ── */}
          <header className={styles.hero}>
            <div className={styles.heroDecor} />
            <div className={styles.heroDecor2} />
            <div className={styles.heroContent}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.avatarRing} />
              </div>
              <div className={styles.heroInfo}>
                <div className={styles.heroBadge}>
                  <Shield size={12} />
                  <span>{rol.charAt(0).toUpperCase() + rol.slice(1)}</span>
                </div>
                <h1 className={styles.heroTitle}>{displayName}</h1>
                <p className={styles.heroEmail}>{email}</p>
                <div className={styles.heroMeta}>
                  <span className={styles.heroMetaItem}>
                    <Calendar size={13} />
                    Miembro desde {memberSince}
                  </span>
                  <span className={styles.membresiaBadge} data-premium={esPremium}>
                    {membresia}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ── Stats Row ── */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="blue"><BarChart3 size={20} /></div>
              <div>
                <span className={styles.statNumber}>{loading ? '–' : totalExamenes}</span>
                <span className={styles.statLabel}>Exámenes realizados</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="gold"><Star size={20} /></div>
              <div>
                <span className={styles.statNumber}>{loading ? '–' : favoritos.length}</span>
                <span className={styles.statLabel}>Favoritos</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="green"><TrendingUp size={20} /></div>
              <div>
                <span className={styles.statNumber}>{loading ? '–' : `${promedio}/10`}</span>
                <span className={styles.statLabel}>Promedio general</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="teal"><BookMarked size={20} /></div>
              <div>
                <span className={styles.statNumber}>{loading ? '–' : recursosLeidos.length}</span>
                <span className={styles.statLabel}>Recursos leídos</span>
              </div>
            </div>
          </div>

          {/* ── Main 2-col ── */}
          <div className={styles.mainGrid}>

            {/* LEFT */}
            <div className={styles.leftCol}>

              {/* Exámenes recientes */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Exámenes recientes</h2>
                  <Link to="/examenes" className={styles.seeAll}>
                    Ver todos <ChevronRight size={14} />
                  </Link>
                </div>
                <div className={styles.examList}>
                  {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                  ) : examenesLista.length === 0 ? (
                    <EmptyState label="Aún no has realizado ningún examen." />
                  ) : examenesLista.map(exam => (
                    <div key={exam.id_examen} className={styles.examRow}>
                      <div className={styles.examRowLeft}>
                        <h3 className={styles.examRowTitle}>{exam.titulo}</h3>
                        <span className={styles.examMeta}>
                          <Clock size={12} /> {timeAgo(exam.fecha)}
                        </span>
                      </div>
                      <div className={styles.examScore} data-pass={exam.calificacion >= 6}>
                        {exam.calificacion}/10
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actividad reciente */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Actividad reciente</h2>
                <div className={styles.activityList}>
                  {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                  ) : recientes.length === 0 ? (
                    <EmptyState label="No hay actividad reciente." />
                  ) : recientes.map(item => {
                    const { Icon, color } = iconForTipo(item.tipo)
                    const href = item.tipo === 'recurso'
                      ? `/recursos/ver/${item.id}`
                      : `/examenes/${item.id}`
                    return (
                      <Link key={item.id_vista} to={href} className={styles.activityRow}>
                        <div className={styles.activityIcon} data-color={color}>
                          <Icon size={16} />
                        </div>
                        <div className={styles.activityText}>
                          <span className={styles.activityLabel}>{item.titulo}</span>
                          <span className={styles.activityTime}>
                            {item.descripcion} · {timeAgo(item.fecha_vista)}
                          </span>
                        </div>
                        <ChevronRight size={14} className={styles.activityArrow} />
                      </Link>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className={styles.rightCol}>

              {/* Recursos leídos */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Recursos leídos</h2>
                <div className={styles.progressList}>
                  {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                  ) : recursosLeidos.length === 0 ? (
                    <EmptyState label="No has leído ningún recurso aún." />
                  ) : recursosLeidos.map(r => (
                    <Link
                      key={r.id_recurso}
                      to={`/recursos/ver/${r.id_recurso}`}
                      className={styles.progressItem}
                    >
                      <div className={styles.progressHeader}>
                        <span className={styles.progressSubject}>{r.titulo}</span>
                        <span className={styles.progressPct}>{r.porcentaje_leido}%</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div
                          className={styles.progressBarFill}
                          style={{
                            width: `${r.porcentaje_leido}%`,
                            background: r.completado ? '#48BB78' : '#4A90D9',
                          }}
                        />
                      </div>
                      {r.completado && (
                        <span className={styles.completadoBadge}>✓ Completado</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>

              {/* Favoritos */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Recursos favoritos</h2>
                <div className={styles.favList}>
                  {loading ? (
                    <p className={styles.loadingText}>Cargando...</p>
                  ) : favoritos.length === 0 ? (
                    <EmptyState label="No tienes recursos favoritos aún." />
                  ) : favoritos.map(fav => (
                    <Link
                      key={fav.id_recurso}
                      to={`/recursos/ver/${fav.id_recurso}`}
                      className={styles.favRow}
                    >
                      <div className={styles.favIcon}>
                        <Star size={15} />
                      </div>
                      <div className={styles.favText}>
                        <span className={styles.favTitle}>{fav.titulo}</span>
                        <span className={styles.favDesc}>{fav.descripcion}</span>
                      </div>
                      <ChevronRight size={14} className={styles.favArrow} />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Motivacional dinámico */}
              <div className={styles.motivCard}>
                <Award size={28} className={styles.motivIcon} />
                <h3 className={styles.motivTitle}>
                  {promedio >= 7 ? '¡Vas muy bien!' : '¡Sigue practicando!'}
                </h3>
                <p className={styles.motivSub}>
                  {promedio >= 7
                    ? 'Tu promedio es bueno. Sigue así para mantener tu racha.'
                    : 'Practica más exámenes para mejorar tu promedio.'}
                </p>
                <Link to="/examenes" className={styles.motivBtn}>
                  Practicar ahora <ChevronRight size={14} />
                </Link>
              </div>

              {/* Upgrade */}
              {!esPremium && (
                <div className={styles.upgradeCard}>
                  <Zap size={22} className={styles.upgradeIcon} />
                  <div>
                    <p className={styles.upgradeTitle}>Actualiza tu plan</p>
                    <p className={styles.upgradeSub}>Accede a exámenes avanzados e IA.</p>
                  </div>
                  <Link to="/membresias" className={styles.upgradeBtn}>Ver planes</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}