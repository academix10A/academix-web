import { Link } from 'react-router-dom'
import {
  BookOpen, Star, Award, FileText, BarChart3,
  ChevronRight, TrendingUp, Clock, Target, Zap,
  Settings, LogOut, Shield, Calendar, BookMarked,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import Navbar from '../components/Navbar.jsx'
import styles from './PerfilPage.module.css'

const mockRecentExams = [
  { id: 1, title: 'Matemáticas Básicas I', subtema: 'Álgebra',    questions: 25, score: 88, date: 'Hace 2 días' },
  { id: 2, title: 'Historia Universal',    subtema: 'Edad Media', questions: 30, score: 72, date: 'Hace 5 días' },
  { id: 3, title: 'Biología Celular',      subtema: 'Mitosis',    questions: 20, score: 95, date: 'Hace 1 semana' },
]

const mockActivity = [
  { icon: BookOpen, label: 'Completaste el examen de Álgebra',          time: 'Hace 2 días',   color: 'blue'   },
  { icon: Star,     label: 'Guardaste "Historia del Arte Moderno"',      time: 'Hace 3 días',   color: 'gold'   },
  { icon: FileText, label: 'Accediste a recursos de Biología',           time: 'Hace 5 días',   color: 'green'  },
  { icon: Award,    label: 'Obtuviste 95% en Biología Celular',          time: 'Hace 1 semana', color: 'purple' },
]

const mockProgress = [
  { subject: 'Matemáticas', percent: 78, color: '#4A90D9' },
  { subject: 'Historia',    percent: 62, color: '#D4AF37' },
  { subject: 'Biología',    percent: 91, color: '#48BB78' },
  { subject: 'Química',     percent: 45, color: '#E8834A' },
]

export default function PerfilPage() {
  const { user, logout } = useAuth()

  const displayName  = user ? `${user.nombre ?? ''} ${user.apellido_paterno ?? ''}`.trim() : 'Usuario'
  const initials     = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const email        = user?.email ?? ''
  const membresia    = user?.membresia ?? 'Plan Free'
  const rol          = user?.rol ?? 'Estudiante'
  const esPremium    = rol === 'premium' || rol === 'admin'

  const memberSince  = user?.fecha_registro
    ? new Date(user.fecha_registro).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' })
    : 'Hace 1 mes'

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.inner}>

          {/* ── Hero / Profile Header ── */}
          <header className={styles.hero}>
            <div className={styles.heroDecor} />
            <div className={styles.heroDecor2} />

            <div className={styles.heroContent}>
              {/* Avatar */}
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.avatarRing} />
              </div>

              {/* Info */}
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

              {/* Quick actions */}
              {/* <div className={styles.heroActions}>
                <Link to="/ajustes" className={styles.actionBtn}>
                  <Settings size={16} />
                  <span>Ajustes</span>
                </Link>
                <button className={styles.actionBtnDanger} onClick={logout}>
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div> */}
            </div>
          </header>

          {/* ── Stats Row ── */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="blue"><BarChart3 size={20} /></div>
              <div>
                <span className={styles.statNumber}>12</span>
                <span className={styles.statLabel}>Exámenes realizados</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="gold"><Star size={20} /></div>
              <div>
                <span className={styles.statNumber}>5</span>
                <span className={styles.statLabel}>Favoritos</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="green"><TrendingUp size={20} /></div>
              <div>
                <span className={styles.statNumber}>85%</span>
                <span className={styles.statLabel}>Promedio general</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} data-color="teal"><BookMarked size={20} /></div>
              <div>
                <span className={styles.statNumber}>0</span>
                <span className={styles.statLabel}>Recursos guardados</span>
              </div>
            </div>
          </div>

          {/* ── Main 2-col ── */}
          <div className={styles.mainGrid}>

            {/* LEFT */}
            <div className={styles.leftCol}>

              {/* Recent Exams */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Exámenes recientes</h2>
                  <Link to="/examenes" className={styles.seeAll}>Ver todos <ChevronRight size={14} /></Link>
                </div>
                <div className={styles.examList}>
                  {mockRecentExams.map(exam => (
                    <Link key={exam.id} to={`/examenes/${exam.id}`} className={styles.examRow}>
                      <div className={styles.examRowLeft}>
                        <span className={styles.examBadge}>{exam.subtema}</span>
                        <h3 className={styles.examRowTitle}>{exam.title}</h3>
                        <span className={styles.examMeta}>
                          <Clock size={12} /> {exam.date} · {exam.questions} preguntas
                        </span>
                      </div>
                      <div className={styles.examScore} data-pass={exam.score >= 70}>
                        {exam.score}%
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Activity Feed */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Actividad reciente</h2>
                <div className={styles.activityList}>
                  {mockActivity.map((item, i) => (
                    <div key={i} className={styles.activityRow}>
                      <div className={styles.activityIcon} data-color={item.color}>
                        <item.icon size={16} />
                      </div>
                      <div className={styles.activityText}>
                        <span className={styles.activityLabel}>{item.label}</span>
                        <span className={styles.activityTime}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT */}
            <div className={styles.rightCol}>

              {/* Progress */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Progreso por materia</h2>
                <div className={styles.progressList}>
                  {mockProgress.map(item => (
                    <div key={item.subject} className={styles.progressItem}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressSubject}>{item.subject}</span>
                        <span className={styles.progressPct}>{item.percent}%</span>
                      </div>
                      <div className={styles.progressBarBg}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${item.percent}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Motivational card */}
              <div className={styles.motivCard}>
                <Award size={28} className={styles.motivIcon} />
                <h3 className={styles.motivTitle}>¡Vas muy bien!</h3>
                <p className={styles.motivSub}>
                  Tu promedio está por encima del 80%. Sigue así para mantener tu racha.
                </p>
                <Link to="/examenes" className={styles.motivBtn}>
                  Practicar ahora <ChevronRight size={14} />
                </Link>
              </div>

              {/* Upgrade card */}
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