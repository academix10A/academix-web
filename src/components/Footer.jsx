import { BookOpen } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer id="contacto" className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <BookOpen size={22} strokeWidth={1.8} />
          <span>Academix</span>
        </div>
        <p className={styles.copy}>
          © 2026 Academix – Grupo 10A · Universidad Tecnológica de Tijuana
        </p>
        <div className={styles.links}>
          <a href="#membresias">Membresías</a>
          <a href="#nosotros">Nosotros</a>
          <a href="mailto:contacto@academix.edu.mx">Contacto</a>
        </div>
      </div>
    </footer>
  )
}