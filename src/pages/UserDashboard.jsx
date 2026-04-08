import { Link } from 'react-router-dom'
import { BookOpen, Star, Award, FileText, User, BarChart3, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import styles from './UserDashboard.module.css'
import Navbar from '../components/Navbar.jsx'

const mockRecentExams = [
  { id: 1, title: 'Matemáticas Básicas I', subtema: 'Álgebra', questions: 25, icon: BookOpen },
  { id: 2, title: 'Historia Universal', subtema: 'Edad Media', questions: 30, icon: BarChart3 },
]

export default function UserDashboard() {
  const { user } = useAuth()
  const displayName = user?.nombre || user?.email?.split('@')[0] || 'Usuario'
  const membresia = user?.membresia || 'Básica'

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroDecor} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Star size={12} />
              <span>Dashboard</span>
            </div>
            <h1 className={styles.heroTitle}>¡Bienvenido de nuevo!</h1>
            <p className={styles.heroSub}>
              {displayName}, aquí tienes un resumen de tu actividad en Academix.
              {membresia !== 'Básica' && <span className={styles.membresiaBadge}> {membresia}</span>}
            </p>
          </div>
        </header>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <BarChart3 size={24} />
            <div>
              <span className={styles.statNumber}>12</span>
              <span className={styles.statLabel}>Exámenes realizados</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Star size={24} />
            <div>
              <span className={styles.statNumber}>5</span>
              <span className={styles.statLabel}>Favoritos</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Award size={24} />
            <div>
              <span className={styles.statNumber}>85%</span>
              <span className={styles.statLabel}>Progreso general</span>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Acceso rápido</h2>
          <div className={styles.grid}>
            {quickLinks.map((link, i) => (
              <Link key={link.to} to={link.to} className={styles.linkCard}>
                <div className={styles.linkIconWrap}>
                  <link.icon size={28} />
                </div>
                <h3 className={styles.linkTitle}>{link.label}</h3>
                <p className={styles.linkDesc}>{link.desc}</p>
                <ChevronRight size={18} className={styles.linkArrow} />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Exams (mock) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Exámenes recientes</h2>
          <div className={styles.grid}>
            {mockRecentExams.map(exam => (
              <Link key={exam.id} to={`/examenes/${exam.id}`} className={`${styles.card} ${styles.examCard}`}>
                <div className={styles.cardTop}>
                  <span className={styles.cardBadge}>{exam.subtema}</span>
                </div>
                <h3 className={styles.cardTitle}>{exam.title}</h3>
                <div className={styles.cardFooter}>
                  <span>{exam.questions} preguntas</span>
                  <ChevronRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
