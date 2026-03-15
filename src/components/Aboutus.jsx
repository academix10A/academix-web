import styles from './Aboutus.module.css'
import { Users, Target, Lightbulb } from 'lucide-react'

const stats = [
  { value: '500+', label: 'Recursos educativos' },
  { value: '3 000+', label: 'Estudiantes activos' },
  { value: '99%', label: 'Disponibilidad' },
]

export default function AboutUs() {
  return (
    <section id="nosotros" className={styles.section}>
      <div className={styles.container}>
        {/* Info lado izquierdo */}
        <div className={styles.info}>
          <span className={styles.eyebrow}>¿Quiénes somos?</span>
          <h2 className={styles.title}>
            Transformamos la forma en que los estudiantes aprenden
          </h2>
          <p className={styles.body}>
            Academix nació de la necesidad real de estudiantes de secundaria y preparatoria
            de contar con una biblioteca digital accesible, organizada y potenciada con
            inteligencia artificial. Somos un equipo apasionado por la educación y la tecnología.
          </p>
          <p className={styles.body}>
            Nuestra plataforma combina una biblioteca virtual estructurada por temas,
            herramientas de estudio colaborativo y asistencia IA contextual para que cada
            estudiante aprenda a su ritmo, en cualquier lugar y en cualquier momento.
          </p>

          <div className={styles.pillars}>
            {[
              { icon: <Target size={20} />, label: 'Misión', text: 'Democratizar el acceso al conocimiento educativo de calidad.' },
              { icon: <Lightbulb size={20} />, label: 'Visión', text: 'Ser la plataforma líder de estudio colaborativo en México.' },
              { icon: <Users size={20} />, label: 'Valores', text: 'Aprendizaje continuo, comunidad e innovación educativa.' },
            ].map(p => (
              <div key={p.label} className={styles.pillar}>
                <div className={styles.pillarIcon}>{p.icon}</div>
                <div>
                  <strong>{p.label}</strong>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.stats}>
            {stats.map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen lado derecho */}
        <div className={styles.imgWrap}>
          <div className={styles.imgDecor} />
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&q=80"
            alt="Estudiantes colaborando"
            className={styles.img}
          />
          <div className={styles.badge}>
            <span className={styles.badgeNum}>10A</span>
            <span className={styles.badgeText}>Grupo desarrollador</span>
          </div>
        </div>
      </div>
    </section>
  )
}