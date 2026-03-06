import { Check, Zap, Crown, BookOpen } from 'lucide-react'
import styles from './Memberships.module.css'

const plans = [
  {
    id: 'free',
    icon: <BookOpen size={28} />,
    name: 'Básico',
    price: 'Gratis',
    period: '',
    desc: 'Acceso a la biblioteca y herramientas básicas de estudio.',
    features: [
      'Acceso a biblioteca virtual',
      'Creación de notas personales',
      'Exámenes de práctica',
      'Búsqueda y filtrado de recursos',
      'App móvil (Android)',
    ],
    cta: 'Empezar Gratis',
    highlight: false,
  },
  {
    id: 'premium',
    icon: <Crown size={28} />,
    name: 'Premium',
    price: '$99',
    period: '/mes',
    desc: 'Todo lo del plan Básico más asistencia IA y contenido exclusivo.',
    features: [
      'Todo lo del plan Básico',
      'Asistencia inteligente con IA',
      'Descarga de recursos offline',
      'Contenido exclusivo premium',
      'Historial de consultas IA',
      'Soporte prioritario',
    ],
    cta: 'Obtener Premium',
    highlight: true,
  },
  {
    id: 'institutional',
    icon: <Zap size={28} />,
    name: 'Institucional',
    price: 'Cotizar',
    period: '',
    desc: 'Solución completa para escuelas y centros educativos.',
    features: [
      'Todo lo del plan Premium',
      'Gestión multi-usuario',
      'Panel administrativo',
      'Reportes de progreso grupal',
      'Integración con LMS',
      'Soporte dedicado 24/7',
    ],
    cta: 'Contactar Ventas',
    highlight: false,
  },
]

export default function Memberships() {
  return (
    <section id="membresias" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Membresías</span>
        <h2 className={styles.title}>Elige tu Plan</h2>
        <p className={styles.sub}>Accede al conocimiento al nivel que necesitas</p>
      </div>

      <div className={styles.grid}>
        {plans.map(p => (
          <div key={p.id} className={`${styles.card} ${p.highlight ? styles.highlight : ''}`}>
            {p.highlight && <div className={styles.badge}>Más Popular</div>}

            <div className={styles.iconWrap}>{p.icon}</div>
            <h3 className={styles.planName}>{p.name}</h3>
            <div className={styles.priceRow}>
              <span className={styles.price}>{p.price}</span>
              {p.period && <span className={styles.period}>{p.period}</span>}
            </div>
            <p className={styles.desc}>{p.desc}</p>

            <ul className={styles.features}>
              {p.features.map(f => (
                <li key={f} className={styles.feat}>
                  <Check size={16} className={styles.check} />
                  {f}
                </li>
              ))}
            </ul>

            <a href="#login" className={`${styles.btn} ${p.highlight ? styles.btnGold : ''}`}>
              {p.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}