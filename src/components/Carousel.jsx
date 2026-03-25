import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Carousel.module.css'

const slides = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
    title: 'Biblioteca Virtual',
    sub: 'Miles de recursos educativos a tu alcance',
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80',
    title: 'Aprende Sin Límites',
    sub: 'Accede a contenido desde cualquier dispositivo',
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&q=80',
    title: 'Colabora y Crece',
    sub: 'Comparte notas y estudia en comunidad',
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80',
    title: 'Exámenes de Práctica',
    sub: 'Pon a prueba tu conocimiento por tema',
  },
]

export default function Carousel() {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  const next = () => setCurrent(c => (c + 1) % slides.length)
  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)

  const reset = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 5000)
  }

  useEffect(() => {
    timerRef.current = setInterval(next, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  const handlePrev = () => { prev(); reset() }
  const handleNext = () => { next(); reset() }

  return (
    <section className={styles.carousel}>
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`${styles.slide} ${i === current ? styles.active : ''}`}
          style={{ backgroundImage: `url(${s.img})` }}
        >
          <div className={styles.overlay} />
          <div className={styles.content}>
            <h1 className={styles.title}>{s.title}</h1>
            <p className={styles.sub}>{s.sub}</p>
            <a href="#membresias" className={styles.cta}>Explorar Ahora</a>
          </div>
        </div>
      ))}

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={handlePrev} aria-label="Anterior">
        <ChevronLeft size={28} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={handleNext} aria-label="Siguiente">
        <ChevronRight size={28} />
      </button>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => { setCurrent(i); reset() }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}